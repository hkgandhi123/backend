import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ✅ TEXT MODERATION */
const checkTextSafe = async (text) => {
  if (!text) return { safe: true };

  const result = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: text,
  });

  return { safe: !result.results[0].flagged };
};

/* ✅ IMAGE MODERATION */
const checkImageSafe = async (buffer) => {
  const base64 = buffer.toString("base64");

  const result = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: `data:image/jpeg;base64,${base64}`,
  });

  return { safe: !result.results[0].flagged };
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user?._id)
      return res.status(401).json({ success: false, message: "Unauthorized ❌" });

    const { username, email, bio } = req.body;
    const updates = {};

    /* ✅ Username Moderation */
    if (username) {
      const check = await checkTextSafe(username);
      if (!check.safe)
        return res.status(400).json({ success: false, message: "⚠️ Username contains unsafe content." });

      updates.username = username.trim();
    }

    /* ✅ Bio Moderation */
    if (bio) {
      const check = await checkTextSafe(bio);
      if (!check.safe)
        return res.status(400).json({ success: false, message: "⚠️ Bio contains unsafe content." });

      updates.bio = bio.trim();
    }

    if (email) updates.email = email.trim();

    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found ❌" });

    /* ✅ Profile Image Moderation */
    if (req.file) {
      const checkImg = await checkImageSafe(req.file.buffer);
      if (!checkImg.safe)
        return res.status(400).json({
          success: false,
          message: "🚫 NSFW or unsafe image is not allowed.",
        });

      // delete old pic
      if (user.profilePicPublicId) {
        await cloudinary.uploader.destroy(user.profilePicPublicId);
      }

      // upload new pic
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profilePics",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });

      updates.profilePic = result.secure_url;
      updates.profilePicPublicId = result.public_id;
    }

    /* ✅ Save user */
    Object.assign(user, updates);
    await user.save();

    res.json({
      success: true,
      message: "Profile updated ✅",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profilePic: user.profilePic || "",
      },
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
