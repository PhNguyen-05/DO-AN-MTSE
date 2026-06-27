const mongoose = require('mongoose');

const userPurchasedPartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPaper', required: true },
  skillType: { type: String, enum: ['Listening', 'Reading'], required: true },
  purchasedAt: { type: Date, default: Date.now },
}, { timestamps: false });

userPurchasedPartSchema.index({ userId: 1, examId: 1, skillType: 1 }, { unique: true });

module.exports = mongoose.model('UserPurchasedPart', userPurchasedPartSchema);
