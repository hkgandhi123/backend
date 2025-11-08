import fs from "fs";
import path from "path";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import OpenAI from "openai";

/* ------------------ Cloudinary Config ------------------ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 Debug: check if key is loaded
console.log("Using OpenAI Key:", process.env.OPENAI_API_KEY ? "YES" : "NO");

/* ------------------ OpenAI Config ------------------ */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


/* ---------------------------------------------------------
 ✅ AI TEXT MODERATION
--------------------------------------------------------- */
async function checkTextSafety(text) {
  if (!text) return false;

  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: text,
  });

  return response.results[0].flagged;
}

/* ---------------------------------------------------------
 ✅ AI IMAGE MODERATION
--------------------------------------------------------- */
async function checkImageSafety(filePath) {
  if (!filePath) return false;

  const imageBuffer = fs.readFileSync(filePath);

  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: [{ image: imageBuffer.toString("base64") }],
  });

  return response.results[0].flagged;
}

/* ---------------------------------------------------------
 ✅ EXTRA TEXT SAFETY
--------------------------------------------------------- */

// bad word cleaner
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

function isSpammy(text) {
  if (!text) return false;
  if (/(.)\1{5,}/.test(text)) return true;
  if (text.toLowerCase().includes("buy now")) return true;
  if (text.length > 6000) return true;
  return false;
}

// AI rewrite
async function aiSafeRewrite(text) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Rewrite text safely without profanity/hate." },
      { role: "user", content: text }
    ]
  });

  return response.choices[0].message.content;
}

/* ---------------------------------------------------------
 ✅ CREATE POST
--------------------------------------------------------- */
export const createPost = async (req, res) => {
  try {
    console.log("📥 New Post Request From:", req.user?._id);

    let { title, subtitle, content } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized ❌" });
    }

    if (!content && !title && !req.file) {
      return res.status(400).json({ message: "Post cannot be empty ❌" });
    }

    const fullText = `${title || ""} ${subtitle || ""} ${content || ""}`;

    if (await checkTextSafety(fullText)) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      return res.status(400).json({
        message: "❌ Post contains disallowed or harmful text.",
      });
    }

    if (isSpammy(fullText)) {
      return res.status(400).json({ message: "❌ Post looks like spam." });
    }

    // clean abuse
    title = cleanBadWords(title);
    subtitle = cleanBadWords(subtitle);
    content = cleanBadWords(content);

    // rewrite safe
    content = await aiSafeRewrite(fullText);

    // image moderation
    if (req.file?.path) {
      const flagged = await checkImageSafety(req.file.path);
      if (flagged) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          message: "❌ NSFW / violent image not allowed.",
        });
      }
    }

    let mediaUrl = "";
    let mediaType = "";

    if (req.file?.path) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "mern_posts",
        resource_type: "auto",
      });

      mediaUrl = uploadResult.secure_url;
      mediaType = uploadResult.resource_type;

      fs.unlinkSync(req.file.path);
    }

    const post = await Post.create({
      user: req.user._id,
      title,
      subtitle,
      content,
      mediaUrl,
      mediaType,
    });

    res.status(201).json({
      success: true,
      message: "✅ Post created successfully!",
      post,
    });

  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ---------------------------------------------------------
 ✅ GET ALL POSTS
--------------------------------------------------------- */
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

/* ---------------------------------------------------------
 ✅ UPDATE POST
--------------------------------------------------------- */
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found ❌" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed ❌" });
    }

    post.title = req.body.title || post.title;
    post.subtitle = req.body.subtitle || post.subtitle;
    post.content = req.body.content || post.content;

    await post.save();

    res.json({ success: true, message: "✅ Post updated!", post });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ---------------------------------------------------------
 ✅ DELETE POST
--------------------------------------------------------- */
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found ❌" });

    if (post.mediaUrl) {
      const publicId = post.mediaUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: post.mediaType });
    }

    await post.deleteOne();

    res.json({ success: true, message: "✅ Post deleted!" });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
