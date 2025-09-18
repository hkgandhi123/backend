import express from "express";
import { signup, login, getProfile, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ Import protect

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", protect, getProfile);      // Protected
router.put("/update", protect, updateProfile);   // Protected

export default router;
