import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';
import path, { dirname } from 'path';
import { connectDB } from './lib/db.js';
import { fileURLToPath } from 'url';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();
const app = express();

// ES module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser()); // Needed to read JWT cookies

// Routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);

// Handle 404 for unknown API routes
app.all('/api/*', (_, res) => {
  res.status(404).json({
    success: false,
    status: 'fail',
    message: 'API route not found',
  });
});

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Global error handler (must come last)
app.use(errorHandler);

// Connect to DB and start server
connectDB()
  .then(() => {
    const server = app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });

    // Gracefully handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION 💥 Shutting down...', err);
      server.close(() => process.exit(1));
    });
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });

// Handle uncaught exceptions (sync errors)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION 💥 Shutting down...', err);
  process.exit(1);
});
