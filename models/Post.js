import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // ✅ Image/Video cloudinary URL
    mediaUrl: { type: String, default: "" },

    // ✅ Resource type (image / video)
    mediaType: { type: String, default: "" },

    // ✅ Post text data
    caption: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    content: { type: String, default: "" },

    // ✅ NEW: AI moderation status
    safetyStatus: { 
      type: String, 
      enum: ["safe", "rewritten", "flagged"], 
      default: "safe" 
    },

    // ✅ NEW: Was this post flagged originally?
    flagged: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
