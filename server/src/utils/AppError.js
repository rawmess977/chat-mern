export class AppError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;

         // Mark operational errors (vs. programming bugs)
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}