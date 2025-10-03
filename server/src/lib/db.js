import mongoose from "mongoose";
import logger from "./logger.js";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    logger.info("✅ MongoDB connected successfully");
  } catch (err) {
    logger.error(`❌ MongoDB connection failed: ${err}`);
    throw err;
  }
};
