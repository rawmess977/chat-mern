import { AppError } from "../utils/AppError.js";
import { ENV } from "../lib/env.js";
import logger from "../lib/logger.js";

export const errorHandler = (err, req, res, next) => {
  if (!(err instanceof AppError)) {
    logger.error(`❌ UNEXPECTED ERROR: ${err.stack || err}`);
    err = new AppError(err.message || "Something went wrong", err.statusCode || 500);
  } else {
    if (err.statusCode >= 500) {
      logger.error(`❌ SERVER ERROR: ${err.message}`);
    } else {
      logger.warn(`⚠️ CLIENT ERROR: ${err.message}`);
    }
  }

  const statusCode = err.statusCode;
  const environment = ENV.NODE_ENV || "development";

  const response = {
    success: false,
    status: err.status,
    message: err.message,
  };

  if (environment === "development") {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(statusCode).json(response);
};

