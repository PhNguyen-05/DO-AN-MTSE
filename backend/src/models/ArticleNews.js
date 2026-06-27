const mongoose = require('mongoose');

const articleNewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  thumbnailUrl: { type: String },
  type: { type: String, enum: ['Bài viết', 'Tin tức'], required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED'], default: 'PENDING' },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

articleNewsSchema.index({ type: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('ArticleNews', articleNewsSchema);
