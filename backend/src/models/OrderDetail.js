const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productType: { type: String, enum: ['Đề thi', 'Bộ từ vựng', 'Gói Premium', 'Phần Nghe', 'Phần Đọc'], required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  price: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('OrderDetail', orderDetailSchema);
