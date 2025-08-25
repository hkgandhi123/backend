// backend/routes/stories.js
import { Router } from "express";

const router = Router();

// Example story route
router.get("/", (req, res) => {
  res.json({ message: "Stories route working!" });
});

export default router;
