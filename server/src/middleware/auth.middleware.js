import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const protectRoute = catchAsync(async (req, res, next) => {
  const token =
    req.cookies?.jwt ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) throw new AppError("Not authorized, no token provided", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, ENV.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new AppError("Token expired, please log in again", 401);
    }
    throw new AppError("Invalid token", 401);
  }

  const user = await User.findById(decoded.userId).select("-password");
  if (!user) throw new AppError("Not authorized, user not found", 401);

  req.user = user;
  next();
});
