const mongoose = require('mongoose');

const premiumSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    price: { type: mongoose.Schema.Types.Mixed },
    currency: { type: String },
    durationMonths: { type: Number },
    features: { type: [String] },
    buttonText: { type: String },
    isActive: { type: Boolean }
  },
  {
    timestamps: true,
    strict: false,
    collection: 'premium'
  }
);

module.exports = mongoose.model('Premium', premiumSchema);
