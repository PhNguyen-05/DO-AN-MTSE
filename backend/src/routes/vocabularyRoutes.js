// const express = require("express");
// const router = express.Router();

// const authMiddleware = require("../middlewares/authMiddleware");
// const { apiLimiter } = require("../middlewares/rateLimiter");

// const {
//   translateWord,
//   getNotebook,
//   addToNotebook,
//   updateWordStatus,
//   removeFromNotebook,
// } = require("../controllers/vocabularyController");


// // Tra từ qua Free Dictionary API - không cần đăng nhập
// // Nhưng dùng apiLimiter để tránh bị spam
// router.post("/translate", apiLimiter, translateWord);


// // Lấy danh sách từ trong sổ tay cá nhân (cần đăng nhập)
// router.get("/notebook", authMiddleware, getNotebook);


// // Thêm từ vào sổ tay cá nhân (cần đăng nhập)
// router.post("/notebook", authMiddleware, addToNotebook);


// // Cập nhật trạng thái "Đang học" / "Đã thuộc" (cần đăng nhập)
// router.patch("/notebook/:id/status", authMiddleware, updateWordStatus);


// // Xóa từ khỏi sổ tay (cần đăng nhập)
// router.delete("/notebook/:id", authMiddleware, removeFromNotebook);

// module.exports = router;




const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { apiLimiter } = require("../middlewares/rateLimiter");

const {
  translateWord,
  getNotebook,
  addToNotebook,
  updateWordStatus,
  removeFromNotebook,
} = require("../controllers/vocabularyController");

// POST /api/vocabulary/translate
// Tra từ - không cần đăng nhập, nhưng có rate limit chống spam
router.post("/translate", apiLimiter, translateWord);

// GET /api/vocabulary/notebook
// Lấy sổ tay từ vựng cá nhân (cần đăng nhập)
router.get("/notebook", authMiddleware, getNotebook);

// POST /api/vocabulary/notebook
// Thêm từ vào sổ tay (cần đăng nhập)
router.post("/notebook", authMiddleware, addToNotebook);

// PATCH /api/vocabulary/notebook/:id/status
// Đổi trạng thái Đang học / Đã thuộc (cần đăng nhập)
router.patch("/notebook/:id/status", authMiddleware, updateWordStatus);

// DELETE /api/vocabulary/notebook/:id
// Xóa từ khỏi sổ tay (cần đăng nhập)
router.delete("/notebook/:id", authMiddleware, removeFromNotebook);

module.exports = router;