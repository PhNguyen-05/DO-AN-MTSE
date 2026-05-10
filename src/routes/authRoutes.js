



// // SỬA 2 DÒNG NÀY
// const { registerValidation, validate } = require('../middlewares/validate');
// const { registerLimiter } = require('../middlewares/rateLimiter');

// // Đăng ký
// router.get('/register', authController.getRegister);
// router.post('/register', registerLimiter, registerValidation, validate, authController.postRegister);

// // Xác thực OTP


// module.exports = router;



const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const { registerValidation, validate } = require('../middlewares/validate');
const { registerLimiter } = require('../middlewares/rateLimiter');

// ===================== PUBLIC ROUTES =====================

router.get('/register', authController.getRegister);
router.post('/register', registerLimiter, registerValidation, validate, authController.postRegister);

router.get('/verify-otp', authController.getVerifyOTP);
router.post('/verify-otp', authController.verifyOTP);
// ===================== PROTECTED ROUTES =====================

// User đã đăng nhập mới vào được
router.get('/dashboard', authenticate, (req, res) => {
  res.send(`Chào ${req.user.name}, đây là Dashboard!`);
});

// Chỉ Admin mới vào được
router.get('/admin/dashboard', authenticate, authorize('admin'), (req, res) => {
  res.send('Trang quản trị Admin - Chỉ Admin mới thấy được');
});

// Cả User và Admin đều vào được
router.get('/profile', authenticate, authorize('user', 'admin'), (req, res) => {
  res.send(`Profile của ${req.user.name} - Role: ${req.user.role}`);
});

module.exports = router;