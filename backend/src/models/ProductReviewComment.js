const mongoose = require('mongoose');

const productReviewCommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['VISIBLE', 'HIDDEN'],
    default: 'VISIBLE'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductReviewComment', productReviewCommentSchema);
