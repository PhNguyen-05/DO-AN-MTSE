const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { apiLimiter } = require("../middlewares/rateLimiter");
const { validateProfileUpdate } = require("../middlewares/validationMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { handleGetProfile, handleProfileUpdate } = require("../controllers/profileController");
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
  saveLearningGoal,
} = require("../controllers/userController");

// User Profile Routes
router.get("/profile", authMiddleware, roleMiddleware("user"), handleGetProfile);
router.put("/profile", authMiddleware, roleMiddleware("user"), apiLimiter, upload.single("avatar"), validateProfileUpdate, handleProfileUpdate);

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
router.put("/learning-goal", authMiddleware, saveLearningGoal);

module.exports = router;
