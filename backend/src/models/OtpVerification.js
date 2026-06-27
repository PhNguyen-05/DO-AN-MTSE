const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpCode: { type: String, required: true },
  type: { type: String, enum: ['Đăng ký', 'Quên mật khẩu', 'Xác thực thiết bị'], required: true },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);
