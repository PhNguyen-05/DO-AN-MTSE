// const express = require("express");
// const router = express.Router();

// const authMiddleware = require("../middlewares/authMiddleware");
// const roleMiddleware = require("../middlewares/roleMiddleware");
// const { apiLimiter } = require("../middlewares/rateLimiter");
// const { validateProfileUpdate } = require("../middlewares/validationMiddleware");
// const upload = require("../middlewares/uploadMiddleware");

// const { handleGetProfile, handleProfileUpdate } = require("../controllers/profileController");

// const Exam = require("../models/Exam");
// const Question = require("../models/Question");
// const ExamAttempt = require("../models/ExamAttempt");

// // ====================== USER PROFILE ROUTES ======================
// router.get("/profile", authMiddleware, roleMiddleware("user"), handleGetProfile);
// router.put("/profile", authMiddleware, roleMiddleware("user"), apiLimiter, upload.single("avatar"), validateProfileUpdate, handleProfileUpdate);

// // ====================== PUBLIC ROUTES (Guest có thể xem) ======================
// router.get("/exams", async (req, res) => {
//   try {
//     const exams = await Exam.find({ isHidden: false })
//       .select("name releaseYear difficulty priceBundle priceListening priceReading pdfUrl audioUrls")
//       .sort({ releaseYear: -1, name: 1 });
//     res.json(exams);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ====================== USER ROUTES (Phải đăng nhập) ======================

// // GET /api/exams/:id
// router.get("/exams/:id", authMiddleware, async (req, res) => {
//   try {
//     const exam = await Exam.findById(req.params.id);
//     if (!exam || exam.isHidden) {
//       return res.status(404).json({ message: "Không tìm thấy đề thi" });
//     }
//     res.json(exam);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/exams/:id/questions
// router.get("/exams/:id/questions", authMiddleware, async (req, res) => {
//   try {
//     const questions = await Question.find({ exam: req.params.id })
//       .select("part questionNumber readingPassage answers correctAnswer explanation")
//       .sort({ questionNumber: 1 });

//     res.json(questions);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/exams/:id/submit
// router.post("/exams/:id/submit", authMiddleware, apiLimiter, async (req, res) => {
//   try {
//     const { answers, timeSpent, bookmarked } = req.body;
//     const userId = req.user._id;
//     const examId = req.params.id;

//     if (!answers || Object.keys(answers).length === 0) {
//       return res.status(400).json({ message: "Chưa có câu trả lời nào" });
//     }

//     const questions = await Question.find({ exam: examId });
//     let correctCount = 0;

//     questions.forEach((q) => {
//       if (answers[q.questionNumber] === q.correctAnswer) {
//         correctCount++;
//       }
//     });

//     const score = Math.round((correctCount / questions.length) * 990);

//     const attempt = await ExamAttempt.create({
//       user: userId,
//       exam: examId,
//       status: "completed",
//       score: score,
//       completedAt: new Date()
//     });

//     res.status(201).json({
//       success: true,
//       message: "Nộp bài thành công!",
//       attemptId: attempt._id,
//       score,
//       correctCount,
//       totalQuestions: questions.length,
//       accuracy: Math.round((correctCount / questions.length) * 100)
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/exam-attempts/:attemptId  - Xem kết quả chi tiết
// router.get("/exam-attempts/:attemptId", authMiddleware, async (req, res) => {
//   try {
//     const attempt = await ExamAttempt.findById(req.params.attemptId)
//       .populate("exam", "name releaseYear")
//       .populate("user", "name email");

//     if (!attempt) {
//       return res.status(404).json({ message: "Không tìm thấy kết quả" });
//     }

//     // Chỉ cho phép xem kết quả của chính mình (trừ Admin)
//     if (attempt.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
//       return res.status(403).json({ message: "Không có quyền xem kết quả này" });
//     }

//     const questions = await Question.find({ exam: attempt.exam._id })
//       .select("questionNumber correctAnswer explanation answers readingPassage part")
//       .sort({ questionNumber: 1 });

//     res.json({
//       success: true,
//       attempt,
//       questions,
//       exam: attempt.exam
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/exams/:examId/attempts - Lấy lịch sử làm bài của user theo đề thi
// router.get("/exams/:examId/attempts", authMiddleware, async (req, res) => {
//   try {
//     const attempts = await ExamAttempt.find({
//       user: req.user._id,
//       exam: req.params.examId
//     })
//     .sort({ completedAt: -1 })
//     .select("score completedAt timeSpent")
//     .lean();

//     res.json(attempts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getPublicExams,
  getExamById,
  getExamQuestions,
  submitAttempt,
  getAttemptResult,
  getAttemptHistory,
  getAccessibleVocabSets,
  getUserAnalytics,
  getAttemptsSummary,
} = require("../controllers/userController");

// ─────────────────────────────────────────────
// Tất cả route đều yêu cầu đăng nhập
// ─────────────────────────────────────────────

// ── Exam routes ──────────────────────────────
// GET  /user/exams               → Danh sách đề (ExamList.jsx)
// GET  /user/exams/:examId       → Chi tiết đề  (TakeExam.jsx)
// GET  /user/exams/:examId/questions  → Câu hỏi không có đáp án (TakeExam.jsx)
// POST /user/exams/:examId/attempts   → Nộp bài, tính điểm  (TakeExam.jsx)
// GET  /user/exams/:examId/attempts   → Lịch sử làm bài 1 đề (ExamHistory.jsx)
router.get("/exams", authMiddleware, getPublicExams);
router.get("/exams/:examId", authMiddleware, getExamById);
router.get("/exams/:examId/questions", authMiddleware, getExamQuestions);
router.post("/exams/:examId/attempts", authMiddleware, submitAttempt);
router.get("/exams/:examId/attempts", authMiddleware, getAttemptHistory);

// ── Attempt routes ───────────────────────────
// GET /user/attempts/summary          → Map examId→stats cho ExamList.jsx
// GET /user/attempts/:attemptId       → Kết quả chi tiết (ExamResult.jsx)
//
// LƯU Ý: route "summary" phải đứng TRƯỚC ":attemptId"
// để Express không nhầm "summary" là một attemptId
router.get("/attempts/summary", authMiddleware, getAttemptsSummary);
router.get("/attempts/:attemptId", authMiddleware, getAttemptResult);

// ── Vocabulary routes ────────────────────────
// GET /user/vocabulary-sets  → Danh sách bộ từ + quyền truy cập (VocabularyHub.jsx)
router.get("/vocabulary-sets", authMiddleware, getAccessibleVocabSets);

// ── Analytics route ──────────────────────────
// GET /user/analytics  → Thống kê học tập (UserAnalytics.jsx)
router.get("/analytics", authMiddleware, getUserAnalytics);

module.exports = router;