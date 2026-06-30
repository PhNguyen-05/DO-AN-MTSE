const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'VNPay', enum: ['COD', 'VNPay', 'Ví điện tử'] },
  paymentStatus: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'PENDING' },
  discountCodeUsed: { type: String },
  vnpTxnRef: { type: String, index: true },
  paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
