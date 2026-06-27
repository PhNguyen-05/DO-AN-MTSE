const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  sessionGuestId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['QUEUE', 'ACTIVE', 'CLOSED'], default: 'QUEUE' },
}, { timestamps: true });

chatRoomSchema.index({ status: 1, assignedTo: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
