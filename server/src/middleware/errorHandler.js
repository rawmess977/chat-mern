import { ENV } from "../lib/env.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // If headers are already sent, delegate to Express’ default handler
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      ENV.NODE_ENV === "production"
        ? "Something went wrong, please try again later."
        : err.message, // don’t leak details in prod
    stack: ENV.NODE_ENV === "production" ? undefined : err.stack,
  });
};
