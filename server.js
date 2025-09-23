// server.js
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

// Models
import Message from "./models/Message.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);

// ES Modules __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔹 CORS setup (local + production)
const allowedOrigins = [
  "http://localhost:3000",
  "https://bkc-frontend.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true, // ✅ cookies support
}));

app.options("*", cors({ origin: allowedOrigins, credentials: true }));

// 🔹 Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔹 Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/stories", storyRoutes);
app.use("/messages", messagesRoutes);

// 🔹 Health check
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

  // Join personal room (userId)
  socket.on("join", ({ userId }) => {
    if (userId) socket.join(userId);
  });

  // Send message
  socket.on("sendMessage", async (data) => {
    try {
      const msg = new Message(data);
      await msg.save();
      await msg.populate("sender", "username _id");

      // Emit to all recipients + sender
      const recipients = data.recipients || [];
      recipients.forEach(r => socket.to(r).emit("receiveMessage", msg));
      socket.emit("receiveMessage", msg);
    } catch (err) {
      console.error("Socket sendMessage error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// 🔹 MongoDB + Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () =>
      console.log(`🚀 Server + Socket.IO running on port ${PORT}`)
    );
  })
  .catch(err => console.error("❌ MongoDB error:", err));
