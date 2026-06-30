const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  targetType: {
    type: String,
    enum: ["blog_post", "exam", "vocabulary_set"],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null
  },
  status: {
    type: String,
    enum: ["VISIBLE", "HIDDEN"],
    default: "VISIBLE"
  },
  hiddenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  hiddenAt: {
    type: Date
  },
  isAdminReply: {
    type: Boolean,
    default: false
  },
  likeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

commentSchema.index({ status: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ targetType: 1, targetId: 1 });
commentSchema.index({ replyTo: 1 });
commentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
