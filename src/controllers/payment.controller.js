const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const Order = require("../models/order.model");
const { zibalRequest, zibalVerify } = require("../services/zibal.service");
const { deductStockForPaidOrder } = require("../services/order.service");

const requestZibalPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw new AppError("orderId الزامی است", 400);

  const order = await Order.findById(orderId).populate("user", "phone fullName");
  if (!order) throw new AppError("سفارش یافت نشد", 404);

  // فقط صاحب سفارش یا ادمین
  if (String(order.user._id) !== String(req.user._id) && req.user.role !== "admin") {
    throw new AppError("دسترسی غیرمجاز", 403);
  }

  if (order.paymentStatus === "paid") {
    throw new AppError("این سفارش قبلاً پرداخت شده است", 400);
  }

  if (order.paymentMethod !== "online") {
    throw new AppError("روش پرداخت این سفارش آنلاین نیست", 400);
  }

  // اگر قیمت‌ها تومان است:
  const amountRial = Number(order.totalPrice || 0) * 10;

  const { trackId, paymentUrl } = await zibalRequest({
    amountRial,
    description: `Order ${order._id}`,
    mobile: order.user?.phone || "",
  });

  order.paymentGateway = {
    name: "zibal",
    trackId,
    refNumber: "",
  };
  await order.save();

  res.json({
    success: true,
    trackId,
    paymentUrl,
  });
});
const zibalCallback = asyncHandler(async (req, res) => {
  const { success, trackId, refNumber } = req.query;
  const front = process.env.FRONT_URL || "http://localhost:3000";

  if (!trackId) {
    return res.redirect(`${front}/payment/failed?reason=no_trackId`);
  }

  const order = await Order.findOne({ "paymentGateway.trackId": String(trackId) });
  if (!order) {
    return res.redirect(`${front}/payment/failed?reason=order_not_found`);
  }

  // اگر قبلاً پرداخت شده بود
  if (order.paymentStatus === "paid") {
    return res.redirect(`${front}/payment/success?orderId=${order._id}`);
  }

  if (String(success) !== "1") {
    order.paymentStatus = "failed";
    await order.save();
    return res.redirect(`${front}/payment/failed?orderId=${order._id}`);
  }

  const ver = await zibalVerify({ trackId: String(trackId) });

  if (!ver.ok) {
    order.paymentStatus = "failed";
    await order.save();
    return res.redirect(`${front}/payment/failed?orderId=${order._id}`);
  }

  order.paymentStatus = "paid";
  order.paidAt = new Date();
  order.paymentGateway.refNumber = String(refNumber || "");
  await order.save();

  // کم کردن موجودی فقط بعد از پرداخت موفق
  await deductStockForPaidOrder(order._id);

  return res.redirect(`${front}/payment/success?orderId=${order._id}`);
});


module.exports = { requestZibalPayment, zibalCallback };