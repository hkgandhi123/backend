import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// 🔹 ES Modules __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔹 CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-xntj.vercel.app",
  "https://insta-mern.vercel.app"  // add this if actual frontend is here
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,  // ✅ allow cookies (important for JWT)
}));

// ✅ Preflight request handling
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true,
}));

// 🔹 Serve static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔹 Routes
app.use("/auth", authRoutes);
// Ab
app.use("/posts", postRoutes);
app.use("/stories", storyRoutes);

// 🔹 Health check route
app.get("/", (req, res) => res.send("✅ Backend is running"));

// 🔹 MongoDB connection & server start
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
