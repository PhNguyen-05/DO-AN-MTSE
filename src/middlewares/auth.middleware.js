const jwt = require('jsonwebtoken');

// Middleware xác thực token [cite: 535]
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Yêu cầu cần có access token.' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Token không hợp lệ hoặc đã hết hạn.' });
        }
        req.user = user; // Lưu thông tin giải mã vào req để dùng cho bước sau [cite: 535]
        next();
    });
};

// Middleware phân quyền dựa trên Role [cite: 345, 351]
const authorize = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Forbidden: Bạn không có quyền truy cập.' });
        }
        next();
    };
};

module.exports = { verifyToken, authorize };