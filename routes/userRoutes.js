import express from "express";
import { protect } from "../middleware/authMiddleware.js"; 
import User from "../models/User.js";

const router = express.Router();

/* ------------------ Profile Routes ------------------ */
// GET own profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET user by ID (for profile page)
router.get("/:id", protect, async (req, res) => {
  try {
    // Agar id === current user, use /me route
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

// Update own profile
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

/* ------------------ Users Fetching ------------------ */
// GET all users (for chat)
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select(
      "username _id profilePic"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST get users by IDs
router.post("/get-by-ids", protect, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }
    const users = await User.find({ _id: { $in: ids } }).select("username _id profilePic");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------ Follow / Unfollow ------------------ */
router.put("/follow/:id", protect, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow || !currentUser) return res.status(404).json({ message: "User not found" });
    if (currentUser.following.includes(userToFollow._id)) return res.status(400).json({ message: "Already following" });

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/unfollow/:id", protect, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToUnfollow || !currentUser) return res.status(404).json({ message: "User not found" });

    currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow._id.toString());
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser._id.toString());

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
