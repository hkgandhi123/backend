import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import Post from "../models/Post.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Routes
router.post("/upload", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required ❌" });

    const newPost = new Post({
      user: req.user.id,
      image: `/uploads/${req.file.filename}`,
      caption: req.body.caption || "",
    });

    await newPost.save();
    res.json({ success: true, post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/my-posts", protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
