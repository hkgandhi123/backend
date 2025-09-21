import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    media: { type: String, required: true }, // image or video path
    createdAt: { type: Date, default: Date.now, expires: 86400 }, // auto delete after 24h
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);
