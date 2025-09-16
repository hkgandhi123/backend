import express from "express";
import multer from "multer";
import { authMiddleware } from "../controllers/authController.js"; 
import Post from "../models/Post.js";

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload a new post
router.post("/upload", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Image required" });

    const newPost = await Post.create({
      user: req.user.id,
      imageUrl: `/uploads/${req.file.filename}`,
      caption: req.body.caption || "",
    });

    res.status(201).json({ success: true, message: "Post uploaded ✅", post: newPost });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get posts of logged-in user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");
    res.json({ success: true, posts });
  } catch (err) {
    console.error("❌ Fetch my posts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all posts (feed)
router.get("/all", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");

    res.json({ success: true, posts });
  } catch (err) {
    console.error("❌ Fetch all posts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Test route to verify deployment
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Posts routes are working ✅" });
});

export default router;
