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
    console.log("👤 User from middleware:", req.user);

    // ✅ yahan req.user._id aata hai, na ki req.user.id
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized ❌ (user not found in token)",
      });
    }

    const { username, email, bio } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (bio) updates.bio = bio;

    // ✅ Agar profilePic upload hui hai
    if (req.file) {
      try {
        const uploadDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Optional: Purani image delete karna
        if (req.user.profilePic) {
          const oldPath = path.join(__dirname, "..", req.user.profilePic);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log("🗑️ Old profilePic deleted");
          }
        }

        updates.profilePic = `/uploads/${req.file.filename}`;
      } catch (fileErr) {
        console.error("❌ File handling error:", fileErr);
        return res
          .status(500)
          .json({ success: false, message: "File upload failed ❌" });
      }
    }

    // ✅ Update user
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found ❌" });
    }

    res.json({
      success: true,
      message: "Profile updated ✅",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
