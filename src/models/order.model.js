const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    province: { type: String, default: "" },
    city: { type: String, default: "" },
    fullAddress: { type: String, default: "" },
    plaque: { type: String, default: "" },
    unit: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    receiverName: { type: String, default: "" },
    receiverPhone: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    itemsPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["online", "cash_on_delivery"],
      default: "online",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentGateway: {
      name: { type: String, default: "" },
      trackId: { type: String, default: "" },
      refNumber: { type: String, default: "" },
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingCode: {
      type: String,
      default: "",
    },
    stockDeducted: { type: Boolean, default: false },
    paidAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
