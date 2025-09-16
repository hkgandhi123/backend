import express from "express";
import multer from "multer";
import { authMiddleware } from "../controllers/authController.js";
import Post from "../models/Post.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Upload post
router.post("/upload", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required ❌" });
    }

    const newPost = await Post.create({
      user: req.user.id,
      imageUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
      caption: req.body.caption || "",
    });

    res.status(201).json({
      message: "Post uploaded ✅",
      post: newPost,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my posts
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get posts of any user (future use)
router.get("/user/:id", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
