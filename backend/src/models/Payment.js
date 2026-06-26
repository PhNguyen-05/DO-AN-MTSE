const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Purchase"
  },
  orderId: {
    type: String,
    index: true
  },
  voucherCode: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ["income", "refund"],
    default: "income"
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "success"
  },
  items: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  paidAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Payment", paymentSchema);
