const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  releaseYear: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  priceBundle: {
    type: Number,
    required: true,
    min: 0
  },
  priceListening: {
    type: Number,
    required: true,
    min: 0
  },
  priceReading: {
    type: Number,
    required: true,
    min: 0
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 1,
    max: 300,
    default: 120
  },
  pdfUrl: {
    type: String,
    trim: true
  },
  answerPdfUrl: {
    type: String,
    trim: true
  },
  audioUrls: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    enum: ["manual", "external"],
    default: "manual"
  },
  externalId: {
    type: String,
    trim: true,
    index: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  hiddenAt: {
    type: Date
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

module.exports = mongoose.model("Exam", examSchema);
