const User = require("../models/user.model");
const AppError = require("../utils/appError");

const getMeService = async (userId) => {
  return User.findById(userId).select("-otp");
};

const completeProfileService = async (userId, payload) => {
  const { fullName, address } = payload;

  if (!fullName || !address) {
    throw new AppError("نام و آدرس الزامی است", 400);
  }

  const {
    province,
    city,
    fullAddress,
    plaque,
    unit,
    postalCode,
    receiverName,
    receiverPhone,
  } = address;

  if (
    !province ||
    !city ||
    !fullAddress ||
    !plaque ||
    !postalCode ||
    !receiverName ||
    !receiverPhone
  ) {
    throw new AppError("اطلاعات آدرس کامل نیست", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("کاربر پیدا نشد", 404);
  }

  user.fullName = fullName;
  user.address = {
    province,
    city,
    fullAddress,
    plaque,
    unit,
    postalCode,
    receiverName,
    receiverPhone,
  };
  user.isProfileCompleted = true;

  await user.save();
  return user;
};

const updateProfileService = async (userId, payload) => {
  const { fullName, address } = payload;

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("کاربر پیدا نشد", 404);
  }

  if (fullName !== undefined) user.fullName = fullName;

  if (address) {
    user.address = {
      ...user.address.toObject?.(),
      ...address,
    };
  }

  await user.save();
  return user;
};

const getAllUsersService = async () => {
  return User.find().select("-otp").sort("-createdAt");
};

const changeUserRoleService = async (userId, role) => {
  if (!["user", "admin"].includes(role)) {
    throw new AppError("نقش نامعتبر است", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("کاربر پیدا نشد", 404);
  }

  user.role = role;
  await user.save();

  return user;
};

module.exports = {
  getMeService,
  completeProfileService,
  updateProfileService,
  getAllUsersService,
  changeUserRoleService,
};
