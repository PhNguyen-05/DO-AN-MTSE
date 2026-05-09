const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendOTPEmail } = require('../config/mailer');
const { generateOTP } = require('../utils/otpGenerator');

class AuthService {
  async register(name, email, password) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Email đã được sử dụng');

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires
    });

    await sendOTPEmail(email, otp);
    return user;
  }

  async verifyOTP(email, otp) {
    const user = await User.findOneAndUpdate(
      { email, otp, otpExpires: { $gt: new Date() } },
      { isVerified: true, otp: null, otpExpires: null },
      { new: true }
    );

    if (!user) throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
    return user;
  }
}

module.exports = new AuthService();