// controllers/postController.js
import Post from "../models/Post.js";

// Upload post
export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const newPost = await Post.create({
      caption,
      image: `/uploads/${req.file.filename}`, // multer se file aayegi
      user: req.user.id,
    });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user posts
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
