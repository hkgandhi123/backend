import express from "express";
import {
  signup,
  login,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 🔹 Multer setup for profilePic upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("uploads");

    // create uploads dir if not exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// 🔹 Auth routes
router.post("/signup", signup);
router.post("/login", login);

// Profile routes (protected)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profilePic"), updateProfile);

export default router;
