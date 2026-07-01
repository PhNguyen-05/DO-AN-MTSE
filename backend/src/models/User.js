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
    required: false
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  avatarUrl: {

    type: String,
    trim: true
  },
  role: {
    type: String,

    enum: ['Admin', 'Manager', 'Employee', 'User'],
    default: 'User'
  },
  status: {
    type: String,
    enum: ['Đang hoạt động', 'Chưa kích hoạt', 'Bị khóa'],
    default: 'Chưa kích hoạt'
  },
  accountType: {
    type: String,
    enum: ['Thường', 'Premium'],
    default: 'Thường'
  },
  premiumExpiresAt: {
    type: Date
  },
  googleId: {
    type: String
  },
  gender: {
    type: String,
    enum: ['Nam', 'Nữ', 'Khác']

  },
  dateOfBirth: {
    type: Date
  },
  learningGoal: {
    targetScore:  { type: Number, default: 850 },
    targetExams:  { type: Number, default: 30 },
    targetVocab:  { type: Number, default: 1000 },
    deadline:     { type: String, default: '' },
    updatedAt:    { type: Date }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);



