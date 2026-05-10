const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth.controller');

const { loginLimiter } = require('../middlewares/rateLimit');
const { validateLogin } = require('../middlewares/validate');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

// ================= VIEW ROUTES =================

// Login Page
router.get('/login', (req, res) => {
    res.render('login');
});

// User Profile Page
router.get('/user/profile', (req, res) => {
    res.render('profile');
});

// Admin Profile Page
router.get('/admin/profile', (req, res) => {
    res.render('profile');
});

// ================= API ROUTES =================

// Login API
router.post(
    '/login',
    loginLimiter,
    validateLogin,
    authController.login
);

// User Profile API
router.get(
    '/user/profile/data',
    verifyToken,
    authorize('user'),
    authController.getUserProfile
);

// Admin Profile API
router.get(
    '/admin/profile/data',
    verifyToken,
    authorize('admin'),
    authController.getAdminProfile
);

module.exports = router;