const mongoose = require('mongoose');

const examPaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  difficultyLevel: { type: String, enum: ['Dễ', 'Trung bình', 'Khó'], default: 'Trung bình' },
  priceFull: { type: Number, default: 0 },
  priceListening: { type: Number, default: 0 },
  priceReading: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
}, { timestamps: true });

examPaperSchema.index({ isVisible: 1, purchaseCount: -1, viewCount: -1 });
examPaperSchema.index({ year: 1, difficultyLevel: 1, isVisible: 1 });

module.exports = mongoose.model('ExamPaper', examPaperSchema);
