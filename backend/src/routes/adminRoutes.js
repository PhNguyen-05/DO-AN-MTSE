const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { apiLimiter } = require("../middlewares/rateLimiter");
const { validateProfileUpdate } = require("../middlewares/validationMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { handleGetProfile, handleProfileUpdate } = require("../controllers/profileController");
const {
  createExam,
  deleteExam,
  getDashboardStats,
  importExams,
  listExams,
  updateExam
} = require("../controllers/adminController");

const adminOrManager = roleMiddleware("admin", "manager");
const examUpload = upload.fields([
  { name: "pdf", maxCount: 1 },
  { name: "audios", maxCount: 20 }
]);

// Admin Profile Routes
router.get("/profile", authMiddleware, adminOrManager, handleGetProfile);
router.put("/profile", authMiddleware, adminOrManager, apiLimiter, upload.single("avatar"), validateProfileUpdate, handleProfileUpdate);

router.get("/dashboard", authMiddleware, adminOrManager, getDashboardStats);
router.get("/exams", authMiddleware, adminOrManager, listExams);
router.post("/exams", authMiddleware, adminOrManager, examUpload, createExam);
router.put("/exams/:id", authMiddleware, adminOrManager, examUpload, updateExam);
router.delete("/exams/:id", authMiddleware, adminOrManager, deleteExam);
router.post("/exams/import", authMiddleware, adminOrManager, importExams);

module.exports = router;
