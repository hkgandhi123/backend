import Post from "../models/Post.js";

// 🔹 Create Post (caption + optional image)
export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    const newPost = new Post({
      user: req.user.id,
      caption,
      image: req.file ? `/uploads/${req.file.filename}` : null, // optional
    });

    await newPost.save();
    res.status(201).json({ message: "Post created ✅", post: newPost });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Get All Posts (public feed)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Get My Posts (only logged-in user)
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Like / Unlike Post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({
      message: "Like updated ✅",
      likes: post.likes.length,
      post, // send updated post also
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
