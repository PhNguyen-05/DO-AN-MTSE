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
const vocabularyRoutes = require("./routes/vocabularyRoutes");
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
      "DELETE /admin/questions/:questionId",
      "GET /admin/vocabulary-sets",
      "POST /admin/vocabulary-sets",
      "PUT /admin/vocabulary-sets/:id",
      "DELETE /admin/vocabulary-sets/:id",
      "GET /admin/coupons",
      "POST /admin/coupons",
      "PUT /admin/coupons/:id",
      "DELETE /admin/coupons/:id"
    ]
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", forgotPasswordRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
// Legacy auth API paths kept for existing Postman collections.
app.use("/", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
