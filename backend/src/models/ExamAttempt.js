// const mongoose = require("mongoose");

// const examAttemptSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//     index: true
//   },
//   exam: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Exam",
//     required: true,
//     index: true
//   },
//   status: {
//     type: String,
//     enum: ["in_progress", "completed"],
//     default: "in_progress",
//     index: true
//   },
//   score: {
//     type: Number,
//     min: 0
//   },
//   completedAt: {
//     type: Date
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model("ExamAttempt", examAttemptSchema);



const mongoose = require("mongoose");

// Lưu kết quả từng câu hỏi sau khi nộp bài
const questionResultSchema = new mongoose.Schema(
  {
    userAnswer: {
      type: String,
      enum: ["A", "B", "C", "D", null],
      default: null,
    },
    correctAnswer: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    part: {
      type: Number,
      min: 1,
      max: 7,
    },
  },
  { _id: false }
);

const examAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 990,
    },
    correctCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      min: 0,
      default: 0,
    },
    // { questionNumber: "A" } — đáp án user đã chọn
    answers: {
      type: Map,
      of: String,
      default: {},
    },
    // [questionNumber, ...] — câu hỏi đã bookmark
    bookmarked: {
      type: [Number],
      default: [],
    },
    // Thời gian làm bài tính bằng giây
    timeSpent: {
      type: Number,
      min: 0,
      default: 0,
    },
    // { questionNumber: { userAnswer, correctAnswer, isCorrect, part } }
    // Dùng Mixed thay vì Map<Schema> để tránh lỗi khi key là số
    questionResults: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index để query nhanh lịch sử làm bài theo user + exam
examAttemptSchema.index({ user: 1, exam: 1, completedAt: -1 });

module.exports = mongoose.model("ExamAttempt", examAttemptSchema);