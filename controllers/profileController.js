import User from "../models/User.js";
import Post from "../models/Post.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

/* ------------------ GET LOGGED-IN USER PROFILE ------------------ */
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");

    res.json({
      success: true,
      user: { ...user, posts: posts || [] },
    });
  } catch (err) {
    console.error("❌ Error in getMyProfile:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ------------------ GET PUBLIC PROFILE ------------------ */
export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");

    res.json({
      success: true,
      user: { ...user, posts: posts || [] },
    });
  } catch (err) {
    console.error("❌ Error in getPublicProfile:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ------------------ FOLLOW USER ------------------ */
export const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (currentUser._id.toString() === id)
      return res.status(400).json({ message: "Cannot follow yourself ❌" });

    const userToFollow = await User.findById(id);
    if (!userToFollow) return res.status(404).json({ message: "User not found ❌" });

    if (!userToFollow.followers.includes(currentUser._id)) {
      userToFollow.followers.push(currentUser._id);
      await userToFollow.save();

      currentUser.following.push(userToFollow._id);
      await currentUser.save();
    }

    res.json({ success: true, message: "Followed ✅" });
  } catch (err) {
    console.error("❌ Error in followUser:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ------------------ UNFOLLOW USER ------------------ */
export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const userToUnfollow = await User.findById(id);
    if (!userToUnfollow) return res.status(404).json({ message: "User not found ❌" });

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (f) => f.toString() !== currentUser._id.toString()
    );
    await userToUnfollow.save();

    currentUser.following = currentUser.following.filter(
      (f) => f.toString() !== userToUnfollow._id.toString()
    );
    await currentUser.save();

    res.json({ success: true, message: "Unfollowed ❌" });
  } catch (err) {
    console.error("❌ Error in unfollowUser:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ------------------ UPDATE PROFILE (Cloudinary Upload) ------------------ */
export const updateProfile = async (req, res) => {
  try {
    if (!req.user?._id)
      return res.status(401).json({ success: false, message: "Unauthorized ❌" });

    const { username, email, bio } = req.body;
    const updates = {};

    if (username) updates.username = username.trim();
    if (email) updates.email = email.trim();
    if (bio) updates.bio = bio.trim();

    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found ❌" });

    // ☁️ Upload new profile image if provided
    if (req.file) {
      // 🗑️ Delete old Cloudinary image if it exists
      if (user.profilePicPublicId) {
        await cloudinary.uploader.destroy(user.profilePicPublicId);
        console.log("🗑️ Deleted old Cloudinary image:", user.profilePicPublicId);
      }

      // ✅ Upload new image stream to Cloudinary
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "profilePics",
              transformation: [{ width: 500, height: 500, crop: "limit" }],
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await streamUpload();

      updates.profilePic = result.secure_url;
      updates.profilePicPublicId = result.public_id;
      console.log("☁️ Uploaded new profile pic:", result.secure_url);
    }

    // 🧩 Update and return fresh user
    const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
      new: true,
    });

    res.json({
      success: true,
      message: "Profile updated ✅",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio || "",
        profilePic: updatedUser.profilePic || "",
      },
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};