import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String },          // optional for text-only stories
    type: { type: String, default: "text" }, // "image", "video", "text"
    caption: { type: String },
    expiresAt: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 },
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);
