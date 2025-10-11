import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    caption: { type: String },
    type: { type: String, enum: ["post", "reel"], default: "post" },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
