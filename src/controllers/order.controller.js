const asyncHandler = require("../utils/asyncHandler");
const {
  createOrderService,
  getMyOrdersService,
  getMyOrderByIdService,
  getAllOrdersService,
  getOrderByIdAdminService,
  updateOrderStatusService,
  updatePaymentStatusService,
} = require("../services/order.service");

const createOrder = asyncHandler(async (req, res) => {
  const order = await createOrderService(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: "سفارش با موفقیت ثبت شد",
    order,
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await getMyOrdersService(req.user._id);

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await getMyOrderByIdService(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    order,
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await getAllOrdersService();

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

const getOrderByIdAdmin = asyncHandler(async (req, res) => {
  const order = await getOrderByIdAdminService(req.params.id);

  res.status(200).json({
    success: true,
    order,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await updateOrderStatusService(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "وضعیت سفارش بروزرسانی شد",
    order,
  });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await updatePaymentStatusService(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "وضعیت پرداخت بروزرسانی شد",
    order,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  updatePaymentStatus,
};
