// routes/profileRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import {
  getPublicProfile,
  getMyProfile,
  followUser,
  unfollowUser,
  uploadProfilePic, // naya controller
} from "../controllers/profileController.js";

const router = express.Router();

/* ------------------ MULTER SETUP ------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profilePics"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, req.userId + "-" + Date.now() + ext);
  },
});

const upload = multer({ storage });

/* ------------------ PROFILE ROUTES ------------------ */
// ✅ Logged-in user's profile
router.get("/me", protect, getMyProfile);

// ✅ Public profile by ID
router.get("/:id", getPublicProfile);

// ✅ Profile picture upload
router.put("/me/upload", protect, upload.single("profilePic"), uploadProfilePic);

// ✅ Follow / Unfollow
router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);

export default router;
