const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true,
    index: true
  },
  discountType: {
    type: String,
    enum: ["percent", "fixed"],
    default: "percent"
  },
  discountPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  fixedAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  minimumOrderValue: {
    type: Number,
    min: 0,
    default: 0
  },
  maxUses: {
    type: Number,
    min: 0,
    default: 0
  },
  maxUsesPerUser: {
    type: Number,
    min: 0,
    default: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  scope: {
    type: String,
    enum: ["system", "exam_2026", "premium"],
    default: "system"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  hiddenAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Coupon", couponSchema);
