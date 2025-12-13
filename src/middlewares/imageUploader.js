const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { existsAsync, mkdirAsync } = require("../utils/asyncFs");

const publicFolderPath = path.join(__dirname , ".." , ".." , "public")

if(!fs.existsSync(publicFolderPath)){
    fs.mkdirSync(publicFolderPath)
}

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "avatar") {
      const avatarFolderPath = path.join(publicFolderPath, file.fieldname);
      if (!fs.existsSync(avatarFolderPath)) {
        fs.mkdirSync(avatarFolderPath, { recursive: true });
      }
      cb(null, avatarFolderPath);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const multerFilter = (req, file, cb) => {
  const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."), false);
  }
};

const imageUploader = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = imageUploader
