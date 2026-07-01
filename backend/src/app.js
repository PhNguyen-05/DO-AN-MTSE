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
const blogRoutes = require("./routes/blogRoutes");
const promotionsRoutes = require("./routes/promotionsRoutes");
const premiumRoutes = require("./routes/premiumRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const vocabularyRoutes = require("./routes/vocabularyRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.set("trust proxy", 1);

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

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
      "POST /api/vocabulary/translate",
      "GET /api/vocabulary/notebook",
      "POST /api/vocabulary/notebook",
      "PATCH /api/vocabulary/notebook/:id/status",
      "DELETE /api/vocabulary/notebook/:id",
      "GET /user/exams",
      "GET /user/exams/:examId",
      "GET /user/exams/:examId/questions",
      "POST /user/exams/:examId/attempts",
      "GET /user/exams/:examId/attempts",
      "GET /user/attempts/summary",
      "GET /user/attempts/:attemptId",
      "GET /user/vocabulary-sets",
      "GET /user/analytics",
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
      "DELETE /admin/questions/:questionId",
      "GET /admin/vocabulary-sets",
      "POST /admin/vocabulary-sets",
      "PUT /admin/vocabulary-sets/:id",
      "DELETE /admin/vocabulary-sets/:id",
      "GET /admin/coupons",
      "POST /admin/coupons",
      "PUT /admin/coupons/:id",
      "DELETE /admin/coupons/:id",
      "POST /api/purchase",
      "GET /api/purchase-history",
      "GET /api/products/:productId",
      "GET /api/products/:productId/view"
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
app.use("/api/purchase", purchaseRoutes);
app.use("/api", blogRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

// Legacy auth API paths kept for existing Postman collections.
app.use("/", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
