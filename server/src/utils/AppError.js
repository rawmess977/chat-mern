export class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Call built-in Error constructor → gives the "message" property

    this.statusCode = statusCode; 
    // Example: 404, 500, 401 etc.

    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // Status is a semantic label for the client
    // 4xx → client error → fail
    // 5xx → server error → error

    this.isOperational = true; 
    // Flag → helps distinguish between:
    //   - operational errors (expected: invalid input, not found, etc.)
    //   - programming bugs (undefined variable, logic errors)
    // Error handler middleware can act differently based on this flag.

    Error.captureStackTrace(this, this.constructor);
    // Captures stack trace but skips constructor frame itself.
    // Useful for debugging without noise.
  }
}
