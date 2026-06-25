const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const {
  requestZibalPayment,
  zibalCallback,
} = require("../controllers/payment.controller");

const router = express.Router();

router.post("/zibal/request", protect, requestZibalPayment);
router.get("/zibal/callback", zibalCallback);

module.exports = router;