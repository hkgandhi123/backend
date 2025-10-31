import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, default: "" },  // ✅ no required
    caption: { type: String, default: "" },
    title: { type: String },
    subtitle: { type: String },
    content: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
