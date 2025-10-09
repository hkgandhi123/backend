import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    text: { type: String, required: true },
    chatType: { type: String, enum: ["private", "group"], default: "private" },
    groupName: { type: String }, // only for group chats
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
