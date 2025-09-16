import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";   // 🔹 postRoutes import

dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ CORS setup for local + deployed frontend
app.use(cors({
  origin: ["http://localhost:3000", "https://frontend-xntj.vercel.app"],
  credentials: true,
}));

// 🔹 Serve uploads folder (images)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);   // 🔹 post routes connect

// MongoDB Connection + Server Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
