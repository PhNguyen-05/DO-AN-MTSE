const mongoose = require('mongoose');

const productReviewCommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['Đề thi', 'Bài viết'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ratingStars: { type: Number },
  content: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductReviewComment', default: null },
  status: { type: String, enum: ['VISIBLE', 'HIDDEN'], default: 'VISIBLE' },
}, { timestamps: true });

module.exports = mongoose.model('ProductReviewComment', productReviewCommentSchema);
