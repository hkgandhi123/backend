import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Allowed origins (local + Vercel frontend)
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-xntj.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS ❌"));
      }
    },
    credentials: true,
  })
);

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Ensure uploads folder exists before using it
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Uploads folder created automatically");
}

// ✅ Serve uploads folder (profile & post images)
app.use("/uploads", express.static(uploadDir));

// Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

// Test route to check server health
app.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 Backend is running!" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// MongoDB connection + server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running at: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
