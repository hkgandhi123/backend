import express from "express";
import multer from "multer";
import { signup, login, getProfile,  updateProfile, authMiddleware } from "../controllers/authController.js";

const router = express.Router();

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/update", authMiddleware, upload.single("profilePic"), updateProfile);

export default router;
