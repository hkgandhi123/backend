import jwt from "jsonwebtoken";

// 🔹 Auth middleware
export const protect = (req, res, next) => {
  const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token ❌" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded.id will have user ID
    next();
  } catch (err) {
    console.error("❌ JWT verify error:", err);
    res.status(401).json({ message: "Invalid token ❌" });
  }
};
