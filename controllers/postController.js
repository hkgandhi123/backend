import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";

// 🟢 GET all posts (latest first)
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error("❌ getPosts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// 🟢 CREATE post (supports file upload or image URL)
export const createPost = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    let imageUrl = req.body.image || null;
    let imagePublicId = null;

    // ✅ If user uploaded file → upload to Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "posts",
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    if (!imageUrl)
      return res.status(400).json({ message: "Image is required" });

    const newPost = new Post({
      user: req.user._id,
      caption: req.body.caption || "",
      type: req.body.type || "post",
      image: imageUrl,
      imagePublicId,
    });

    await newPost.save();
    await newPost.populate("user", "username profilePic");

    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    console.error("❌ createPost error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

// 🟡 UPDATE post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // ✅ Update caption
    if (req.body.caption) post.caption = req.body.caption;

    // ✅ Update image (upload new or use direct link)
    if (req.file) {
      // Delete old image from Cloudinary (if exists)
      if (post.imagePublicId)
        await cloudinary.uploader.destroy(post.imagePublicId);

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "posts",
      });
      post.image = result.secure_url;
      post.imagePublicId = result.public_id;
    } else if (req.body.image) {
      post.image = req.body.image;
      post.imagePublicId = null;
    }

    await post.save();
    res.status(200).json({ success: true, post });
  } catch (err) {
    console.error("❌ updatePost error:", err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

// 🔴 DELETE post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // ✅ Delete image from Cloudinary (if exists)
    if (post.imagePublicId)
      await cloudinary.uploader.destroy(post.imagePublicId);

    await post.deleteOne();
    res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("❌ deletePost error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
