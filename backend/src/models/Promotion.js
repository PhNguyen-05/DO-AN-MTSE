const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    code: { type: String },
    discountType: { type: String },
    discountValue: { type: mongoose.Schema.Types.Mixed },
    discountAmount: { type: Number },
    discountPercent: { type: Number },
    fixedAmount: { type: Number },
    expiryDate: { type: Date },
    expirationDate: { type: Date },
    expiresAt: { type: Date },
    endDate: { type: Date },
    startDate: { type: Date },
    minimumOrderValue: { type: Number },
    maxUses: { type: Number },
    maxUsesPerUser: { type: Number },
    isActive: { type: Boolean },
    isHidden: { type: Boolean },
    status: { type: String },
    used: { type: Boolean },
    badge: { type: String },
    details: { type: [String] },
    icon: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed }
  },
  {
    timestamps: true,
    strict: false,
    collection: 'coupons'
  }
);

module.exports = mongoose.model('Promotion', promotionSchema);
