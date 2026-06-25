const express = require("express");
const {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  updatePaymentStatus,
} = require("../controllers/order.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getMyOrderById);

router.get("/admin", protect, adminOnly, getAllOrders);
router.get("/admin/:id", protect, adminOnly, getOrderByIdAdmin);
router.patch("/admin/:id/status", protect, adminOnly, updateOrderStatus);
router.patch("/admin/:id/payment", protect, adminOnly, updatePaymentStatus);

module.exports = router;
