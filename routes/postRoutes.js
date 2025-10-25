import express from "express";
import { createPost, getPosts, updatePost, deletePost } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ✅ Get all posts (protected)
router.get("/", protect, getPosts);

// ✅ Create a new post (protected + file upload)
router.post("/", protect, upload("posts").single("image"), createPost);

// ✅ Update post
router.put("/:id", protect, upload("posts").single("image"), updatePost);

// ✅ Delete post
router.delete("/:id", protect, deletePost);

export default router;
