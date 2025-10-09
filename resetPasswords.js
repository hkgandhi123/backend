import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const reset = async () => {
  try {
    const users = await User.find();
    for (let u of users) {
      u.password = "123456"; // plain
      await u.save();        // triggers bcrypt hash
    }
    console.log("✅ All passwords reset to 123456");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

reset();
