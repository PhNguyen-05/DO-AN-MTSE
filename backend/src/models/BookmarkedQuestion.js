const mongoose = require('mongoose');

const bookmarkedQuestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resultId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamResult', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
}, { timestamps: true });

module.exports = mongoose.model('BookmarkedQuestion', bookmarkedQuestionSchema);
