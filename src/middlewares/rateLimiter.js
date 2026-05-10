// const rateLimit = require('express-rate-limit');

// const registerLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 phút
//   max: 5,                   // tối đa 5 lần đăng ký
//   message: 'Bạn đã thử đăng ký quá nhiều lần. Vui lòng thử lại sau 15 phút.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// module.exports = { registerLimiter };


const rateLimit = require('express-rate-limit');

// ================== RATE LIMITER CHO ĐĂNG KÝ ==================
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 phút
  max: 5,                     // tối đa 5 lần thử
  message: {
    success: false,
    message: 'Bạn đã thử đăng ký quá nhiều lần. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ================== RATE LIMITER CHO ĐĂNG NHẬP ==================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 phút
  max: 5,                     // tối đa 5 lần thử
  message: {
    success: false,
    message: 'Quá nhiều lần đăng nhập thất bại từ IP này. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ================== RATE LIMITER CHO OTP (tùy chọn) ==================
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 phút
  max: 3,                     // tối đa 3 lần gửi OTP
  message: {
    success: false,
    message: 'Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau 10 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  registerLimiter,
  loginLimiter,
  otpLimiter
};