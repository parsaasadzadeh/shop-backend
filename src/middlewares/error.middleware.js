const errorMiddleware = (err, req, res, next) => {
  console.error("ERROR:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "خطای داخلی سرور";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "شناسه ارسال شده معتبر نیست";
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = "این مقدار قبلاً ثبت شده است";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join("، ");
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "توکن نامعتبر است";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "توکن منقضی شده است";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};



module.exports = errorMiddleware;
