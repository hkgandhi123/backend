import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { sendMessage, getMessages } from "../controllers/messagesController.js";

const router = express.Router();

// Send message
router.post("/", protect, sendMessage);

// Get messages between logged-in user and friend
router.get("/:friendId", protect, getMessages);

export default router;
