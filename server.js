// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import messagesRoutes from "./routes/messagesRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

// Models
import Message from "./models/Message.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);

// ES Modules __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Allowed Origins (regex for any Vercel frontend)
const allowedOrigins = [
  "http://localhost:3000", 
  "https://bkc-frontend.vercel.app" ,
  /\.vercel\.app$/,  // allow any Vercel subdomain
];

// 🔹 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔹 CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman/testing
      const allowed = allowedOrigins.some((o) =>
        o instanceof RegExp ? o.test(origin) : o === origin
      );
      if (allowed) return callback(null, true);

      console.warn("❌ Blocked CORS request from:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Preflight (OPTIONS)
app.options("*", cors({ origin: allowedOrigins, credentials: true }));

// 🔹 Static uploads folder
const uploadsPath = path.join(__dirname, "uploads");
console.log("📂 Serving uploads from:", uploadsPath);
app.use("/uploads", express.static(uploadsPath));


// 🔹 Debug request logger
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// 🔹 API Routes
app.use("/", authRoutes);
app.use("/posts", postRoutes);
app.use("/stories", storyRoutes);
app.use("/messages", messagesRoutes);
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);

// 🔹 Health check route
app.get("/", (req, res) => res.send("✅ Backend is running"));

// 🔹 Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join", ({ userId }) => {
    if (userId) socket.join(userId);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const msg = new Message(data);
      await msg.save();
      await msg.populate("sender", "username _id");

      const recipients = data.recipients || [];
      recipients.forEach((r) => socket.to(r).emit("receiveMessage", msg));

      socket.emit("receiveMessage", msg);
    } catch (err) {
      console.error("Socket sendMessage error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// 🔹 Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// 🔹 MongoDB + Start Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () =>
      console.log(`🚀 Server + Socket.IO running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB error:", err));
