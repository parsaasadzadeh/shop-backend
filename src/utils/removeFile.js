const fs = require("fs");

const removeFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = removeFile;
