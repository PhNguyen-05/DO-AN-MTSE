const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  fullName: {
    type: String,
    required: false,
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
    default: 'User',
    set: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v
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

// Pre-validate hook: normalize role capitalization BEFORE validation runs
// This fixes legacy documents with lowercase roles (e.g. 'user' -> 'User')
userSchema.pre('validate', async function () {
  if (this.role) {
    this.role = this.role.charAt(0).toUpperCase() + this.role.slice(1).toLowerCase();
  }
});

module.exports = mongoose.model('User', userSchema);



