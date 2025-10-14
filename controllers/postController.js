import User from "../models/User.js";
import Post from "../models/Post.js";

// 🔹 Logged-in user's profile (with posts)
export const getMyProfile = async (req, res) => {
  try {
    // Fetch fresh user from DB
    const user = await User.findById(req.user._id)
      .select("-password")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    // Fetch user's posts
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");

    // Send user + posts
    res.json({ user: { ...user, posts } });
  } catch (err) {
    console.error("Error in getMyProfile:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Public profile
export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === "me")
      return res.status(400).json({ message: "Use /profile/me for your own profile" });

    const user = await User.findById(id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    // Fetch user's posts
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profilePic: user.profilePic || "",
        followers: user.followers || [],
        following: user.following || [],
        posts,
      },
    });
  } catch (err) {
    console.error("Error in getPublicProfile:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Follow / Unfollow
export const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });
    if (currentUser._id.toString() === id)
      return res.status(400).json({ message: "Cannot follow yourself" });

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
    console.error("Error in followUser:", err);
    res.status(500).json({ message: err.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

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
    console.error("Error in unfollowUser:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found ❌" });

    // Only owner can delete
    if (post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized ❌" });

    await post.deleteOne();
    res.json({ message: "Post deleted ✅" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: err.message });
  }
};