// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: { 
//     type: String, 
//     required: true, 
//     trim: true 
//   },
//   email: { 
//     type: String, 
//     required: true, 
//     unique: true, 
//     lowercase: true, 
//     trim: true 
//   },
//   password: { 
//     type: String, 
//     required: true 
//   },
//   isVerified: { 
//     type: Boolean, 
//     default: false 
//   },
//   otp: String,
//   otpExpires: Date,
//   role: { 
//     type: String, 
//     enum: ['user', 'admin'], 
//     default: 'user' 
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Thông tin cơ bản
  name: { 
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
  password: { 
    type: String, 
    required: true 
  },

  // Phân quyền
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },

  // Xác thực OTP
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  otp: { 
    type: String 
  },
  otpExpires: { 
    type: Date 
  },

  // Thông tin bổ sung (có thể mở rộng sau)
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'] 
  },
  dateOfBirth: { 
    type: Date 
  },

}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);