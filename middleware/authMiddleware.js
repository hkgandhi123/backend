import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // Optional chaining to prevent crash if cookies undefined
  const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied ❌" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Error:", err);
    return res.status(401).json({ success: false, message: "Invalid token ❌" });
  }
};
