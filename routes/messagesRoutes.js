// routes/messagesRoutes.js
import express from "express";
import { createMessage, getUserMessages } from "../controllers/messagesController.js";

const router = express.Router();

router.post("/", createMessage);       // POST /messages
router.get("/:userId", getUserMessages); // GET /messages/:userId

export default router;
