const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ["blog", "news", "announcement"],
    default: "blog"
  },
  status: {
    type: String,
    enum: ["DRAFT", "PENDING", "APPROVED", "HIDDEN"],
    default: "DRAFT"
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approvedAt: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isHidden: {
    type: Boolean,
    default: false
  },
  hiddenAt: {
    type: Date
  }
}, {
  timestamps: true
});


blogPostSchema.index({ status: 1 });
blogPostSchema.index({ author: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model("BlogPost", blogPostSchema);
