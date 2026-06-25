const asyncHandler = require("../utils/asyncHandler");
const {
  getMeService,
  completeProfileService,
  updateProfileService,
  getAllUsersService,
  changeUserRoleService,
} = require("../services/user.service");

const getMe = asyncHandler(async (req, res) => {
  const user = await getMeService(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

const completeProfile = asyncHandler(async (req, res) => {
  const user = await completeProfileService(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: "پروفایل تکمیل شد",
    user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateProfileService(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: "پروفایل بروزرسانی شد",
    user,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsersService();

  res.status(200).json({
    success: true,
    results: users.length,
    users,
  });
});

const changeUserRole = asyncHandler(async (req, res) => {
  const user = await changeUserRoleService(req.params.id, req.body.role);

  res.status(200).json({
    success: true,
    message: "نقش کاربر تغییر کرد",
    user,
  });
});

module.exports = {
  getMe,
  completeProfile,
  updateProfile,
  getAllUsers,
  changeUserRole,
};
