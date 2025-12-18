const path = require("path");
const getPublicPath = (coverPath) => {
  const filePath = path.join(__dirname, "..", "..", "public", coverPath);
  return filePath;
};

module.exports = getPublicPath;
