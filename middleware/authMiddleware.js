import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Protect route middleware
export const protect = async (req, res, next) => {
  try {
    // Token check: cookie ya authorization header
    let token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token ❌" });
    }

    // Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User fetch from DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found ❌" });
    }

    req.user = user; // ✅ ab req.user me pura user object aayega
    next();
  } catch (err) {
    console.error("❌ Protect middleware error:", err);
    res.status(401).json({ success: false, message: "Not authorized, token failed ❌" });
  }
};
