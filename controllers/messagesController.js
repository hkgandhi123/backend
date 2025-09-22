import Message from "../models/Message.js";

// Send a message
export const sendMessage = async (req, res) => {
  const { receiverId, text } = req.body;
  try {
    const newMsg = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      text,
    });
    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all messages between logged-in user and a friend
export const getMessages = async (req, res) => {
  const { friendId } = req.params;
  const userId = req.user.id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 }) // oldest first
      .populate("sender", "username profilePic")
      .populate("receiver", "username profilePic");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
