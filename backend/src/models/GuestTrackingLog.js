const mongoose = require('mongoose');

const guestTrackingLogSchema = new mongoose.Schema({
  sessionGuestId: { type: String, required: true },
  actionType: { type: String, enum: ['Xem đề thi', 'Xem bài viết', 'Tìm kiếm'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: true });

module.exports = mongoose.model('GuestTrackingLog', guestTrackingLogSchema);
