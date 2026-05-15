const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");

const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeOtp = (otp) => String(otp).trim();

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return "Mat khau phai co it nhat 6 ky tu";
  }

  return null;
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Vui long nhap email");
    }

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      res.status(404);
      throw new Error("Email khong ton tai");
    }

    const otp = generateOtp();
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordOtp: otp,
          resetPasswordOtpExpires: new Date(Date.now() + 5 * 60 * 1000),
          resetPasswordOtpVerified: false
        }
      }
    );

    await sendEmail({
      to: user.email,
      subject: "Ma OTP dat lai mat khau",
      text: `Ma OTP cua ban la: ${otp}. Ma co hieu luc trong 5 phut.`
    });

    res.json({ message: "OTP da duoc gui den email" });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      throw new Error("Vui long nhap email va OTP");
    }

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user || user.resetPasswordOtp !== normalizeOtp(otp)) {
      res.status(400);
      throw new Error("OTP khong dung");
    }

    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
      res.status(400);
      throw new Error("OTP da het han");
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { resetPasswordOtpVerified: true } }
    );

    res.json({ message: "Xac thuc OTP thanh cong" });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400);
      throw new Error("Vui long nhap day du thong tin");
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      res.status(400);
      throw new Error(passwordError);
    }

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user || user.resetPasswordOtp !== normalizeOtp(otp) || !user.resetPasswordOtpVerified) {
      res.status(400);
      throw new Error("OTP khong hop le");
    }

    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
      res.status(400);
      throw new Error("OTP da het han");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetPasswordOtpVerified: false
        },
        $unset: {
          resetPasswordOtp: "",
          resetPasswordOtpExpires: ""
        }
      }
    );

    res.json({ message: "Dat lai mat khau thanh cong" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  forgotPassword,
  verifyOtp,
  resetPassword
};
