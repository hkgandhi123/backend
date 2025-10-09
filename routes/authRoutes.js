import express from "express";
import {
  signup,
  login,
  logout,
  getProfile,
  resetPassword,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; // agar multer use ho raha hai

const router = express.Router();

// 🔹 Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// 🔹 Protected routes (JWT required)
router.get("/profile", protect, getProfile);
router.post("/reset-password", protect, resetPassword);
router.put("/update-profile", protect, upload.single("profilePic"), updateProfile);

export default router;
