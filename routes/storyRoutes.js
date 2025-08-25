import express from "express";
import Story from "../models/Story.js";

const router = express.Router();

// Upload Story
router.post("/", async (req, res) => {
  try {
    const story = new Story({
      user: req.body.userId,
      imageUrl: req.body.imageUrl
    });
    await story.save();
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Stories
router.get("/", async (req, res) => {
  const stories = await Story.find().populate("user", "username profilePic");
  res.json(stories);
});

export default router;
