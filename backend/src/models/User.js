const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: false // Optional for Google OAuth users
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Employee', 'User'],
    default: 'User'
  },
  accountType: {
    type: String,
    enum: ['Thường', 'Premium'],
    default: 'Thường'
  },
  status: {
    type: String,
    enum: ['Chưa kích hoạt', 'Đang hoạt động', 'Bị khóa'],
    default: 'Chưa kích hoạt'
  },
  premiumExpiresAt: {
    type: Date,
    default: null
  },
  accumulatedPoints: {
    type: Number,
    default: 0
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  scoreTarget: {
    type: Number,
    default: 0
  },
  // OTP for registration and password reset
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  resetPasswordOtp: {
    type: String
  },
  resetPasswordOtpExpires: {
    type: Date
  },
  resetPasswordOtpVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
