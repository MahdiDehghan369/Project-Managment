const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");

const publicFolderPath = path.join(__dirname, "..", "..", "public");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type."), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

const saveFile = async (file , folderName) => {
  if (!file) return null;

  const folderPath = path.join(publicFolderPath, folderName);
  await fs.mkdir(folderPath, { recursive: true });

  const filename = `${folderName}-${Date.now()}${path.extname(file.originalname)}`;
  const filePath = path.join(folderPath, filename);

  await fs.writeFile(filePath, file.buffer);
  return `${folderName}/${filename}`
};

module.exports = { upload, saveFile };
