const mongoose = require('mongoose');

const userVocabularySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vocabularyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vocabulary', required: true },
  learningStatus: { type: String, enum: ['Chưa thuộc', 'Đang học', 'Đã thuộc'], default: 'Đang học' },
  reviewCount: { type: Number, default: 0 },
  memorizationLevel: { type: Number, default: 1 },
  lastReviewedAt: { type: Date },
}, { timestamps: true });

userVocabularySchema.index({ userId: 1, vocabularyId: 1 }, { unique: true });

module.exports = mongoose.model('UserVocabulary', userVocabularySchema);
