import multer from "multer";
import path from "path";
import fs from "fs";

// 🧠 Dynamic folder upload (e.g. upload("posts"))
const upload = (folderName = "uploads") => {
  // Ensure the upload folder exists
  const uploadPath = `uploads/${folderName}`;
  fs.mkdirSync(uploadPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(
        null,
        `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
          file.originalname
        )}`
      );
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed!"), false);
  };

  return multer({ storage, fileFilter });
};

export default upload;
