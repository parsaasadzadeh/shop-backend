const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const PAYMENT_METHODS = ["online", "cash_on_delivery"];

module.exports = {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
};
 