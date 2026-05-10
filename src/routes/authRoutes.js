



const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authLoginController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const { registerValidation, validate, validateLogin } = require('../middlewares/validate');
const { registerLimiter } = require('../middlewares/rateLimiter');
const { loginLimiter } = require('../middlewares/rateLimit');

// ===================== PUBLIC ROUTES =====================

// Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Login API
router.post('/login', loginLimiter, validateLogin, authLoginController.login);

// Register page
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