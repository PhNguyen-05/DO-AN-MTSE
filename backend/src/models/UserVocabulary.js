const mongoose = require("mongoose");

const userVocabularySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    word: {
      type: String,
      required: true,
      trim: true,
    },
    phonetic: {
      type: String,
      trim: true,
      default: "",
    },
    audioUrl: {
      // URL file MP3 phát âm từ Free Dictionary API
      type: String,
      trim: true,
      default: "",
    },
    type: {
      // Loại từ: Verb, Noun, Adjective...
      type: String,
      trim: true,
      default: "",
    },
    meaning: {
      // Nghĩa tiếng Việt
      type: String,
      required: true,
      trim: true,
    },
    example: {
      // Ví dụ tiếng Việt
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Đang học", "Đã thuộc"],
      default: "Đang học",
    },
    lastReviewed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Mỗi user không lưu trùng cùng một từ
userVocabularySchema.index({ user: 1, word: 1 }, { unique: true });

module.exports = mongoose.model("UserVocabulary", userVocabularySchema);