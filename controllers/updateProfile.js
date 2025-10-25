import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const updateProfile = async (req, res) => {
  try {
    // 🛡️ Verify authentication
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized ❌",
      });
    }

    const { username, email, bio } = req.body;
    const updates = {};

    if (username) updates.username = username.trim();
    if (email) updates.email = email.trim();
    if (bio) updates.bio = bio.trim();

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found ❌",
      });
    }

    // ☁️ Handle new profile photo
    if (req.file) {
      try {
        // 🗑️ Delete old image if exists
        if (user.profilePicPublicId) {
          await cloudinary.uploader.destroy(user.profilePicPublicId);
          console.log("🗑️ Deleted old Cloudinary image:", user.profilePicPublicId);
        }

        // ☁️ Upload new image
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "profilePics",
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        });

        updates.profilePic = result.secure_url;
        updates.profilePicPublicId = result.public_id;

        console.log("☁️ New image uploaded:", result.secure_url);
      } catch (uploadErr) {
        console.error("❌ Cloudinary upload error:", uploadErr);
        return res.status(500).json({
          success: false,
          message: "Cloudinary upload failed ❌",
        });
      }
    }

    // 🧩 Update user data
    Object.assign(user, updates);
    await user.save();

    // ✅ Response
    res.json({
      success: true,
      message: "Profile updated successfully ✅",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profilePic: user.profilePic || "",
      },
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};
