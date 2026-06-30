const mongoose = require("mongoose");

const vocabularyWordSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    trim: true
  },
  phonetic: {
    type: String,
    trim: true,
    default: ""
  },
  partOfSpeech: {
    type: String,
    trim: true,
    default: ""
  },
  meaning: {
    type: String,
    required: true,
    trim: true
  },
  example: {
    type: String,
    trim: true,
    default: ""
  },
  audioUrl: {
    type: String,
    trim: true,
    default: ""
  },
  imageUrl: {
    type: String,
    trim: true,
    default: ""
  }
}, {
  _id: true
});

const vocabularySetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  thumbnailUrl: {
    type: String,
    trim: true,
    default: ""
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  accessType: {
    type: String,
    enum: ["free", "paid", "premium"],
    default: "paid"
  },
  words: [vocabularyWordSchema],
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

module.exports = mongoose.model("VocabularySet", vocabularySetSchema);
