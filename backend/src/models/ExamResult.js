const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPaper', required: true },
  totalScore: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  durationSeconds: { type: Number, required: true },
  selectedAnswers: { type: mongoose.Schema.Types.Mixed, required: true },
  accuracyByParts: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ExamResult', examResultSchema);
