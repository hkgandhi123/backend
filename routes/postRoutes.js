// backend/routes/posts.js
import express from "express";
import Post from "../models/Post.js";
import { deletePost } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js"; // use this

const router = express.Router();

// GET all posts
router.get("/", protect, async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a post (only owner)
router.delete("/:id", protect, deletePost); // use protect here

export default router;
