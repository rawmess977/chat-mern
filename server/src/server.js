import express from 'express';
import cookieParser from 'cookie-parser';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';

import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import logger from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';

const app = express();
const PORT = ENV.PORT;

// ES module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser());

// HTTP request logging
app.use(morgan('dev', {
  stream: { write: message => logger.info(message.trim()) },
}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);

// Handle 404
app.all('/api/*', (_, res) => {
  logger.warn('404 - API route not found');
  res.status(404).json({
    success: false,
    status: 'fail',
    message: 'API route not found',
  });
});

// Serve frontend in production
if (ENV.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Global error handler
app.use(errorHandler);

// Connect DB and start server
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      logger.error(`UNHANDLED REJECTION 💥 Shutting down... ${err}`);
      server.close(() => process.exit(1));
    });
  })
  .catch(err => {
    logger.error(`DB connection failed: ${err}`);
    process.exit(1);
  });

process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION 💥 Shutting down... ${err}`);
  process.exit(1);
});
