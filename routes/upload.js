import express from "express";
import multer from "multer";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({});
const upload = multer({ storage });

router.post("/", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file ❌" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "mern_posts",
      resource_type: "auto",
      moderation: "aws_rek"
    });

    fs.unlinkSync(req.file.path);

    if (result.moderation?.[0]?.status === "rejected") {
      await cloudinary.uploader.destroy(result.public_id);
      return res.status(400).json({ message: "Unsafe content ❌" });
    }

    res.json({ success: true, url: result.secure_url });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
