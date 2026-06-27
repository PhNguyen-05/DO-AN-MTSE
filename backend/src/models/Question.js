const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPaper', required: true },
  part: { type: Number, required: true },
  questionNumber: { type: Number, required: true },
  audioUrl: { type: String },
  imageUrl: { type: String },
  passage: { type: String },
  questionText: { type: String },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, required: true },
  optionD: { type: String, required: true },
  correctOption: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  explanation: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
