import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// 🔹 Update Profile Controller
export const updateProfile = async (req, res) => {
  try {
    // 🛡️ Authentication check
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized ❌",
      });
    }

    const { username, email, bio } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (bio) updates.bio = bio;

    // 📸 Handle profile picture upload
    if (req.file) {
      const user = await User.findById(req.user._id);

      // 🗑️ Delete old Cloudinary image if exists
      if (user?.profilePicPublicId) {
        try {
          await cloudinary.uploader.destroy(user.profilePicPublicId);
          console.log("🗑️ Old profilePic deleted");
        } catch (err) {
          console.error("❌ Cloudinary delete error:", err);
        }
      }

      // ☁️ Upload new image to Cloudinary
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "profilePics",
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        });

        updates.profilePic = result.secure_url;       // ✅ Full Cloudinary URL
        updates.profilePicPublicId = result.public_id; // ✅ For future delete
        console.log("☁️ Uploaded to Cloudinary:", result.secure_url);
      } catch (uploadErr) {
        console.error("❌ Cloudinary upload error:", uploadErr);
        return res.status(500).json({
          success: false,
          message: "Cloudinary upload failed ❌",
        });
      }
    }

    // 🧩 Update user in DB
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found ❌",
      });
    }

    // ✅ Success response
    res.json({
      success: true,
      message: "Profile updated ✅",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({
      success: false,
      message: "Server error: " + err.message,
    });
  }
};
