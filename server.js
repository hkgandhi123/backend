import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";   // 🔹 Auth routes
import postRoutes from "./routes/postRoutes.js";   // 🔹 Post routes

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "https://insta-mern.vercel.app"], // ✅ apna frontend URL
  credentials: true
}));

// Default test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running...");
});

// API Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB Connected");
  app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
  });
})
.catch(err => console.error("❌ MongoDB Error:", err));
