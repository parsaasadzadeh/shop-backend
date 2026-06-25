const AppError = require("../utils/appError");

const ZIBAL_BASE = process.env.ZIBAL_API_BASE || "https://gateway.zibal.ir";
const MERCHANT = process.env.ZIBAL_MERCHANT;
const CALLBACK = process.env.ZIBAL_CALLBACK_URL;

const zibalRequest = async ({ amountRial, description, mobile }) => {
  if (!MERCHANT) throw new AppError("ZIBAL_MERCHANT تنظیم نشده", 500);
  if (!CALLBACK) throw new AppError("ZIBAL_CALLBACK_URL تنظیم نشده", 500);

  const res = await fetch(`${ZIBAL_BASE}/v1/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant: MERCHANT,
      amount: amountRial,
      callbackUrl: CALLBACK,
      description,
      mobile,
    }),
  });

  const data = await res.json();
  // معمولاً result=100 یعنی ok (در بعضی نمونه‌ها اینطور است)
  if (!data || data.result !== 100 || !data.trackId) {
    throw new AppError(data?.message || "خطا در ایجاد تراکنش زیبال", 400);
  }

  return {
    trackId: String(data.trackId),
    paymentUrl: `${ZIBAL_BASE.replace("/v1", "")}/start/${data.trackId}`,
  };
};

const zibalVerify = async ({ trackId }) => {
  const res = await fetch(`${ZIBAL_BASE}/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchant: MERCHANT, trackId }),
  });

  const data = await res.json();

  // طبق مستندات: 100 موفق، 201 قبلا تایید شده، 202 پرداخت نشده :contentReference[oaicite:4]{index=4}
  const ok = data?.result === 100 || data?.result === 201;

  return { ok, data };
};

module.exports = { zibalRequest, zibalVerify };