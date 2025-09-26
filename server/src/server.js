import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.router.js';
import messageRouter from './routes/message.route.js';
import path from 'path';
import { connectDB } from './lib/db.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
console.log(__filename)
const __dirname = dirname(__filename);
console.log(__dirname)


//middleware to parse JSON request bodies
app.use(express.json()); 

// Routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);


// Handle 404 for unknown API routes *before* global error handler
app.all('/api/*', (_, res)=>{
  res.status(404).json({
    success: false,
    message: "API route not found"
  })
})

// Production: serve frontend build + SPA fallback
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../client/dist"))); //“Hey, serve everything in the client/dist folder as static files (JS, CSS, images).” This is where your built React app lives after npm run build.Serves static files in production and handles SPA fallback
  
  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html")); //👉 If the request is NOT an API route (like /api/users), just send back index.html.
  } );
}

//  Global error handler must come after routes
app.use(errorHandler);

connectDB().then(() => {
  const server =  app.listen(process.env.PORT, () => {
    console.log(`✅ Server running on port ${process.env.PORT}`);
  });


  // handle unhandled rejection safely eg db disconnect
  process.on('unhandledRejection',(err)=>{
    console.error('UNHANDLED REJECTION 💥 Shutting down...', err)
    server.close(()=>process.exit(1))
  })
  
}).catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
  
  // Handle uncaught exceptions (synchronous errors)
  process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION 💥 Shutting down...', err);
  process.exit(1);
});