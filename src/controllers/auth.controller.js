const authService = require('../services/auth.service');

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await authService.loginService(email, password);

        let redirectUrl = '/user/profile';

        if (result.user.role === 'admin') {
            redirectUrl = '/admin/profile';
        }

        res.status(200).json({
            message: 'Đăng nhập thành công!',
            accessToken: result.accessToken,
            user: result.user,
            redirectUrl
        });

    } catch (error) {
        res.status(401).json({
            message: error.message
        });
    }
};

// User Profile API
const getUserProfile = (req, res) => {
    res.status(200).json({
        message: `Chào mừng Học viên`
    });
};

// Admin Profile API
const getAdminProfile = (req, res) => {
    res.status(200).json({
        message: `Chào mừng Quản trị viên`
    });
};

module.exports = {
    login,
    getUserProfile,
    getAdminProfile
};