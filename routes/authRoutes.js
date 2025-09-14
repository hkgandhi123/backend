import express from "express";
import { signup, login, getProfile, logout, updateProfile, authMiddleware } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/logout", authMiddleware, logout);

// ✅ Debug route
router.get("/test", (req, res) => {
  res.json({ message: "Auth route working ✅" });
});

export default router;
