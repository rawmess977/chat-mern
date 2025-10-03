import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeMail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";
import { AppError } from "../utils/AppError.js";
import cloudinary from './../lib/cloudinary.js';

// SIGNUP
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new AppError("Email already in use", 409);

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    fullName,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  generateToken(newUser._id, res);

  res.status(201).json({
    success: true,
    status: "success",
    data: {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic || null,
    },
  });

  sendWelcomeMail(newUser.email, newUser.fullName, ENV.CLIENT_URL).catch(
    (err) => console.error("❌ Failed to send welcome email:", err)
  );
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new AppError("Email and Password are required", 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError("Invalid credentials", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  generateToken(user._id, res);

  res.status(200).json({
    success: true,
    status: "success",
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic || null,
    },
  });
};

// LOGOUT
export const logout = async (_, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });

  res.status(200).json({
    success: true,
    status: "success",
    message: "Logged out successfully",
  });
};

// update profile pic

export const updateProfile = async(req,res) => {
  try {
    const {profilePic} = req.body;
    if(!profilePic) throw new AppError("Profile picture URL is required", 400);

    const userId = req.user._id;
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new: true});

    res.status(200).json({
      success: true,
      status: "success",
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic || null,
      },
    });

  } catch (error) {
    console.log("Error updating profile picture:", error);
    throw new AppError("Failed to update profile picture", 500);
  }
}