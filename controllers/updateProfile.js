import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized ❌" });
    }

    const { username, email, bio } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (bio) updates.bio = bio;

    if (req.file) {
      const user = await User.findById(req.user._id);

      // Delete old photo from Cloudinary (if present)
      if (user?.profilePicPublicId) {
        try {
          await cloudinary.uploader.destroy(user.profilePicPublicId);
          console.log("🗑️ Old profilePic deleted from Cloudinary");
        } catch (delErr) {
          console.error("❌ Cloudinary delete error:", delErr);
        }
      }

      // Fix duplicate /uploads/
      let profilePath = req.file.path;

      if (!profilePath.startsWith("http")) {
        profilePath = profilePath.replace(/^(\/)?(uploads\/)+/, "uploads/");
      }

      updates.profilePic = profilePath;
      updates.profilePicPublicId = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
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
