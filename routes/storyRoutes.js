import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadStory.js";
import { createStory, getStories } from "../controllers/storyController.js";

const router = express.Router();

// "media" must match frontend FormData
router.post("/", protect, upload.single("media"), createStory);
router.get("/", getStories);

export default router;
