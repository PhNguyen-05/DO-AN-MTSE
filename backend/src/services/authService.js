const User = require("../models/User");
const UserSession = require("../models/UserSession");
const OtpVerification = require("../models/OtpVerification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { sendOTPEmail } = require("../config/mailer");
const { generateOTP } = require("../utils/otpGenerator");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getAccessTokenSecret = () => (
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  "your_jwt_secret"
);

class AuthService {
  async register(name, email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Validate strong password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
    }

    let existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.status !== 'Chưa kích hoạt') {
      throw new Error("Email này đã được sử dụng.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (existingUser) {
      existingUser.passwordHash = hashedPassword;
      existingUser.fullName = name;
      await existingUser.save();
    } else {
      existingUser = await User.create({
        fullName: name,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        status: 'Chưa kích hoạt',
        role: "User"
      });
    }

    await OtpVerification.deleteMany({ email: normalizedEmail, type: 'Đăng ký' });
    await OtpVerification.create({
      email: normalizedEmail,
      otpCode: otp,
      type: 'Đăng ký',
      expiresAt: expiresAt
    });

    await sendOTPEmail(normalizedEmail, otp);
    return existingUser;
  }

  async verifyOTP(email, otp) {
    const normalizedEmail = email.trim().toLowerCase();
    const otpRecord = await OtpVerification.findOne({
      email: normalizedEmail,
      otpCode: String(otp).trim(),
      type: 'Đăng ký',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { status: 'Đang hoạt động' },
      { new: true }
    );

    return user;
  }

  async createSession(userId, deviceIdentifier) {
    const token = jwt.sign(
      { id: userId },
      getAccessTokenSecret(),
      { expiresIn: "7d" }
    );

    // Remove old session for this user to ensure only 1 device at a time
    await UserSession.deleteMany({ userId });

    await UserSession.create({
      userId,
      deviceIdentifier: deviceIdentifier || "Unknown Device",
      token,
      lastActiveAt: new Date()
    });

    return token;
  }

  async loginService(email, password, deviceIdentifier) {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || user.status === 'Chưa kích hoạt' || !user.passwordHash) {
      throw new Error("Tài khoản không tồn tại hoặc chưa kích hoạt.");
    }

    if (user.status === 'Bị khóa') {
      throw new Error("Tài khoản của bạn đã bị khóa.");
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new Error("Email hoặc mật khẩu không chính xác.");
    }

    const token = await this.createSession(user._id, deviceIdentifier);

    return {
      accessToken: token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role
      }
    };
  }

  async loginWithGoogle(idToken, deviceIdentifier) {
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
      throw new Error("Tính năng đăng nhập Google chưa được cấu hình. Vui lòng thêm GOOGLE_CLIENT_ID vào .env");
    }
    
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    const name = payload.name;
    const googleId = payload.sub;
    const avatarUrl = payload.picture;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name,
        email: email,
        googleId: googleId,
        avatarUrl: avatarUrl,
        status: 'Đang hoạt động',
        role: 'User'
      });
    } else {
      if (user.status === 'Bị khóa') {
        throw new Error("Tài khoản của bạn đã bị khóa.");
      }
      if (!user.googleId) {
        user.googleId = googleId;
        user.status = 'Đang hoạt động';
        await user.save();
      }
    }

    const token = await this.createSession(user._id, deviceIdentifier);

    return {
      accessToken: token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role
      }
    };
  }

  async forgotPassword(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, status: 'Đang hoạt động' });
    if (!user) {
      throw new Error("Không tìm thấy tài khoản hoạt động với email này.");
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OtpVerification.deleteMany({ email: normalizedEmail, type: 'Quên mật khẩu' });
    await OtpVerification.create({
      email: normalizedEmail,
      otpCode: otp,
      type: 'Quên mật khẩu',
      expiresAt: expiresAt
    });

    await sendOTPEmail(normalizedEmail, otp);
    return true;
  }

  async verifyResetOTP(email, otp) {
    const normalizedEmail = email.trim().toLowerCase();
    const otpRecord = await OtpVerification.findOne({
      email: normalizedEmail,
      otpCode: String(otp).trim(),
      type: 'Quên mật khẩu',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }
    
    // We don't mark it as used yet, we return success so frontend can show reset password form
    return true;
  }

  async resetPassword(email, otp, newPassword) {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Validate strong password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new Error("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
    }

    const otpRecord = await OtpVerification.findOne({
      email: normalizedEmail,
      otpCode: String(otp).trim(),
      type: 'Quên mật khẩu',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email: normalizedEmail },
      { passwordHash: hashedPassword }
    );
    
    // Clear sessions so user must login again
    const user = await User.findOne({ email: normalizedEmail });
    if(user) {
      await UserSession.deleteMany({ userId: user._id });
    }

    return true;
  }

  async resendOTP(email, type = 'Đăng ký') {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error("Không tìm thấy tài khoản với email này.");
    }
    
    if (type === 'Quên mật khẩu' && user.status !== 'Đang hoạt động') {
      throw new Error("Tài khoản chưa được kích hoạt hoặc đã bị khóa.");
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OtpVerification.deleteMany({ email: normalizedEmail, type });
    await OtpVerification.create({
      email: normalizedEmail,
      otpCode: otp,
      type,
      expiresAt: expiresAt
    });

    await sendOTPEmail(normalizedEmail, otp);
    return true;
  }
}

module.exports = new AuthService();
