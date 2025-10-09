import Message from "../models/Message.js";

// Save message
export const createMessage = async (req, res) => {
  try {
    const { sender, recipients, text, chatType, groupName } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const msg = new Message({
      sender,
      recipients,
      text,
      chatType,
      groupName,
    });

    await msg.save();
    await msg.populate("sender", "username _id"); // populate sender username

    res.status(201).json(msg);
  } catch (err) {
    console.error("Create message error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch messages for a user
export const getUserMessages = async (req, res) => {
  try {
    const userId = req.params.userId;

    const msgs = await Message.find({
      $or: [
        { sender: userId },
        { recipients: userId },
      ],
    })
      .populate("sender", "username _id")
      .sort({ createdAt: 1 });

    res.json(msgs);
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
