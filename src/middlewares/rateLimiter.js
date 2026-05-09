const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5,                   // tối đa 5 lần đăng ký
  message: 'Bạn đã thử đăng ký quá nhiều lần. Vui lòng thử lại sau 15 phút.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { registerLimiter };