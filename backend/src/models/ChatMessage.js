const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  senderType: { type: String, enum: ['Guest', 'User', 'Employee', 'Admin'], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  messageText: { type: String, required: true },
}, { timestamps: true });

chatMessageSchema.index({ roomId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
