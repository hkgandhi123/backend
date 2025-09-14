import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ CORS for local + deployed frontend
app.use(cors({
  origin: ["http://localhost:3000", "https://frontend-xntj.vercel.app"],
  credentials: true,
}));

// Routes
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`✅ MongoDB connected`);
    // 🔹 Add app.listen here
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));
