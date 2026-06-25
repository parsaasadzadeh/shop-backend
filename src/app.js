const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const routes = require("./routes");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// app.use(helmet());
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Clothing Shop API is running...",
  });
});

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
