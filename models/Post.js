import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, default: "" },
    caption: { type: String, default: "" },
    title: { type: String },
    subtitle: { type: String },
    content: { type: String },
    mediaUrl: { type: String, default: "" },   // ✅ Add this
    mediaType: { type: String, default: "" },  // ✅ Add this
  },
  { timestamps: true }
);


export default mongoose.model("Post", postSchema);
