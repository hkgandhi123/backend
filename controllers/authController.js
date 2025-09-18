import User from "../models/User.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES Modules __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Generate JWT and set cookie
export const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
};

// 🔹 Auth middleware to protect routes
export const protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied ❌" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(404).json({ message: "User not found ❌" });
    next();
  } catch (err) {
    console.error("❌ JWT verify error:", err);
    res.status(401).json({ message: "Token is not valid ❌" });
  }
};

// 🔹 Signup
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required ❌" });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists ❌" });

    const user = await User.create({ username, email, password });
    generateToken(res, user._id);

    res.status(201).json({
      success: true,
      message: "Signup successful ✅",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      return res.json({
        success: true,
        message: "Login successful ✅",
        user: { id: user._id, username: user.username, email: user.email },
      });
    }
    res.status(401).json({ message: "Invalid email or password ❌" });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Get Profile
export const getProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized ❌" });
    res.json({ success: true, user: req.user });
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Update Profile
export const updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized ❌" });

    const { username, email, bio } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (bio) updates.bio = bio;

    // Handle profile picture if uploaded
    if (req.file) {
      const uploadDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      // Delete old profile pic
      if (req.user.profilePic) {
        const oldPath = path.join(__dirname, "..", req.user.profilePic);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      updates.profilePic = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");

    res.json({ success: true, message: "Profile updated ✅", user: updatedUser });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
