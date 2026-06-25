const Order = require("../models/order.model");
const Product = require("../models/product.model");
const AppError = require("../utils/appError");
const deductStockForPaidOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("سفارش یافت نشد", 404);
  }

  if (order.stockDeducted) {
    return order; // قبلاً کم شده، دوباره کم نکن
  }

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new AppError(`محصول ${item.title} یافت نشد`, 404);
    }

    const selectedSize = product.sizes.find((s) => s.size === item.size);
    if (!selectedSize) {
      throw new AppError(`سایز ${item.size} برای ${product.title} یافت نشد`, 400);
    }

    if (selectedSize.stock < item.quantity) {
      throw new AppError(`موجودی ${product.title} کافی نیست`, 400);
    }

    selectedSize.stock -= item.quantity;
    await product.save();
  }

  order.stockDeducted = true;
  await order.save();

  return order;
};
const createOrderService = async (userId, payload) => {
  const { items, shippingAddress, paymentMethod } = payload;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError("سبد خرید خالی است", 400);
  }

  if (!shippingAddress) {
    throw new AppError("آدرس ارسال الزامی است", 400);
  }

  const orderItems = [];
  let itemsPrice = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) throw new AppError(`محصولی با شناسه ${item.product} یافت نشد`, 404);
    if (!product.isPublished) throw new AppError(`محصول ${product.title} فعال نیست`, 400);

    const selectedSize = product.sizes.find((s) => s.size === item.size);
    if (!selectedSize) throw new AppError(`سایز ${item.size} برای ${product.title} موجود نیست`, 400);

    if (selectedSize.stock < item.quantity) {
      throw new AppError(`موجودی ${product.title} کافی نیست`, 400);
    }

    const itemTotalPrice = product.finalPrice * item.quantity;

    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.images[0] || "",
      size: item.size,
      color: item.color || "",
      quantity: item.quantity,
      price: product.finalPrice,
      totalPrice: itemTotalPrice,
    });

    itemsPrice += itemTotalPrice;
  }

  const shippingPrice = itemsPrice >= 2000000 ? 0 : 80000;
  const discountAmount = 0;
  const totalPrice = itemsPrice + shippingPrice - discountAmount;

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    paymentMethod: paymentMethod || "online",
    paymentStatus: paymentMethod === "cash_on_delivery" ? "pending" : "pending",
    orderStatus: "pending",
    stockDeducted: false,
  });

  return order;
};


const getMyOrdersService = async (userId) => {
  return Order.find({ user: userId }).sort("-createdAt");
};

const getMyOrderByIdService = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).populate("items.product");

  if (!order) {
    throw new AppError("سفارش یافت نشد", 404);
  }

  return order;
};

const getAllOrdersService = async () => {
  return Order.find().populate("user", "fullName phone").sort("-createdAt");
};

const getOrderByIdAdminService = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user", "fullName phone")
    .populate("items.product");

  if (!order) {
    throw new AppError("سفارش یافت نشد", 404);
  }

  return order;
};

const updateOrderStatusService = async (orderId, payload) => {
  const { orderStatus, trackingCode } = payload;
  const allowedStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(orderStatus)) {
    throw new AppError("وضعیت سفارش معتبر نیست", 400);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("سفارش یافت نشد", 404);
  }

  order.orderStatus = orderStatus;

  if (trackingCode !== undefined) {
    order.trackingCode = trackingCode;
  }

  if (orderStatus === "delivered") {
    order.deliveredAt = new Date();
  }

  await order.save();
  return order;
};
const updatePaymentStatusService = async (orderId, payload) => {
  const { paymentStatus } = payload;
  const allowedStatuses = ["pending", "paid", "failed", "refunded"];

  if (!allowedStatuses.includes(paymentStatus)) {
    throw new AppError("وضعیت پرداخت معتبر نیست", 400);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("سفارش یافت نشد", 404);
  }

  order.paymentStatus = paymentStatus;

  if (paymentStatus === "paid" && !order.paidAt) {
    order.paidAt = new Date();
  }

  await order.save();

  if (paymentStatus === "paid" && !order.stockDeducted) {
    await deductStockForPaidOrder(order._id);
  }

  return await Order.findById(orderId);
};


module.exports = {
  createOrderService,
  getMyOrdersService,
  getMyOrderByIdService,
  getAllOrdersService,
  getOrderByIdAdminService,
  updateOrderStatusService,
  updatePaymentStatusService,
  deductStockForPaidOrder
};
