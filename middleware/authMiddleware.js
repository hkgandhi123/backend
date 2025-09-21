import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔹 Middleware to protect routes
export const protect = async (req, res, next) => {
  let token;

  // ✅ Token check (cookies or Authorization header)
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied ❌" });
  }

  try {
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    next(); // ✅ Move to the next middleware/controller
  } catch (err) {
    console.error("❌ JWT verify error:", err);
    return res.status(401).json({ message: "Token is not valid ❌" });
  }
};
