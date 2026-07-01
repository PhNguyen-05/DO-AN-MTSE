const mongoose = require('mongoose');

const userFavoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPaper', required: true },
}, { timestamps: true });

userFavoriteSchema.index({ userId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('UserFavorite', userFavoriteSchema);
