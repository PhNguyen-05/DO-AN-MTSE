const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// SỬA 2 DÒNG NÀY
const { registerValidation, validate } = require('../middlewares/validate');
const { registerLimiter } = require('../middlewares/rateLimiter');

// Đăng ký
router.get('/register', authController.getRegister);
router.post('/register', registerLimiter, registerValidation, validate, authController.postRegister);

// Xác thực OTP
router.get('/verify-otp', authController.getVerifyOTP);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;