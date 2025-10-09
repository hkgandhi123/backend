import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "stories",
    resource_type: "auto", // images/videos
    allowed_formats: ["jpg","jpeg","png","mp4","mov","webm"],
  },
});

export const upload = multer({ storage });
