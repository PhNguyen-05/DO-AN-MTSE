const mongoose = require('mongoose');

const personalVocabularySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  phonetic: { type: String },
  example: { type: String },
  note: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PersonalVocabulary', personalVocabularySchema);
