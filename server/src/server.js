import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import authRouter from "./routes/auth.router.js";
import messageRouter from "./routes/message.route.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import mongoSanitize from "express-mongo-sanitize";
import { ENV } from "./lib/env.js";

const __dirname = path.resolve();

dotenv.config();
const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());

//middleware to parse JSON request bodies
app.use(express.json());
// remove any keys that start with $ or contain . from user input
app.use(mongoSanitize());

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


if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
  });
}

//  Global error handler must come after routes
app.use(errorHandler);

const PORT = ENV.PORT || 5000;
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${ENV.PORT}`);
    });

    // handle unhandled rejection safely eg db disconnect
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION 💥 Shutting down...", err);
      server.close(() => process.exit(1));
    });

    process.on("SIGTERM", () => {
      console.info("SIGTERM received. Shutting down gracefully.");
      server.close(() => process.exit(0));
    });
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
