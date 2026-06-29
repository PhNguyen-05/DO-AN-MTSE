const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  exam: {
    type: mongoose.Schema.Types.Mixed,
    ref: "Exam",
    required: true,
    index: true
  },
  packageType: {
    type: String,
    enum: ["bundle", "listening", "reading", "vocabulary", "premium"],
    default: "bundle"
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled", "refunded"],
    default: "paid"
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  paidAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Purchase", purchaseSchema);
