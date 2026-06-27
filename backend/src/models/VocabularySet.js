const mongoose = require('mongoose');

const vocabularySetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnailUrl: { type: String },
  price: { type: Number, default: 0 },
  accessType: { type: String, enum: ['Miễn phí', 'Mua riêng lẻ', 'Premium'], default: 'Mua riêng lẻ' },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('VocabularySet', vocabularySetSchema);
