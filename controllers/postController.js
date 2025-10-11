import Post from "../models/Post.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";

// Create post/reel
export const createPost = async (req, res) => {
  try {
    const { caption, type } = req.body;
    if (!req.file) return res.status(400).json({ message: "Image is required ❌" });

    // Save image path
    const imagePath = "/uploads/" + req.file.filename;

    // Create post
    const post = await Post.create({
      user: req.user._id,
      caption,
      type: type || "post",
      image: imagePath,
    });

    // Populate user info
    await post.populate("user", "username profilePic");

    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error("Error in createPost:", err);
    res.status(500).json({ message: err.message });
  }
};
