import { AppError } from "../utils/AppError.js";
import { ENV } from './../lib/env.js';

export const errorHandler = (err, req, res, next) => {
  if (!(err instanceof AppError)) {
    console.error("❌ UNEXPECTED ERROR:", err);
    err = new AppError(err.message || "Something went wrong", err.statusCode || 500);
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
