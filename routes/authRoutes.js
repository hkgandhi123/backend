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
import upload from "../middleware/uploadMiddleware.js";



const router = express.Router();

// 🔹 Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// 🔹 Protected routes (JWT required)
router.get("/profile", protect, getProfile);
router.post("/reset-password", protect, resetPassword);

// ✅ Use upload("profiles") since your middleware is a function
router.put(
  "/update-profile",
  protect,
  upload("profiles").single("profilePic"),
  updateProfile
);

export default router;
