import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Signup
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // ✅ Cookie for local + deployed (cross-site)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only HTTPS in prod
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // cross-site in prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Auth Middleware
export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token, unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout
export const logout = async (req, res) => {
  res.clearCookie("token", {
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
};
