import fs from "fs";
import path from "path";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

/* ------------------ Cloudinary Config ------------------ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ------------------ Create Post ------------------ */
export const createPost = async (req, res) => {
  try {
    console.log("🟢 [POST] /posts triggered");
    console.log("📦 req.body:", req.body);
    console.log("📸 req.file:", req.file);

    // ✅ Check login
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ message: "Please login before creating a post ❌" });
    }

    const { title, subtitle, content } = req.body;

    // ✅ Validation
    if (!title && !content && !req.file) {
      return res
        .status(400)
        .json({ message: "Post must contain text or media ❌" });
    }

    // ✅ Upload media if exists
    let mediaUrl = "";
    if (req.file?.path) {
      try {
        console.log("☁️ Uploading file to Cloudinary...");
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "mern_posts",
          resource_type: "auto",
        });
        mediaUrl = uploadResult.secure_url;
        console.log("✅ Uploaded:", mediaUrl);
      } catch (err) {
        console.error("❌ Cloudinary upload error:", err.message);
        return res
          .status(500)
          .json({ message: "Media upload failed ❌", error: err.message });
      } finally {
        if (req.file?.path && fs.existsSync(req.file.path))
          fs.unlinkSync(req.file.path);
      }
    }

    // ✅ Save to DB
    const newPost = await Post.create({
      user: req.user._id,
      title: title?.trim() || "",
      subtitle: subtitle?.trim() || "",
      content: content?.trim() || "",
      media: mediaUrl,
    });

    await newPost.populate("user", "username profilePic");

    res.status(201).json({
      success: true,
      message: "Post created successfully ✅",
      post: newPost,
    });
  } catch (err) {
    console.error("🔥 CreatePost error:", err);
    res.status(500).json({
      message: "Internal Server Error ❌",
      error: err.message || err,
    });
  }
};


/* ------------------ Get All Posts ------------------ */
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    console.error("❌ GetAllPosts error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
};

/* ------------------ Update Post ------------------ */
export const updatePost = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ message: "Please login before updating a post ❌" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found ❌" });
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized ❌" });
    }

    const { title, subtitle, content } = req.body;
    if (title) post.title = title;
    if (subtitle) post.subtitle = subtitle;
    if (content) post.content = content;

    if (req.file?.path) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "mern_posts",
        resource_type: "auto",
      });
      post.media = uploadResult.secure_url;
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }

    await post.save();
    await post.populate("user", "username profilePic");

    res.json({
      success: true,
      message: "Post updated successfully ✅",
      post,
    });
  } catch (err) {
    console.error("❌ UpdatePost error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
};

/* ------------------ Delete Post ------------------ */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found ❌" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete ❌" });
    }

    // ✅ Delete from Cloudinary if exists
    if (post.media?.includes("cloudinary")) {
      try {
        const publicId = post.media.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`mern_posts/${publicId}`);
        console.log("🗑️ Cloudinary asset deleted:", publicId);
      } catch (err) {
        console.warn("⚠️ Cloudinary delete skipped:", err.message);
      }
    }

    await post.deleteOne();
    res.json({ success: true, message: "Post deleted successfully ✅" });
  } catch (err) {
    console.error("❌ DeletePost error:", err.message);
    res.status(500).json({ message: "Server error ❌" });
  }
};
