import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const {JWT_SECRET} = ENV;
  console.log(JWT_SECRET);
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // XSS attack protection
    sameSite: "strict", //CSRF attack protection
    secure: ENV.NODE_ENV === "development" ? false : true,
  });

  return token;
};
