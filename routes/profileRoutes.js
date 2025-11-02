import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyProfile,
  getPublicProfile,
  followUser,
  unfollowUser,
  updateProfile,
} from "../controllers/profileController.js";

const router = express.Router();

/* ------------------ MULTER MEMORY STORAGE ------------------ */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ------------------ ROUTES ------------------ */
router.get("/me", protect, getMyProfile);
router.get("/:id", getPublicProfile);
router.put("/me/update", protect, upload.single("profilePic"), updateProfile);
router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);

export default router;
