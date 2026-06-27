const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  vocabSetId: { type: mongoose.Schema.Types.ObjectId, ref: 'VocabularySet', required: true },
  word: { type: String, required: true },
  phonetic: { type: String },
  wordType: { type: String },
  meaning: { type: String, required: true },
  example: { type: String },
  exampleTranslation: { type: String },
  audioUrl: { type: String },
  imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Vocabulary', vocabularySchema);
