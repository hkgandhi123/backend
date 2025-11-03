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
    console.log("📥 Incoming POST request...");
    console.log("User:", req.user?._id);
    console.log("File:", req.file);
    console.log("Body:", req.body);

    const { title, subtitle, content } = req.body;

    // ✅ Auth check
    if (!req.user) {
      console.error("❌ Missing user in request (check auth middleware)");
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    // ✅ Prevent empty posts
    if (!content && !title && !req.file) {
      console.error("❌ Empty post content");
      return res.status(400).json({ message: "Post content is empty" });
    }

    // ✅ Upload to Cloudinary (if file is attached)
    let mediaUrl = "";
    let mediaType = "";

    if (req.file?.path) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "mern_posts",
        resource_type: "auto",
      });

      mediaUrl = uploadResult.secure_url;
      mediaType = uploadResult.resource_type;

      // ✅ Delete local temp file to save space
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      console.log("☁️ Uploaded to Cloudinary:", mediaUrl);
    }

    // ✅ Save post in MongoDB
    const newPost = new Post({
      user: req.user._id,
      title,
      subtitle,
      content,
      mediaUrl,
      mediaType,
    });

    await newPost.save();
    console.log("✅ Post saved successfully:", newPost);

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("❌ Server error in createPost:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};



/* ------------------ Get All Posts (with Follow Status) ------------------ */
export const getAllPosts = async (req, res) => {
  try {
    // ✅ Logged-in user ID from protect middleware
    const currentUserId = req.user?._id?.toString();

    // ✅ Fetch all posts and populate the user info
    const posts = await Post.find()
      .populate("user", "username profilePic followers")
      .sort({ createdAt: -1 });

    // ✅ Add `isFollowing` for each post’s user
    const modifiedPosts = posts.map((post) => {
      const postObj = post.toObject();

      const isFollowing = post.user?.followers?.some(
        (followerId) => followerId.toString() === currentUserId
      );

      return {
        ...postObj,
        user: {
          ...postObj.user,
          isFollowing: !!isFollowing,
        },
      };
    });

    res.status(200).json({ success: true, posts: modifiedPosts });
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
