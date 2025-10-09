// backend/controllers/storyController.js
import Story from "../models/Story.js";

// 🔹 Create Story (image/video/text)
export const createStory = async (req, res) => {
  try {
    console.log("🟢 Story API Hit");
    console.log("➡️ req.body:", req.body);
    console.log("➡️ req.file:", req.file);

    let mediaUrl = "";
    let mediaType = "";

    if (req.file) {
      mediaUrl = req.file.path; // Cloudinary gives secure_url
      mediaType = req.file.mimetype?.startsWith("video") ? "video" : "image";
      console.log("✅ Uploaded to Cloudinary:", mediaUrl, "| Type:", mediaType);
    }

    const caption = req.body.caption || "";

    if (!mediaUrl && !caption) {
      console.log("❌ Missing media and caption");
      return res.status(400).json({ message: "Image, video or text is required" });
    }

    const story = await Story.create({
      user: req.user._id,
      image: mediaUrl,
      type: mediaType || "text",
      caption,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    console.log("✅ Story saved in DB:", story);
    res.status(201).json(story);
  } catch (err) {
    console.error("❌ Create story error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔹 Get all Stories
export const getStories = async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");

    console.log("✅ Stories fetched:", stories.length);
    res.status(200).json(stories);
  } catch (err) {
    console.error("❌ Get stories error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
