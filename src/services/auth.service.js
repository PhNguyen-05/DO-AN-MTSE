const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginService = async (email, password) => {
    // Tìm user
    const user = await User.findOne({ email });
    if (!user) throw new Error('Email hoặc mật khẩu không chính xác.');

    // So sánh password thường
    if (password !== user.password) {
        throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    // Tạo JWT Access Token chứa id và role của user
    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' } // Token sống 15 phút [cite: 521]
    );

    return { accessToken, user: { id: user._id, email: user.email, role: user.role } };
};

module.exports = { loginService };