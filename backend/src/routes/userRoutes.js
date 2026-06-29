const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getPublicExams,
  getExamById,
  getExamQuestions,
  getPracticeQuestions,
  submitAttempt,
  getAttemptResult,
  getAttemptHistory,
  getAccessibleVocabSets,
  getUserAnalytics,
  getAttemptsSummary,
} = require("../controllers/userController");

router.get("/exams", authMiddleware, getPublicExams);
router.get("/exams/:examId", authMiddleware, getExamById);
router.get("/exams/:examId/questions", authMiddleware, getExamQuestions);
router.post("/exams/:examId/attempts", authMiddleware, submitAttempt);
router.get("/exams/:examId/attempts", authMiddleware, getAttemptHistory);
router.get("/exams/:examId/practice-questions", authMiddleware, getPracticeQuestions);
router.get("/attempts/summary", authMiddleware, getAttemptsSummary);
router.get("/attempts/:attemptId", authMiddleware, getAttemptResult);
router.get("/vocabulary-sets", authMiddleware, getAccessibleVocabSets);
router.get("/analytics", authMiddleware, getUserAnalytics);

module.exports = router;
