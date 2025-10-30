import express from "express";
import { createPost, getAllPosts, updatePost, deletePost } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; // ✅ Default import (NOT destructured)

const router = express.Router();

/* ------------------ Routes ------------------ */

// ✅ Get all posts
router.get("/", protect, getAllPosts);

// ✅ Create post (supports text-only & media posts)
router.post("/", protect, (req, res, next) => {
  const uploader = upload("posts").single("media");

  uploader(req, res, (err) => {
    if (err && err.message === "Unexpected field") {
      console.log("⚠️ Ignoring missing file field for text-only post");
      req.file = null;
      return next();
    } else if (err) {
      console.error("❌ Multer error:", err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createPost);

// ✅ Update post
router.put("/:id", protect, upload("posts").single("media"), updatePost);

// ✅ Delete post
router.delete("/:id", protect, deletePost);

export default router;
