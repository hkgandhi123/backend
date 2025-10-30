import multer from "multer";
import path from "path";
import fs from "fs";

const upload = (folderName = "uploads") => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join("uploads", folderName);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-matroska",
      "video/webm",
    ];

    if (!file) return cb(null, false);
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image or video files are allowed!"), false);
  };

  return multer({ storage, fileFilter });
};

export default upload; // ✅ default export
