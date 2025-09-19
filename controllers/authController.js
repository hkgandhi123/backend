import User from "../models/User.js";
import jwt from "jsonwebtoken";

// 🔹 Generate JWT and set cookie
export const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

// 🔹 Signup
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required ❌" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists ❌" });

    const user = await User.create({ username, email, password });
    generateToken(res, user._id);

    res.status(201).json({
      success: true,
      message: "Signup successful ✅",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profilePic: user.profilePic || "",
      },
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
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          bio: user.bio || "",
          profilePic: user.profilePic || "",
        },
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
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized ❌" });
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        bio: req.user.bio || "",
        profilePic: req.user.profilePic || "",
      },
    });
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Update Profile
export const updateProfile = async (req, res) => {
  try {
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized ❌" });

    const { username, bio } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (bio) updates.bio = bio;

    if (req.file && req.file.path) {
      updates.profilePic = req.file.path; // ✅ Cloudinary se URL
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found ❌" });

    res.json({
      success: true,
      message: "Profile updated ✅",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio || "",
        profilePic: updatedUser.profilePic || "",
      },
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
