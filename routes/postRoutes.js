import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Post from "../models/Post.js";

const router = express.Router();

// 🔹 Get all posts
router.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error("Posts Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 Create post
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.create({ content, user: req.user._id });
    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
