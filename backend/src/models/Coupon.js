const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscountValue: { type: Number },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  maxUses: { type: Number, required: true },
  usedCount: { type: Number, default: 0 },
  usesPerUser: { type: Number, default: 1 },
  scope: { type: String, enum: ['Toàn hệ thống', 'Chỉ áp dụng cho đề thi', 'Chỉ áp dụng cho bộ từ vựng', 'Chỉ áp dụng cho Premium'], default: 'Toàn hệ thống' },
  applicableYear: { type: Number },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
