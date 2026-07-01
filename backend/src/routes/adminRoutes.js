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
  deleteComment,
  // User
  listUsers,
  updateUserRole,
  updateUserStatus
} = require("../controllers/adminController");

const adminOrStaff = roleMiddleware("admin", "manager", "employee");
const adminOnly = roleMiddleware("admin");

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

// Admin Profile Routes
router.get("/profile", authMiddleware, adminOrStaff, handleGetProfile);
router.put("/profile", authMiddleware, adminOrStaff, apiLimiter, upload.single("avatar"), validateProfileUpdate, handleProfileUpdate);

router.get("/dashboard", authMiddleware, adminOrStaff, getDashboardStats);
router.get("/interaction-stats", authMiddleware, adminOrStaff, getInteractionStats);
router.get("/exams", authMiddleware, adminOrStaff, listExams);
router.post("/exams", authMiddleware, adminOrStaff, examUpload, createExam);
router.put("/exams/:id", authMiddleware, adminOrStaff, examUpload, updateExam);
router.delete("/exams/:id", authMiddleware, adminOrStaff, deleteExam);
router.post("/exams/import", authMiddleware, adminOrStaff, importExams);
router.get("/exams/:examId/questions", authMiddleware, adminOrStaff, listQuestions);
router.post("/exams/:examId/questions/import-pdf", authMiddleware, adminOrStaff, importQuestionsFromExamPdf);
router.post("/exams/:examId/questions", authMiddleware, adminOrStaff, createQuestion);
router.put("/questions/:questionId", authMiddleware, adminOrStaff, updateQuestion);
router.delete("/questions/:questionId", authMiddleware, adminOrStaff, deleteQuestion);
router.get("/vocabulary-sets", authMiddleware, adminOrStaff, listVocabularySets);
router.post("/vocabulary-sets", authMiddleware, adminOrStaff, vocabularyUpload, createVocabularySet);
router.put("/vocabulary-sets/:id", authMiddleware, adminOrStaff, vocabularyUpload, updateVocabularySet);
router.delete("/vocabulary-sets/:id", authMiddleware, adminOrStaff, deleteVocabularySet);
router.get("/coupons", authMiddleware, adminOrStaff, listCoupons);
router.post("/coupons", authMiddleware, adminOrStaff, createCoupon);
router.put("/coupons/:id", authMiddleware, adminOrStaff, updateCoupon);
router.delete("/coupons/:id", authMiddleware, adminOrStaff, deleteCoupon);

// Blog Post Routes
router.get("/blog-posts", authMiddleware, adminOrStaff, listBlogPosts);
router.post("/blog-posts", authMiddleware, adminOrStaff, blogUpload, createBlogPost);
router.put("/blog-posts/:id", authMiddleware, adminOrStaff, blogUpload, updateBlogPost);
router.put("/blog-posts/:id/approve", authMiddleware, adminOnly, approveBlogPost);
router.delete("/blog-posts/:id", authMiddleware, adminOrStaff, deleteBlogPost);

// Comment Routes
router.get("/comments", authMiddleware, adminOrStaff, listComments);
router.post("/comments", authMiddleware, adminOrStaff, createComment);
router.put("/comments/:id/hide", authMiddleware, adminOrStaff, hideComment);
router.put("/comments/:id/show", authMiddleware, adminOrStaff, showComment);
router.delete("/comments/:id", authMiddleware, adminOrStaff, deleteComment);

// User Management Routes (Admin only)
router.get("/users", authMiddleware, adminOnly, listUsers);
router.patch("/users/:id/role", authMiddleware, adminOnly, updateUserRole);
router.patch("/users/:id/status", authMiddleware, adminOnly, updateUserStatus);

module.exports = router;
