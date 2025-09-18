// routes/postRoutes.js
import express from "express";
import Post from "../models/Post.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Upload a post
router.post("/upload", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required ❌" });
    }

    const newPost = new Post({
      user: req.user._id,
      image: `/uploads/${req.file.filename}`,
      caption: req.body.caption || "",
    });

    await newPost.save();
    res.json({ success: true, post: newPost });
  } catch (err) {
    console.error("❌ Upload error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get all posts
router.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    console.error("❌ Fetch posts error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get logged-in user's posts
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    console.error("❌ My posts error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
