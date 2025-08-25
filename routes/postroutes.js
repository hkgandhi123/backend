import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Post from "../models/Post.js";
import { upload, uploadToCloudinary } from "../middleware/upload.js";

const router = Router();

// Create Post (image upload)
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    // Upload image to cloudinary
    const result = await uploadToCloudinary(req.file.buffer);

    // Create post in MongoDB
    const post = await Post.create({
      imageUrl: result.secure_url, // cloudinary URL
      caption: req.body.caption || "", // optional text
      user: req.user._id, // user ID (requireAuth middleware se)
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Post create error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
