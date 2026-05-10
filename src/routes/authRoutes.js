// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const authLoginController = require('../controllers/auth.controller');
// const { authenticate } = require('../middlewares/authenticate');
// const { authorize } = require('../middlewares/authorize');
// const { registerValidation, validate, validateLogin, validateLoginHandler } = require('../middlewares/validate');
// const { registerLimiter } = require('../middlewares/rateLimiter');
// const { loginLimiter } = require('../middlewares/rateLimit');

// // ===================== PUBLIC ROUTES =====================

// // Login page
// router.get('/login', (req, res) => {
//   res.render('login');
// });

// // Login API
// router.post('/login', loginLimiter, validateLogin, validateLoginHandler, authLoginController.login);

// // Register page
// router.get('/register', authController.getRegister);
// router.post('/register', registerLimiter, registerValidation, validate, authController.postRegister);

// router.get('/verify-otp', authController.getVerifyOTP);
// router.post('/verify-otp', authController.verifyOTP);

// // ===================== PROTECTED ROUTES =====================

// // User đã đăng nhập mới vào được
// router.get('/dashboard', authenticate, (req, res) => {
//   res.send(`Chào ${req.user.name}, đây là Dashboard!`);
// });

// // Chỉ Admin mới vào được
// router.get('/admin/dashboard', authenticate, authorize('admin'), (req, res) => {
//   res.send('Trang quản trị Admin - Chỉ Admin mới thấy được');
// });

// // Cả User và Admin đều vào được
// router.get('/profile', authenticate, authorize('user', 'admin'), (req, res) => {
//   res.send(`Profile của ${req.user.name} - Role: ${req.user.role}`);
// });

// module.exports = router;


const express = require('express');
const router = express.Router();

// Controller
const authController = require('../controllers/authController');

// Middlewares
const { registerLimiter, loginLimiter } = require('../middlewares/rateLimiter');
const { registerValidation, validate, validateLogin, validateLoginHandler } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// ======================== PUBLIC ROUTES ========================

// Register
router.get('/register', authController.getRegister);
router.post('/register', registerLimiter, registerValidation, validate, authController.postRegister);

// Verify OTP
router.get('/verify-otp', authController.getVerifyOTP);
router.post('/verify-otp', authController.verifyOTP);

// Login
router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', loginLimiter, validateLogin, validateLoginHandler, authController.login);

// ======================== PROTECTED ROUTES ========================

// Dashboard chung (User + Admin)
router.get('/dashboard', authenticate, authorize('user', 'admin'), (req, res) => {
    res.send(`Chào ${req.user.name}, đây là Dashboard!`);
});

// Admin Dashboard
router.get('/admin/dashboard', authenticate, authorize('admin'), (req, res) => {
    res.render('admin/dashboard', { user: req.user });
});

// User Profile
router.get('/profile', authenticate, authorize('user', 'admin'), (req, res) => {
    res.render('user/profile', { user: req.user });
});

// API lấy thông tin profile (nếu cần)
router.get('/api/profile', authenticate, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

module.exports = router;