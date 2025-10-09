import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import Post from "../models/Post.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Create post
router.post("/posts", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    // Upload image to Cloudinary
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
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
