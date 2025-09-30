import { AppError } from "../utils/AppError.js";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    const message = err.errors
      ? err.errors.map((e) => e.message).join(", ")
      : err.message;
    throw new AppError(message, 400);
  }
};

export default validate;
