import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import fs from "fs";
import path from "path";

// 🔹 Multer setup (disk storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
export const upload = multer({ storage });

// 🔹 Create Post
export const createPost = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      // Upload to Cloudinary using file path
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "posts",
      });
      imageUrl = result.secure_url;

      // Delete local file after upload
      fs.unlinkSync(req.file.path);
    }

    const post = await Post.create({
      user: req.user._id,
      caption: req.body.caption || "",
      image: imageUrl,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get all posts (public feed)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");
    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get my posts
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Get my posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Like / Unlike post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const likedIndex = post.likes.indexOf(req.user._id);
    if (likedIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likedIndex, 1);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Delete Post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
