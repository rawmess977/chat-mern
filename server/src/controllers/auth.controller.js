import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeMail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    generateToken(savedUser._id, res);

    res.status(201).json({
      user: {
        _id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        profilePic: savedUser.profilePic || null,
      },
    });

    sendWelcomeMail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL).catch(
      (error) => console.error("Failed to send welcome email:", error)
    );
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if(!email || !password){
      return res.status(400).json({message: "Email and Password are required"})
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(403).json({ error: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic || null,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (_, res) => {
  res.cookie("jwt", "", {
    // httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    // sameSite: "strict",
    maxAge: 0,
  });
  res.status(200).json({ message: "Logged out successfully" });
};
