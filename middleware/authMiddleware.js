// middleware/authMiddleware.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token ❌" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    req.user = user; // ✅ full user object available
    next();
  } catch (err) {
    console.error("❌ JWT verify error:", err.message);
    res.status(401).json({ message: "Invalid token ❌" });
  }
};
