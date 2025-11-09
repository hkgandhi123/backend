import Post from "../models/Post.js";
import { v2 as cloudinary } from "cloudinary";

/* ------------------ Cloudinary Config ------------------ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ------------------ CLEAN PROFANITY ------------------ */
function cleanBadWords(text) {
  if (!text) return text;
  const badWords = [
    "fuck", "fucking", "shit", "bitch", "asshole",
    "chutiya", "madarchod", "bhenchod", "harami"
  ];
  let cleaned = text;
  badWords.forEach(word => {
    const regex = new RegExp(word, "gi");
    cleaned = cleaned.replace(regex, word[0] + "***");
  });
  return cleaned;
}

/* ------------------ SPAM CHECK ------------------ */
function isSpammy(text) {
  if (!text) return false;
  if (/(.)\1{5,}/.test(text)) return true;
  if (text.toLowerCase().includes("buy now")) return true;
  if (text.length > 6000) return true;
  return false;
}

/* ------------------ CREATE POST ------------------ */
export const createPost = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized ❌" });

    let { title, subtitle, content, mediaUrl } = req.body;

    // No empty post
    if (!content && !title && !mediaUrl)
      return res.status(400).json({ message: "Post cannot be empty ❌" });

    // Full text
    const fullText = `${title || ""} ${subtitle || ""} ${content || ""}`;

    // Spam block
    if (isSpammy(fullText))
      return res.status(400).json({ message: "❌ Post looks like spam." });

    // Clean text
    const cleanedTitle = cleanBadWords(title);
    const cleanedSubtitle = cleanBadWords(subtitle);
    const cleanedContent = cleanBadWords(content);

    /* ------------------ CLOUDINARY UPLOAD (NO MODERATION) ------------------ */
    let finalUrl = "";
    let mediaType = "";

    if (mediaUrl) {
      const check = await cloudinary.uploader.upload(mediaUrl, {
        folder: "mern_posts",
        resource_type: "auto"
      });

      finalUrl = check.secure_url;
      mediaType = check.resource_type;
    }

    /* ------------------ SAVE POST ------------------ */
    const post = await Post.create({
      user: req.user._id,

      title: cleanedTitle,
      subtitle: cleanedSubtitle,
      content: cleanedContent,

      mediaUrl: finalUrl,
      mediaType,

      // Moderation fields
      safetyStatus:
        cleanedTitle !== title ||
        cleanedSubtitle !== subtitle ||
        cleanedContent !== content
          ? "rewritten"
          : "safe",

      flagged:
        cleanedTitle !== title ||
        cleanedSubtitle !== subtitle ||
        cleanedContent !== content
    });

    res.status(201).json({
      success: true,
      message: "✅ Post created successfully!",
      post
    });

  } catch (err) {
    console.error("❌ Error creating post:", err);
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};


/* ------------------ GET ALL POSTS ------------------ */
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ------------------ UPDATE POST ------------------ */
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found ❌" });

    if (post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not allowed ❌" });

    post.title = cleanBadWords(req.body.title) || post.title;
    post.subtitle = cleanBadWords(req.body.subtitle) || post.subtitle;
    post.content = cleanBadWords(req.body.content) || post.content;

    await post.save();

    res.json({ success: true, message: "✅ Post updated!", post });

  } catch (err) {
    console.error("❌ Error updating post:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ------------------ DELETE POST ------------------ */
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found ❌" });

    // Delete cloudinary asset
    if (post.mediaUrl) {
      const publicId = post.mediaUrl.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: post.mediaType
        });
      } catch (err) {
        console.warn("⚠️ Error deleting Cloudinary asset:", err.message);
      }
    }

    await post.deleteOne();
    res.json({ success: true, message: "✅ Post deleted!" });

  } catch (err) {
    console.error("❌ Error deleting post:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
