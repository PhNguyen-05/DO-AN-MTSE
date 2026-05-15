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
const User = require('../models/User');

// Middlewares
const { registerLimiter, loginLimiter } = require('../middlewares/rateLimiter');
const { registerValidation, validate, validateLogin, validateLoginHandler } = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/auth.middleware');
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
router.get('/dashboard', verifyToken, authorize('user', 'admin'), (req, res) => {
    res.send(`Chào ${req.user.name}, đây là Dashboard!`);
});

// Admin Dashboard page
router.get('/admin/dashboard', (req, res) => {
    res.render('profile');
});

// User Profile page
router.get('/profile', (req, res) => {
    res.render('profile');
});

// API lấy thông tin profile
router.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email role');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin người dùng.' });
    }
});

router.get('/user/profile/data', verifyToken, authorize('user'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email role');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
        }

        res.json({
            success: true,
            message: `Thông tin cá nhân của ${user.name}`,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin user profile.' });
    }
});

router.get('/admin/profile/data', verifyToken, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email role');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
        }

        const displayName = user.name || user.email || 'Admin';

        res.json({
            success: true,
            message: `Thông tin quản trị viên ${displayName}`,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin admin profile.' });
    }
});

module.exports = router;