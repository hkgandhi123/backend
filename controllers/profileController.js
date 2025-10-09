import User from "../models/User.js";

// 🔹 Logged-in user profile
export const getMyProfile = async (req, res) => {
  try {
    const user = req.user; // protect middleware se aa raha hai
    if (!user) return res.status(404).json({ message: "User not found ❌" });
    
    res.json({ user });
  } catch (err) {
    console.error("Error in getMyProfile:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Public profile
export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 Prevent "me" from going to this route
    if (id === "me") return res.status(400).json({ message: "Use /profile/me for your own profile" });

    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        profilePic: user.profilePic || "",
        followers: user.followers || [],
        following: user.following || [],
        posts: user.posts || [],
      },
    });
  } catch (err) {
    console.error("Error in getPublicProfile:", err);
    res.status(500).json({ message: err.message });
  }
};


// 🔹 Follow user
export const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });
    if (currentUser._id.toString() === id) return res.status(400).json({ message: "Cannot follow yourself" });

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

// 🔹 Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

    const userToUnfollow = await User.findById(id);
    if (!userToUnfollow) return res.status(404).json({ message: "User not found ❌" });

    userToUnfollow.followers = userToUnfollow.followers.filter(f => f.toString() !== currentUser._id.toString());
    await userToUnfollow.save();

    currentUser.following = currentUser.following.filter(f => f.toString() !== userToUnfollow._id.toString());
    await currentUser.save();

    res.json({ success: true, message: "Unfollowed ❌" });
  } catch (err) {
    console.error("Error in unfollowUser:", err);
    res.status(500).json({ message: err.message });
  }
};
