const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const catalogueRoutes = require("./routes/catalogueRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const promotionsRoutes = require("./routes/promotionsRoutes");
const premiumRoutes = require("./routes/premiumRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "TOEIC practice backend API is running",
    frontend: "Run the React app in the frontend folder."
  });
});

app.get("/api-info", (req, res) => {
  res.json({
    message: "TOEIC practice backend API is running",
    endpoints: [
      "POST /api/auth/register",
      "POST /api/auth/verify-otp",
      "POST /api/auth/login",
      "POST /api/forgot-password",
      "POST /api/verify-otp",
      "POST /api/reset-password",
      "GET /api/home",
      "GET /api/products",
      "GET /api/products/best-sellers",
      "GET /api/products/most-viewed",
      "GET /api/profile",
      "PUT /api/profile",
      "GET /admin/dashboard",
      "GET /admin/exams",
      "POST /admin/exams",
      "PUT /admin/exams/:id",
      "DELETE /admin/exams/:id",
      "POST /admin/exams/import",
      "GET /admin/exams/:examId/questions",
      "POST /admin/exams/:examId/questions/import-pdf",
      "POST /admin/exams/:examId/questions",
      "PUT /admin/questions/:questionId",
      "POST /admin/questions/:questionId",
      "POST /api/purchase",
      "GET /api/purchase-history"
    ]
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", catalogueRoutes);
app.use("/api", promotionsRoutes);
app.use("/api", premiumRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", profileRoutes);
app.use("/api", forgotPasswordRoutes);
app.use("/api", purchaseRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

// Legacy auth API paths kept for existing Postman collections.
app.use("/", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
