import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // ✅ sahi import
import Post from "../models/Post.js";

const router = express.Router();

// Profile page → user ke khud ke posts
router.get("/my-posts", protect, async (req, res) => {
  try {
    console.log("👤 Auth user:", req.user);

    const posts = await Post.find({ user: req.user._id }) // ✅ req.user._id use karo
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("❌ My-posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Feed page → sabhi posts
router.get("/", protect, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("❌ Feed error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
