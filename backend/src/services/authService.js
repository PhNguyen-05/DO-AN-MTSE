const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../config/mailer");
const { generateOTP } = require("../utils/otpGenerator");

const getAccessTokenSecret = () => (
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  "your_jwt_secret"
);

class AuthService {
  async register(name, email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw new Error("Email is already in use.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
      role: "user"
    });

    await sendOTPEmail(normalizedEmail, otp);
    return user;
  }

  async verifyOTP(email, otp) {
    const user = await User.findOneAndUpdate(
      {
        email: email.trim().toLowerCase(),
        otp: String(otp).trim(),
        otpExpires: { $gt: new Date() }
      },
      { isVerified: true, otp: null, otpExpires: null },
      { new: true }
    );

    if (!user) {
      throw new Error("OTP is invalid or expired.");
    }

    return user;
  }

  async loginService(email, password) {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      throw new Error("Email or password is incorrect.");
    }

    if (!user.isVerified) {
      throw new Error("Account is not verified by OTP.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Email or password is incorrect.");
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      getAccessTokenSecret(),
      { expiresIn: "7d" }
    );

    return {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
}

module.exports = new AuthService();
