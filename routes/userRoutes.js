import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

/* ------------------ PROFILE ROUTES ------------------ */

// ✅ Get own profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get user by ID
router.get("/:id", protect, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      const user = await User.findById(req.userId).select("-password");
      return res.json(user);
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update profile
router.put("/me", protect, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------ SEARCH ROUTE ------------------ */

// ✅ Search users by username
router.get("/search-users", protect, async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) return res.json([]);

    const users = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("_id username profilePic bio");

    res.json(users);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------ FOLLOW / UNFOLLOW ------------------ */

// ✅ Follow user
router.put("/follow/:id", protect, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow || !currentUser)
      return res.status(404).json({ message: "User not found" });

    if (currentUser.following.includes(userToFollow._id))
      return res.status(400).json({ message: "Already following" });

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Unfollow user
router.put("/unfollow/:id", protect, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToUnfollow || !currentUser)
      return res.status(404).json({ message: "User not found" });

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
