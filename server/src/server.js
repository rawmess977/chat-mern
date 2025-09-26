import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import authRouter from "./routes/auth.router.js";
import messageRouter from "./routes/message.route.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import mongoSanitize from 'express-mongo-sanitize'
dotenv.config();
const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());

//middleware to parse JSON request bodies
app.use(express.json());
// remove any keys that start with $ or contain . from user input
app.use(mongoSanitize())

// Routes
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

// Handle 404 for unknown API routes *before* global error handler
app.all("/api/*", (_, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});


// Production: serve frontend build + SPA fallback
if (process.env.NODE_ENV === "production") {
  
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  console.log(__dirname);
  app.use(express.static(path.join(__dirname, "../client/dist"))); //“Hey, serve everything in the client/dist folder as static files (JS, CSS, images).” This is where your built React app lives after npm run build.Serves static files in production and handles SPA fallback

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html")); //👉 If the request is NOT an API route (like /api/users), just send back index.html.
  });
}

//  Global error handler must come after routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });

    // handle unhandled rejection safely eg db disconnect
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION 💥 Shutting down...", err);
      server.close(() => process.exit(1));
    });
    
    process.on("SIGTERM", ()=>{
      console.info("SIGTERM received. Shutting down gracefully.");
      server.close(()=>process.exit(0));
    })
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });

// Handle uncaught exceptions (synchronous errors)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥 Shutting down...", err);
  process.exit(1);
});
