import express from "express";
import multer from "multer";
import { createStory, getStories } from "../controllers/storyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// File storage (local fallback)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Routes
router.post("/", protect, upload.single("media"), createStory);
router.get("/", protect, getStories);

export default router;

