const mongoose = require('mongoose');

const userLearningGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetScore: { type: Number, required: true },
  targetExamsCount: { type: Number, required: true },
  targetVocabCount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('UserLearningGoal', userLearningGoalSchema);
