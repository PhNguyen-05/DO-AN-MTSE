// const express = require("express");
// const path = require("path");
// const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");

// const authRoutes = require("./routes/authRoutes");
// const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
// const profileRoutes = require("./routes/profileRoutes");
// const userRoutes = require("./routes/userRoutes");
// const adminRoutes = require("./routes/adminRoutes");
// const vocabularyRoutes = require("./routes/vocabularyRoutes");
// const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

// const app = express();

// app.set("trust proxy", 1);

// app.use(helmet());
// app.use(cors());
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// app.get("/", (req, res) => {
//   res.json({
//     message: "TOEIC practice backend API is running",
//     frontend: "Run the React app in the frontend folder."
//   });
// });

// app.get("/api-info", (req, res) => {
//   res.json({
//     message: "TOEIC practice backend API is running",
//     endpoints: [
//       "POST /api/auth/register",
//       "POST /api/auth/verify-otp",
//       "POST /api/auth/login",
//       "POST /api/forgot-password",
//       "POST /api/verify-otp",
//       "POST /api/reset-password",
//       "GET /api/profile",
//       "PUT /api/profile",
//       "GET /admin/dashboard",
//       "GET /admin/exams",
//       "POST /admin/exams",
//       "PUT /admin/exams/:id",
//       "DELETE /admin/exams/:id",
//       "POST /admin/exams/import",
//       "GET /admin/exams/:examId/questions",
//       "POST /admin/exams/:examId/questions/import-pdf",
//       "POST /admin/exams/:examId/questions",
//       "PUT /admin/questions/:questionId",
//       "DELETE /admin/questions/:questionId",
//       "GET /admin/vocabulary-sets",
//       "POST /admin/vocabulary-sets",
//       "PUT /admin/vocabulary-sets/:id",
//       "DELETE /admin/vocabulary-sets/:id",
//       "GET /admin/coupons",
//       "POST /admin/coupons",
//       "PUT /admin/coupons/:id",
//       "DELETE /admin/coupons/:id"
//     ]
//   });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api", profileRoutes);
// app.use("/api", forgotPasswordRoutes);
// app.use("/user", userRoutes);
// app.use("/admin", adminRoutes);
// app.use("/api/vocabulary", vocabularyRoutes);
// // Legacy auth API paths kept for existing Postman collections.
// app.use("/", authRoutes);

// app.use(notFound);
// app.use(errorHandler);

// module.exports = app;



const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");         // ← user routes mới
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
    frontend: "Run the React app in the frontend folder.",
  });
});

app.get("/api-info", (req, res) => {
  res.json({
    message: "TOEIC practice backend API is running",
    endpoints: [
      // Auth
      "POST /api/auth/register",
      "POST /api/auth/verify-otp",
      "POST /api/auth/login",
      "POST /api/forgot-password",
      "POST /api/verify-otp",
      "POST /api/reset-password",
      // Profile
      "GET  /api/profile",
      "PUT  /api/profile",
      // Vocabulary (notebook cá nhân)
      "POST /api/vocabulary/translate",
      "GET  /api/vocabulary/notebook",
      "POST /api/vocabulary/notebook",
      "PATCH /api/vocabulary/notebook/:id/status",
      "DELETE /api/vocabulary/notebook/:id",
      // User – Exam
      "GET  /user/exams",
      "GET  /user/exams/:examId",
      "GET  /user/exams/:examId/questions",
      "POST /user/exams/:examId/attempts",
      "GET  /user/exams/:examId/attempts",
      // User – Attempt
      "GET  /user/attempts/summary",
      "GET  /user/attempts/:attemptId",
      // User – Vocabulary sets
      "GET  /user/vocabulary-sets",
      // User – Analytics
      "GET  /user/analytics",
      // Admin
      "GET  /admin/dashboard",
      "GET  /admin/exams",
      "POST /admin/exams",
      "PUT  /admin/exams/:id",
      "DELETE /admin/exams/:id",
      "POST /admin/exams/import",
      "GET  /admin/exams/:examId/questions",
      "POST /admin/exams/:examId/questions/import-pdf",
      "POST /admin/exams/:examId/questions",
      "PUT  /admin/questions/:questionId",
      "DELETE /admin/questions/:questionId",
      "GET  /admin/vocabulary-sets",
      "POST /admin/vocabulary-sets",
      "PUT  /admin/vocabulary-sets/:id",
      "DELETE /admin/vocabulary-sets/:id",
      "GET  /admin/coupons",
      "POST /admin/coupons",
      "PUT  /admin/coupons/:id",
      "DELETE /admin/coupons/:id",
    ],
  });
});

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", forgotPasswordRoutes);
app.use("/user", userRoutes);          // ← mount tại /user
app.use("/admin", adminRoutes);
app.use("/api/vocabulary", vocabularyRoutes);

// Legacy auth paths — giữ lại cho Postman collections cũ
app.use("/", authRoutes);

// ─── Error handling ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;