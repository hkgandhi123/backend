import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // 🔹 Cookie se token nikaalo
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "No token, unauthorized ❌" });
    }

    // 🔹 Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 DB se user lao (password exclude karke)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found ❌" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Auth error:", err);
    res.status(401).json({ message: "Invalid token ❌" });
  }
};

