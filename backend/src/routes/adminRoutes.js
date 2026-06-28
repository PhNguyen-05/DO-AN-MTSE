const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { apiLimiter } = require("../middlewares/rateLimiter");
const { validateProfileUpdate } = require("../middlewares/validationMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { handleGetProfile, handleProfileUpdate } = require("../controllers/profileController");
const {
  createCoupon,
  createExam,
  createQuestion,
  createVocabularySet,
  deleteCoupon,
  deleteExam,
  deleteQuestion,
  deleteVocabularySet,
  getDashboardStats,
  getInteractionStats,
  importExams,
  importQuestionsFromExamPdf,
  listCoupons,
  listExams,
  listQuestions,
  listVocabularySets,
  updateCoupon,
  updateQuestion,
  updateExam,
  updateVocabularySet,
  // Blog Post
  listBlogPosts,
  createBlogPost,
  updateBlogPost,
  approveBlogPost,
  deleteBlogPost,
  // Comment
  listComments,
  createComment,
  hideComment,
  showComment,
  deleteComment
} = require("../controllers/adminController");

const adminOrManager = roleMiddleware("admin", "manager");
const examUpload = upload.fields([
  { name: "pdf", maxCount: 1 },
  { name: "answerPdf", maxCount: 1 },
  { name: "audios", maxCount: 20 }
]);
const vocabularyUpload = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "wordAudios", maxCount: 200 },
  { name: "wordImages", maxCount: 200 }
]);
const blogUpload = upload.fields([
  { name: "thumbnail", maxCount: 1 }
]);
const adminOnly = roleMiddleware("admin");

// Admin Profile Routes
router.get("/profile", authMiddleware, adminOrManager, handleGetProfile);
router.put("/profile", authMiddleware, adminOrManager, apiLimiter, upload.single("avatar"), validateProfileUpdate, handleProfileUpdate);

router.get("/dashboard", authMiddleware, adminOrManager, getDashboardStats);
router.get("/interaction-stats", authMiddleware, adminOrManager, getInteractionStats);
router.get("/exams", authMiddleware, adminOrManager, listExams);
router.post("/exams", authMiddleware, adminOrManager, examUpload, createExam);
router.put("/exams/:id", authMiddleware, adminOrManager, examUpload, updateExam);
router.delete("/exams/:id", authMiddleware, adminOrManager, deleteExam);
router.post("/exams/import", authMiddleware, adminOrManager, importExams);
router.get("/exams/:examId/questions", authMiddleware, adminOrManager, listQuestions);
router.post("/exams/:examId/questions/import-pdf", authMiddleware, adminOrManager, importQuestionsFromExamPdf);
router.post("/exams/:examId/questions", authMiddleware, adminOrManager, createQuestion);
router.put("/questions/:questionId", authMiddleware, adminOrManager, updateQuestion);
router.delete("/questions/:questionId", authMiddleware, adminOrManager, deleteQuestion);
router.get("/vocabulary-sets", authMiddleware, adminOrManager, listVocabularySets);
router.post("/vocabulary-sets", authMiddleware, adminOrManager, vocabularyUpload, createVocabularySet);
router.put("/vocabulary-sets/:id", authMiddleware, adminOrManager, vocabularyUpload, updateVocabularySet);
router.delete("/vocabulary-sets/:id", authMiddleware, adminOrManager, deleteVocabularySet);
router.get("/coupons", authMiddleware, adminOrManager, listCoupons);
router.post("/coupons", authMiddleware, adminOrManager, createCoupon);
router.put("/coupons/:id", authMiddleware, adminOrManager, updateCoupon);
router.delete("/coupons/:id", authMiddleware, adminOrManager, deleteCoupon);

// Blog Post Routes
router.get("/blog-posts", authMiddleware, adminOrManager, listBlogPosts);
router.post("/blog-posts", authMiddleware, adminOrManager, blogUpload, createBlogPost);
router.put("/blog-posts/:id", authMiddleware, adminOrManager, blogUpload, updateBlogPost);
router.put("/blog-posts/:id/approve", authMiddleware, adminOnly, approveBlogPost);
router.delete("/blog-posts/:id", authMiddleware, adminOrManager, deleteBlogPost);

// Comment Routes
router.get("/comments", authMiddleware, adminOrManager, listComments);
router.post("/comments", authMiddleware, adminOrManager, createComment);
router.put("/comments/:id/hide", authMiddleware, adminOrManager, hideComment);
router.put("/comments/:id/show", authMiddleware, adminOrManager, showComment);
router.delete("/comments/:id", authMiddleware, adminOrManager, deleteComment);

module.exports = router;
