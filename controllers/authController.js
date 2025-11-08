import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ------------------ Generate JWT Cookie ------------------ */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

/* ------------------ Signup ------------------ */
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields required ❌" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists ❌" });

    const user = await User.create({ username, email, password });
    const token = generateToken(res, user._id);

    res.status(201).json({
      success: true,
      message: "Signup successful ✅",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profilePic: user.profilePic || "",
      },
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
};

/* ------------------ Login ------------------ */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required ❌" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials ❌" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials ❌" });

    const token = generateToken(res, user._id);

    res.json({
      success: true,
      message: "Login successful ✅",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profilePic: user.profilePic || "",
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
};

/* ------------------ ✅ GOOGLE LOGIN ------------------ */
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google Token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    // Create user if not exists
    if (!user) {
      user = await User.create({
        username: name,
        email,
        profilePic: picture,
        password: null, // Google users no password
      });
    }

    // Create JWT cookie
    const jwtToken = generateToken(res, user._id);

    res.json({
      success: true,
      message: "Google login successful ✅",
      token: jwtToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic || "",
        bio: user.bio || "",
      },
    });
  } catch (err) {
    console.error("❌ Google Auth error:", err.message);
    res.status(400).json({ message: "Invalid Google token ❌" });
  }
};

/* ------------------ Logout ------------------ */
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.json({ success: true, message: "Logged out ✅" });
};

/* ------------------ Get Profile ------------------ */
export const getProfile = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized ❌" });

    res.json({
      success: true,
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        bio: req.user.bio || "",
        profilePic: req.user.profilePic || "",
      },
    });
  } catch (err) {
    console.error("❌ GetProfile error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
};

/* ------------------ Reset Password ------------------ */
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters ❌" });

    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "User not found ❌" });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated ✅" });
  } catch (err) {
    console.error("❌ ResetPassword error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
};

/* ------------------ Update Profile ------------------ */
export const updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "User not found ❌" });

    if (username) user.username = username;
    if (bio) user.bio = bio;

    if (req.file) user.profilePic = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: "Profile updated ✅",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profilePic: user.profilePic || "",
      },
    });
  } catch (err) {
    console.error("❌ UpdateProfile error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
};
