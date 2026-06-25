const multer = require("multer");
const AppError = require("../utils/appError");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new AppError("فقط فرمت‌های jpg, jpeg, png, webp مجاز هستند", 400));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;