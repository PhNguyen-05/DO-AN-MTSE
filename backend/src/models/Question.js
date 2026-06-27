const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
    index: true
  },
  part: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  questionNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 200
  },
  readingPassage: {
    type: String,
    trim: true,
    default: ""
  },
  imageUrl: {
    type: String,
    trim: true,
    default: ""
  },
  imagePage: {
    type: Number,
    min: 1
  },
  answers: {
    A: { type: String, trim: true, required: true },
    B: { type: String, trim: true, required: true },
    C: { type: String, trim: true, required: true },
    D: { type: String, trim: true, default: "" }
  },
  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true
  },
  explanation: {
    type: String,
    trim: true,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

questionSchema.index({ exam: 1, questionNumber: 1 }, { unique: true });

module.exports = mongoose.model("Question", questionSchema);
