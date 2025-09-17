import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname fix for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateProfile = async (req, res) => {
  try {
    console.log("📩 Body:", req.body);
    console.log("📂 File:", req.file);
    console.log("👤 User:", req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized ❌ (user not found in token)" });
    }

    const { username, email, bio } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (bio) updates.bio = bio;

    // Agar profile picture upload hui hai
    if (req.file) {
      try {
        const uploadDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        updates.profilePic = `/uploads/${req.file.filename}`;
      } catch (fileErr) {
        console.error("❌ File handling error:", fileErr);
        return res.status(500).json({ success: false, message: "File upload failed ❌" });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found ❌" });
    }

    res.json({ success: true, message: "Profile updated ✅", user });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
