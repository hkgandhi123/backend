import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPost,
  getAllPosts,
  getMyPosts,
  toggleLike,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

// 🔹 Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ------------------- ROUTES ------------------- */

// 🔹 Create Post (protected, image optional)
router.post("/", protect, upload.single("image"), createPost);

// 🔹 Get all posts (public feed)
router.get("/", getAllPosts);

// 🔹 Get my posts (protected)
router.get("/my-posts", protect, getMyPosts);

// 🔹 Like / Unlike a post (protected)
router.put("/:id/like", protect, toggleLike);

// 🔹 Delete a post (protected, only owner can delete)
router.delete("/:postId", protect, deletePost);

export default router;
