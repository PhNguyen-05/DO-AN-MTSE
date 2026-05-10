const rateLimit = require('express-rate-limit');

// Giới hạn API login tối đa 5 lần thử mỗi 15 phút [cite: 334]
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút." }
});

module.exports = { loginLimiter };