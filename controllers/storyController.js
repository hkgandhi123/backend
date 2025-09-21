import Story from "../models/Story.js";

// Create a story
export const createStory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const story = new Story({
      user: req.user.id, // JWT se user
      media: `/uploads/${req.file.filename}`,
    });

    await story.save();
    res.json({ success: true, story });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all stories
export const getStories = async (req, res) => {
  try {
    const stories = await Story.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
