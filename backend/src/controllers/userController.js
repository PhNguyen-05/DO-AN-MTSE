const Exam = require("../models/Exam");
const ExamAttempt = require("../models/ExamAttempt");
const Purchase = require("../models/Purchase");
const Question = require("../models/Question");
const UserVocabulary = require("../models/UserVocabulary");
const VocabularySet = require("../models/VocabularySet");

// ============================================================
// Helper: Kiểm tra user có quyền truy cập đề thi không
// - Free exam: ai cũng truy cập được
// - Paid/Premium exam: cần có Purchase record với status "paid"
// ============================================================
const checkExamAccess = async (userId, examId) => {
  const exam = await Exam.findById(examId).lean();
  if (!exam || exam.isHidden) return { allowed: false, exam: null };

  // Miễn phí → cho qua
  if (
    exam.priceBundle === 0 &&
    exam.priceListening === 0 &&
    exam.priceReading === 0
  ) {
    return { allowed: true, exam };
  }

  // Có phí → kiểm tra Purchase
  const purchase = await Purchase.findOne({
    user: userId,
    exam: examId,
    status: "paid",
  }).lean();

  return { allowed: Boolean(purchase), exam };
};

// ============================================================
// Helper: Tính điểm TOEIC ước lượng từ số câu đúng
// Thang điểm: 10 - 990, tăng theo bội số 5
// Listening (100 câu) → 5-495, Reading (100 câu) → 5-495
// Full test (200 câu) → 10-990
// ============================================================
const calculateToeicScore = (correctCount, totalQuestions) => {
  if (!totalQuestions) return 0;
  const ratio = correctCount / totalQuestions;
  const raw = Math.round((ratio * 980) / 5) * 5 + 10;
  return Math.min(990, Math.max(10, raw));
};

// ============================================================
// Helper: Tổng hợp stats từ danh sách attempts
// ============================================================
const buildAttemptSummaryMap = (attempts) => {
  const map = {};

  for (const attempt of attempts) {
    const examId = String(attempt.exam);
    if (!map[examId]) {
      map[examId] = {
        count: 0,
        bestScore: 0,
        lastAttempt: null,
        lastScore: 0,
        lastAttemptId: null,
      };
    }

    const entry = map[examId];
    entry.count += 1;

    if (!entry.lastAttempt || attempt.completedAt > entry.lastAttempt) {
      entry.lastAttempt = attempt.completedAt;
      entry.lastScore = attempt.score || 0;
      entry.lastAttemptId = String(attempt._id);
    }

    if ((attempt.score || 0) > entry.bestScore) {
      entry.bestScore = attempt.score || 0;
    }
  }

  return map;
};

// ============================================================
// GET /user/exams
// Trả danh sách đề thi + trạng thái access + lịch sử làm bài
// của user hiện tại (dùng cho ExamList.jsx)
// ============================================================
const getPublicExams = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Lấy tất cả đề không ẩn
    const exams = await Exam.find({ isHidden: false })
      .sort({ releaseYear: -1, createdAt: -1 })
      .lean();

    // Lấy tất cả purchase của user
    const purchases = await Purchase.find({
      user: userId,
      status: "paid",
    })
      .select("exam")
      .lean();

    const purchasedExamIds = new Set(purchases.map((p) => String(p.exam)));

    // Lấy toàn bộ completed attempts của user
    const attempts = await ExamAttempt.find({
      user: userId,
      status: "completed",
    })
      .select("exam score completedAt")
      .sort({ completedAt: 1 })
      .lean();

    const attemptSummary = buildAttemptSummaryMap(attempts);

    // Ghép dữ liệu
    const result = exams.map((exam) => {
      const isFree =
        exam.priceBundle === 0 &&
        exam.priceListening === 0 &&
        exam.priceReading === 0;

      const hasPurchased = purchasedExamIds.has(String(exam._id));
      const accessType = isFree ? "free" : "premium";
      const canAccess = isFree || hasPurchased;

      return {
        _id: exam._id,
        name: exam.name,
        releaseYear: exam.releaseYear,
        difficulty: exam.difficulty,
        durationMinutes: exam.durationMinutes,
        skill: "Listening & Reading",
        accessType,
        canAccess,
        tags: [
          String(exam.releaseYear),
          accessType === "free" ? "Miễn phí" : "Premium",
        ],
        questionCount: 200,
        listeningCount: 100,
        readingCount: 100,
        hasPdf: Boolean(exam.pdfUrl),
        hasAudio: (exam.audioUrls || []).length > 0,
        attemptInfo: attemptSummary[String(exam._id)] || null,
      };
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /user/exams/:examId
// Trả thông tin chi tiết 1 đề thi (dùng cho TakeExam.jsx)
// ============================================================
const getExamById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { examId } = req.params;

    const { allowed, exam } = await checkExamAccess(userId, examId);

    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi." });
    }

    if (!allowed) {
      return res
        .status(403)
        .json({ message: "Bạn chưa mua đề thi này." });
    }

    return res.json({
      _id: exam._id,
      name: exam.name,
      releaseYear: exam.releaseYear,
      difficulty: exam.difficulty,
      durationMinutes: exam.durationMinutes,
      skill: "Listening & Reading",
      audioUrls: exam.audioUrls || [],
      hasPdf: Boolean(exam.pdfUrl),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /user/exams/:examId/questions
// Trả danh sách câu hỏi (KHÔNG có correctAnswer, explanation)
// để user làm bài — tránh lộ đáp án (dùng cho TakeExam.jsx)
// ============================================================
const getExamQuestions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { examId } = req.params;

    const { allowed, exam } = await checkExamAccess(userId, examId);

    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi." });
    }

    if (!allowed) {
      return res
        .status(403)
        .json({ message: "Bạn chưa mua đề thi này." });
    }

    const questions = await Question.find({ exam: examId })
      .sort({ questionNumber: 1 })
      // Ẩn đáp án + giải thích khi đang làm bài
      .select("-correctAnswer -explanation")
      .lean();

    return res.json(questions);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /user/exams/:examId/attempts
// Nộp bài, tính điểm, lưu ExamAttempt
// Body: { answers: { questionNumber: "A"|"B"|"C"|"D" }, bookmarked: [], timeSpent: number }
// (dùng cho TakeExam.jsx khi user bấm nộp bài)
// ============================================================
const submitAttempt = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { examId } = req.params;
    const { answers = {}, bookmarked = [], timeSpent = 0 } = req.body;

    const { allowed, exam } = await checkExamAccess(userId, examId);

    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi." });
    }

    if (!allowed) {
      return res
        .status(403)
        .json({ message: "Bạn chưa mua đề thi này." });
    }

    // Lấy toàn bộ câu hỏi (có đáp án) để tính điểm
    const questions = await Question.find({ exam: examId })
      .select("questionNumber correctAnswer part")
      .lean();

    // Tính số câu đúng
    let correctCount = 0;
    const questionResults = {};

    for (const question of questions) {
      const userAnswer = answers[question.questionNumber];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correctCount += 1;

      questionResults[question.questionNumber] = {
        userAnswer: userAnswer || null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        part: question.part,
      };
    }

    const score = calculateToeicScore(correctCount, questions.length);

    // Lưu attempt
    const attempt = await ExamAttempt.create({
      user: userId,
      exam: examId,
      status: "completed",
      score,
      answers,
      bookmarked,
      timeSpent,
      correctCount,
      totalQuestions: questions.length,
      questionResults,
      completedAt: new Date(),
    });

    return res.status(201).json({
      _id: attempt._id,
      score,
      correctCount,
      totalQuestions: questions.length,
      completedAt: attempt.completedAt,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /user/attempts/:attemptId
// Trả kết quả chi tiết 1 lần làm bài (dùng cho ExamResult.jsx)
// Lúc này mới trả correctAnswer + explanation vì đã nộp bài
// ============================================================
const getAttemptResult = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      user: userId,
    }).lean();

    if (!attempt) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy kết quả bài làm." });
    }

    const exam = await Exam.findById(attempt.exam)
      .select("name releaseYear durationMinutes")
      .lean();

    // Lấy câu hỏi đầy đủ — lần này CÓ correctAnswer và explanation
    const questions = await Question.find({ exam: attempt.exam })
      .sort({ questionNumber: 1 })
      .lean();

    // Tính accuracy theo từng Part
    const byPart = {};
    for (const question of questions) {
      const part = question.part;
      if (!byPart[part]) byPart[part] = { total: 0, correct: 0 };
      byPart[part].total += 1;
      if (attempt.answers?.[question.questionNumber] === question.correctAnswer) {
        byPart[part].correct += 1;
      }
    }

    return res.json({
      attemptId: attempt._id,
      exam,
      attempt: {
        answers: attempt.answers || {},
        bookmarked: attempt.bookmarked || [],
        timeSpent: attempt.timeSpent || 0,
        submittedAt: attempt.completedAt,
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
      },
      questions,
      stats: {
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        accuracy: attempt.totalQuestions
          ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100)
          : 0,
        byPart,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /user/exams/:examId/attempts
// Lịch sử làm bài của 1 đề (dùng cho ExamHistory.jsx)
// ============================================================
const getAttemptHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { examId } = req.params;

    const exam = await Exam.findById(examId).select("name releaseYear isHidden").lean();
    if (!exam || exam.isHidden) {
      return res.status(404).json({ message: "Không tìm thấy đề thi." });
    }

    const attempts = await ExamAttempt.find({
      user: userId,
      exam: examId,
      status: "completed",
    })
      .select("score correctCount totalQuestions timeSpent completedAt")
      .sort({ completedAt: -1 })
      .lean();

    return res.json(attempts);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /user/vocabulary-sets
// Trả danh sách bộ từ vựng mà user có quyền truy cập
// - Free sets: tất cả đều thấy
// - Paid sets: cần Purchase
// (dùng cho VocabularyHub.jsx — thay mockVocabularyCollections)
// ============================================================
// const getAccessibleVocabSets = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
 
//     const allSets = await VocabularySet.find({ isHidden: false })
//       .select("_id name description accessType price thumbnailUrl words")
//       .lean();
 
//     // Lấy các set đã mua
//     const purchases = await Purchase.find({
//       user: userId,
//       status: "paid",
//       vocabularySet: { $exists: true, $ne: null },
//     })
//       .select("vocabularySet")
//       .lean();
 
//     const purchasedSetIds = new Set(
//       purchases.map((p) => String(p.vocabularySet))
//     );
 
//     // Đếm số từ đã học của user
//     const userVocabCount = await UserVocabulary.aggregate([
//       { $match: { user: userId } },
//       { $group: { _id: null, total: { $sum: 1 } } },
//     ]);
 
//     const totalLearned = userVocabCount[0]?.total || 0;
 
//     const result = allSets.map((set) => {
//       const isFree = set.accessType === "free";
//       const hasPurchased = purchasedSetIds.has(String(set._id));
//       const canAccess = isFree || hasPurchased;
 
//       // Chuẩn hóa words để frontend dùng được trực tiếp
//       // (VocabularySet dùng field "term", UserVocabulary dùng "word")
//       const normalizedWords = canAccess
//         ? (set.words || []).map((w) => ({
//             id: String(w._id),
//             word: w.term || "",
//             phonetic: w.phonetic || "",
//             audioUrl: w.audioUrl || "",
//             type: w.partOfSpeech || "",
//             meaning: w.meaning || "",
//             example: w.example || "",
//             status: "Đang học",
//             lastReviewed: new Date().toISOString(),
//             collectionId: String(set._id),
//           }))
//         : [];
 
//       return {
//         id: String(set._id),
//         title: set.name,
//         description: set.description,
//         accessType: set.accessType,
//         owned: canAccess,
//         premium: set.accessType === "premium",
//         total: set.words?.length || 0,
//         learned: canAccess ? Math.min(totalLearned, set.words?.length || 0) : 0,
//         thumbnailUrl: set.thumbnailUrl || null,
//         words: normalizedWords, // ← THÊM: trả kèm danh sách từ
//       };
//     });
 
//     return res.json(result);
//   } catch (error) {
//     next(error);
//   }
// };


const getAccessibleVocabSets = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const allSets = await VocabularySet.find({ isHidden: false })
      .select("_id name description accessType price thumbnailUrl words") // ✅ giữ words
      .lean();

    const purchases = await Purchase.find({
      user: userId,
      status: "paid",
      vocabularySet: { $exists: true, $ne: null },
    })
      .select("vocabularySet")
      .lean();

    const purchasedSetIds = new Set(
      purchases.map((p) => String(p.vocabularySet))
    );

    const result = allSets.map((set) => {
      const isFree = set.accessType === "free";
      const hasPurchased = purchasedSetIds.has(String(set._id));
      const canAccess = isFree || hasPurchased;

      return {
        id: String(set._id),
        title: set.name,
        description: set.description,
        accessType: set.accessType,
        owned: canAccess,
        premium: set.accessType === "premium",
        total: set.words?.length || 0,
        thumbnailUrl: set.thumbnailUrl || null,
        // ✅ Chỉ trả words nếu user có quyền
        words: canAccess
          ? (set.words || []).map((w) => ({
              id: String(w._id),
              word: w.term,
              phonetic: w.phonetic || "",
              audioUrl: w.audioUrl || "",
              type: w.partOfSpeech || "",
              meaning: w.meaning,
              example: w.example || "",
              status: "Đang học",
              lastReviewed: new Date().toISOString(),
              collectionId: String(set._id),
            }))
          : [],
      };
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /user/analytics
// Tổng hợp thống kê học tập của user
// (dùng cho UserAnalytics.jsx — thay mockAnalytics)
// ============================================================
const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Lấy toàn bộ attempts đã hoàn thành
    const attempts = await ExamAttempt.find({
      user: userId,
      status: "completed",
    })
      .sort({ completedAt: 1 })
      .lean();

    // Lấy số từ vựng đã học
    const [vocabStats, notebookTotal] = await Promise.all([
      UserVocabulary.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      UserVocabulary.countDocuments({ user: userId }),
    ]);

    const masteredVocab =
      vocabStats.find((s) => s._id === "Đã thuộc")?.count || 0;

    // Tính điểm trung bình và điểm cao nhất
    const scores = attempts
      .filter((a) => a.score)
      .map((a) => a.score);

    const averageScore = scores.length
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 0;

    const currentBestScore = scores.length ? Math.max(...scores) : 0;

    // 6 lần làm gần nhất cho biểu đồ tăng trưởng
    const recentAttempts = [...attempts].slice(-6);
    const recentScores = recentAttempts.map((a) => ({
      date: new Date(a.completedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      score: a.score || 0,
      attemptId: String(a._id),
    }));

    // Tính accuracy theo Part (tổng hợp từ tất cả attempts)
    const partStats = {};
    for (const attempt of attempts) {
      if (!attempt.questionResults) continue;
      for (const [, result] of Object.entries(attempt.questionResults)) {
        const part = result.part;
        if (!part) continue;
        if (!partStats[part]) partStats[part] = { total: 0, correct: 0 };
        partStats[part].total += 1;
        if (result.isCorrect) partStats[part].correct += 1;
      }
    }

    const accuracyByPart = {};
    for (const [part, stats] of Object.entries(partStats)) {
      accuracyByPart[part] = stats.total
        ? Math.round((stats.correct / stats.total) * 100)
        : 0;
    }

    // Số giờ học trong tuần (dựa vào timeSpent của attempt)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    const weeklyMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const attempt of attempts) {
      if (!attempt.completedAt || attempt.completedAt < weekAgo) continue;
      const day = new Date(attempt.completedAt).getDay();
      weeklyMap[day] = +(
        weeklyMap[day] + (attempt.timeSpent || 0) / 3600
      ).toFixed(1);
    }

    const weeklyStudy = Object.entries(weeklyMap).map(([day, hours]) => ({
      day: dayLabels[Number(day)],
      hours,
    }));

    // Tính streak (số ngày học liên tiếp)
    const attemptDates = [
      ...new Set(
        attempts.map((a) =>
          new Date(a.completedAt).toISOString().slice(0, 10)
        )
      ),
    ].sort();

    let streakDays = 0;
    if (attemptDates.length) {
      const today = new Date().toISOString().slice(0, 10);
      let current = new Date(today);
      for (let i = 0; i < 365; i++) {
        const dateStr = current.toISOString().slice(0, 10);
        if (attemptDates.includes(dateStr)) {
          streakDays += 1;
          current.setDate(current.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Tổng giờ học
    const totalStudyHours = +(
      attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 3600
    ).toFixed(1);

    // Lấy learning goal nếu có lưu (có thể null nếu chưa set)
    // Hiện tại backend chưa có model LearningGoal → dùng default
    const learningGoal = {
      targetScore: 850,
      currentBestScore,
      targetExams: 30,
      targetVocab: 1000,
      deadline: new Date(
        new Date().getFullYear() + 1,
        11,
        31
      ).toISOString().slice(0, 10),
    };

    return res.json({
      overview: {
        totalExamsCompleted: attempts.length,
        averageScore,
        totalStudyHours,
        vocabLearned: masteredVocab,
        notebookTotal,
        streakDays,
      },
      learningGoal,
      accuracyByPart,
      recentScores,
      weeklyStudy,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /user/attempts/summary
// Map examId → { count, bestScore, lastAttempt, lastScore, lastAttemptId }
// Dùng để hiển thị thống kê nhanh trong ExamList.jsx
// ============================================================
const getAttemptsSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const attempts = await ExamAttempt.find({
      user: userId,
      status: "completed",
    })
      .select("exam score completedAt")
      .sort({ completedAt: 1 })
      .lean();

    const summary = buildAttemptSummaryMap(attempts);

    return res.json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicExams,
  getExamById,
  getExamQuestions,
  submitAttempt,
  getAttemptResult,
  getAttemptHistory,
  getAccessibleVocabSets,
  getUserAnalytics,
  getAttemptsSummary,
};