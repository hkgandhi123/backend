import express from "express";
import { createPost } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
const router = express.Router();

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/", protect, upload.single("image"), createPost);

export default router;
