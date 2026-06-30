const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceIdentifier: { type: String, required: true },
  token: { type: String, required: true },
  lastActiveAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('UserSession', userSessionSchema);
