// routes/profileRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getPublicProfile, getMyProfile, followUser, unfollowUser } from "../controllers/profileController.js";

const router = express.Router();

// ✅ Logged-in user's profile
router.get("/me", protect, getMyProfile);

// ✅ Public profile by ID
router.get("/:id", getPublicProfile);

// ✅ Follow / Unfollow
router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);

export default router;
