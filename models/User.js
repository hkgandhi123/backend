import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },

    // ✅ Password is NOT required for Google users
    password: { type: String },

    // ✅ Google auth fields
    googleId: { type: String, default: "" },

    bio: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    profilePicPublicId: { type: String, default: "" },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

// ✅ Hash password only if password exists
userSchema.pre("save", async function (next) {
  if (!this.password) return next(); // Google users
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Only compare password if exists
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // Google users will always return false
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
