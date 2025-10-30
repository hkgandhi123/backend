import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🧠 Upload helper function (handles both image & video)
export const uploadToCloudinary = async (filePath, folder = "uploads") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", // ✅ Detect automatically (image/video)
    });
    return result;
  } catch (err) {
    console.error("❌ Cloudinary upload error:", err);
    throw err;
  }
};

// 🗑️ Delete helper function
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    console.error("❌ Cloudinary delete error:", err);
    throw err;
  }
};

export default cloudinary;
