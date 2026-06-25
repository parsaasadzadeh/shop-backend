const User = require("../models/user.model");
const AppError = require("../utils/appError");
const generateOtp = require("../utils/generateOtp");
const generateToken = require("../utils/generateToken");
const { isValidIranPhone } = require("../utils/validators");

const sendOtpService = async (phone) => {
  if (!phone) {
    throw new AppError("شماره موبایل الزامی است", 400);
  }

  if (!isValidIranPhone(phone)) {
    throw new AppError("فرمت شماره موبایل معتبر نیست. مثال: 09123456789", 400);
  }

  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({
      phone,
      otp: {
        code: otpCode,
        expiresAt,
      },
    });
  } else {
    user.otp.code = otpCode;
    user.otp.expiresAt = expiresAt;
    await user.save();
  }

  console.log("====================================");
  console.log(`OTP for ${phone}: ${otpCode}`);
  console.log("====================================");

  return true;
};

const verifyOtpService = async (phone, code) => {
  if (!phone || !code) {
    throw new AppError("شماره موبایل و کد ورود الزامی هستند", 400);
  }

  const user = await User.findOne({ phone });

  if (!user) {
    throw new AppError("کاربری با این شماره یافت نشد", 404);
  }

  if (!user.otp || !user.otp.code) {
    throw new AppError("ابتدا درخواست کد ورود بدهید", 400);
  }

  if (!user.otp.expiresAt || user.otp.expiresAt.getTime() < Date.now()) {
    throw new AppError("کد ورود منقضی شده است", 400);
  }

  if (user.otp.code !== code) {
    throw new AppError("کد ورود اشتباه است", 400);
  }

  user.otp.code = null;
  user.otp.expiresAt = null;
  await user.save();

  const token = generateToken({
    id: user._id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      isProfileCompleted: user.isProfileCompleted,
      address: user.address,
    },
  };
};

module.exports = {
  sendOtpService,
  verifyOtpService,
};
