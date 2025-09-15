import express from "express";
import { updateProfile } from "../controllers/authController.js";
import User from "../models/User.js";  // ✅ apna User model import karo
import { verifyToken } from "../middleware/authMiddleware.js"; // 🔹 agar JWT use karte ho
import { signup, login, getProfile, logout, updateProfile, authMiddleware } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/logout", authMiddleware, logout);

// ✅ Debug route
router.get("/test", (req, res) => {
  res.json({ message: "Auth route working ✅" });
});
// ✅ Update Profile API
router.put("/update", verifyToken, async (req, res) => {
  try {
    const { username, bio, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // 🔹 verifyToken se aayega
      { username, bio, email },
      { new: true }
    );

    res.json({
      message: "Profile updated successfully ✅",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Update profile route
router.put("/update", authMiddleware, updateProfile);

export default router;
