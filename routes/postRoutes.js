import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import Post from "../models/Post.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Create post
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "posts",
    });

    const newPost = await Post.create({
      user: req.user.id,
      caption: req.body.caption,
      image: result.secure_url,
    });

    res.status(201).json({ post: newPost });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
