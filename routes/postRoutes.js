import express from "express";
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js"; // ✅ Dynamic multer

const router = express.Router();

/* ------------------ Routes ------------------ */

// ✅ Get all posts (protected)
router.get("/", protect, getAllPosts);

// ✅ Create post (with optional media)
router.post("/", protect, (req, res, next) => {
  upload.single("media")(req, res, (err) => {
    if (err && err.message === "Unexpected field") {
      console.log("⚠️ Ignoring missing file field for text-only post");
      req.file = null;
      return next();
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, createPost);



// ✅ Update post (with optional media)
router.put("/:id", protect, upload("posts").single("media"), updatePost);

// ✅ Delete post
router.delete("/:id", protect, deletePost);

export default router;
