const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { createComment, getCommentsByTarget } = require("../controllers/commentController");

// Lấy danh sách comment theo target (công khai)
router.get("/", getCommentsByTarget);

// Người dùng đăng comment mới (cần đăng nhập)
router.post("/", authMiddleware, createComment);

module.exports = router;
