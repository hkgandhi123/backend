import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("🔹 Token from cookie:", token); // 🔹 debug

    if (!token) {
      return res.status(401).json({ message: "No token provided ❌" });
    }

    // 🔹 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔹 Decoded token:", decoded); // 🔹 debug

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token ❌" });
    }

    // 🔹 Find user
    const user = await User.findById(decoded.id).select("-password");
    console.log("🔹 User found from token:", user); // 🔹 debug

    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    // ✅ Attach to req
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token ❌" });
  }
};
