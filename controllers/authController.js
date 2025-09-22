import User from "../models/User.js";
import jwt from "jsonwebtoken";

// 🔹 Generate JWT and set httpOnly cookie
export const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,                   // HTTPS only in production
    sameSite: isProd ? "None" : "Lax", // Lax for local dev, None for prod
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
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

    generateToken(res, user._id); // ✅ Set cookie

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
      generateToken(res, user._id); // ✅ Set cookie

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
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    // ✅ Update text fields
    if (req.body.username) user.username = req.body.username;
    if (req.body.bio) user.bio = req.body.bio;

    // ✅ Update profilePic if uploaded via multer + Cloudinary
    if (req.file && req.file.path) {
      user.profilePic = req.file.path;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated ✅",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profilePic: user.profilePic || "",
      },
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: err.message });
  }
};
