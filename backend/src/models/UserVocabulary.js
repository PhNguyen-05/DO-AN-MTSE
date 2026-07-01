const mongoose = require('mongoose');

const userVocabularySchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  word:         { type: String, required: true, trim: true },
  phonetic:     { type: String, default: '' },
  audioUrl:     { type: String, default: '' },
  type:         { type: String, default: '' },
  meaning:      { type: String, default: '' },
  example:      { type: String, default: '' },
  collectionId: { type: String, default: null },
  status:       { type: String, enum: ['Đang học', 'Đã thuộc'], default: 'Đang học' },
  lastReviewed: { type: Date, default: Date.now },
}, { timestamps: true });

// Mỗi user chỉ có 1 bản ghi cho mỗi từ
userVocabularySchema.index({ user: 1, word: 1 }, { unique: true });

module.exports = mongoose.model('UserVocabulary', userVocabularySchema);
