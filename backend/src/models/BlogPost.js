const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, trim: true, unique: true, sparse: true },
  excerpt: { type: String, trim: true },
  content: { type: mongoose.Schema.Types.Mixed },
  category: { type: String, trim: true },
  type: { type: String, trim: true },
  status: { type: String, trim: true },
  author: { type: mongoose.Schema.Types.Mixed },
  viewCount: { type: Number, default: 0 },
  tags: [{ type: String, trim: true }],
  image: { type: String, trim: true },
  publishedAt: { type: Date },
  approvedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
