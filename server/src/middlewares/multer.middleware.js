import multer from "multer";
import fs from "fs";
import path from "path";

// ✅ Ensure "uploads" directory exists
const uploadDir = path.resolve("./uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer configuration
const storage = multer.diskStorage({
  destination: uploadDir, // Save files in the "uploads" directory
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

export const upload = multer({ storage });