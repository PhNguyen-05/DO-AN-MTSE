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
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      trim: true,
      default: "",
    },
    meaning: {
      type: String,
      required: true,
      trim: true,
    },
    example: {
      type: String,
      trim: true,
      default: "",
    },
    // FIX: Lưu bộ từ cá nhân người dùng chọn
    // Lưu dạng string (ID của bộ từ cá nhân lưu ở localStorage)
    // vì bộ từ cá nhân hiện chưa có model riêng ở backend
    collectionId: {
      type: String,
      trim: true,
      default: null,
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