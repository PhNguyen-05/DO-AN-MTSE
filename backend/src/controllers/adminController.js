const Exam = require("../models/Exam");
const ExamAttempt = require("../models/ExamAttempt");
const Payment = require("../models/Payment");
const Purchase = require("../models/Purchase");
const Question = require("../models/Question");
const User = require("../models/User");
const {
  getPdfPathFromUrl,
  importQuestionsFromPdf
} = require("../services/questionImportService");

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const mapExamPayload = (body, userId, existing = {}) => ({
  name: body.name ?? existing.name,
  releaseYear: toNumber(body.releaseYear ?? body.year ?? existing.releaseYear),
  difficulty: body.difficulty ?? existing.difficulty ?? "medium",
  priceBundle: toNumber(body.priceBundle ?? body.bundlePrice ?? existing.priceBundle),
  priceListening: toNumber(body.priceListening ?? body.listeningPrice ?? existing.priceListening),
  priceReading: toNumber(body.priceReading ?? body.readingPrice ?? existing.priceReading),
  updatedBy: userId
});

const fileUrl = (req, file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

const answerKeys = ["A", "B", "C", "D"];

const mapQuestionPayload = (body, userId, existing = {}) => {
  const answers = answerKeys.reduce((result, key) => {
    result[key] = body.answers?.[key] ?? body[`answer${key}`] ?? existing.answers?.[key] ?? "";
    return result;
  }, {});

  return {
    part: toNumber(body.part ?? existing.part),
    questionNumber: toNumber(body.questionNumber ?? existing.questionNumber),
    readingPassage: body.readingPassage ?? existing.readingPassage ?? "",
    answers,
    correctAnswer: body.correctAnswer ?? existing.correctAnswer,
    explanation: body.explanation ?? existing.explanation ?? "",
    updatedBy: userId
  };
};

const validateQuestionPayload = (payload) => {
  if (!Number.isInteger(payload.part) || payload.part < 1 || payload.part > 7) {
    return "Part must be between 1 and 7.";
  }

  if (!Number.isInteger(payload.questionNumber) || payload.questionNumber < 1 || payload.questionNumber > 200) {
    return "Question number must be between 1 and 200.";
  }

  if (!answerKeys.every((key) => payload.answers[key]?.trim())) {
    return "Please enter all answers A, B, C and D.";
  }

  if (!answerKeys.includes(payload.correctAnswer)) {
    return "Correct answer must be A, B, C or D.";
  }

  return null;
};

const attachUploadedFiles = (req, payload) => {
  if (req.files?.pdf?.[0]) {
    payload.pdfUrl = fileUrl(req, req.files.pdf[0]);
  }

  if (req.files?.audios?.length) {
    payload.audioUrls = req.files.audios.map((file) => fileUrl(req, file));
  } else if (req.body.removeAudios === "true") {
    payload.audioUrls = [];
  }

  return payload;
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalExams,
      totalAttempts,
      completedAttempts,
      revenueAgg,
      monthlyRevenue
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Exam.countDocuments({ isHidden: false }),
      ExamAttempt.countDocuments(),
      ExamAttempt.countDocuments({ status: "completed" }),
      Payment.aggregate([
        { $match: { status: "success", type: "income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Payment.aggregate([
        { $match: { status: "success", type: "income" } },
        {
          $group: {
            _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
            total: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ])
    ]);

    const completionRate = totalAttempts
      ? Math.round((completedAttempts / totalAttempts) * 100)
      : 0;

    const response = {
      totalUsers,
      totalExams,
      completionRate,
      completedAttempts,
      totalAttempts
    };

    if (req.userRole === "admin") {
      response.revenue = revenueAgg[0]?.total || 0;
      response.monthlyRevenue = monthlyRevenue.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        total: item.total
      }));
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const listExams = async (req, res, next) => {
  try {
    const includeHidden = req.query.includeHidden === "true";
    const filter = includeHidden ? {} : { isHidden: false };
    const exams = await Exam.find(filter).sort({ releaseYear: -1, createdAt: -1 });

    res.json(exams);
  } catch (error) {
    next(error);
  }
};

const createExam = async (req, res, next) => {
  try {
    const uploadedPdf = req.files?.pdf?.[0];
    const payload = attachUploadedFiles(req, {
      ...mapExamPayload(req.body, req.userId),
      createdBy: req.userId
    });

    const exam = await Exam.create(payload);
    const questionImport = uploadedPdf
      ? await importQuestionsFromPdf({
        examId: exam._id,
        pdfPath: uploadedPdf.path,
        userId: req.userId
      }).catch((error) => ({
        extractedCount: 0,
        createdCount: 0,
        skippedExisting: 0,
        message: error.message || "Could not import questions from PDF."
      }))
      : null;

    res.status(201).json({
      ...exam.toObject(),
      questionImport
    });
  } catch (error) {
    next(error);
  }
};

const updateExam = async (req, res, next) => {
  try {
    const uploadedPdf = req.files?.pdf?.[0];
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    Object.assign(exam, attachUploadedFiles(req, mapExamPayload(req.body, req.userId, exam)));

    await exam.save();
    const questionImport = uploadedPdf
      ? await importQuestionsFromPdf({
        examId: exam._id,
        pdfPath: uploadedPdf.path,
        userId: req.userId
      }).catch((error) => ({
        extractedCount: 0,
        createdCount: 0,
        skippedExisting: 0,
        message: error.message || "Could not import questions from PDF."
      }))
      : null;

    res.json({
      ...exam.toObject(),
      questionImport
    });
  } catch (error) {
    next(error);
  }
};

const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const purchaseCount = await Purchase.countDocuments({
      exam: exam._id,
      status: { $in: ["paid", "pending"] }
    });

    if (purchaseCount === 0) {
      await exam.deleteOne();
      return res.json({ message: "Exam permanently deleted", mode: "hard" });
    }

    exam.isHidden = true;
    exam.hiddenAt = new Date();
    exam.updatedBy = req.userId;
    await exam.save();

    res.json({
      message: "Exam hidden because students already purchased it",
      mode: "soft"
    });
  } catch (error) {
    next(error);
  }
};

const normalizeExternalExam = (item, userId) => ({
  name: item.name || item.title,
  releaseYear: toNumber(item.releaseYear || item.year, new Date().getFullYear()),
  difficulty: item.difficulty || "medium",
  priceBundle: toNumber(item.priceBundle || item.bundlePrice),
  priceListening: toNumber(item.priceListening || item.listeningPrice),
  priceReading: toNumber(item.priceReading || item.readingPrice),
  pdfUrl: item.pdfUrl || item.pdf,
  audioUrls: item.audioUrls || item.audios || [],
  source: "external",
  externalId: item.externalId || item.id,
  createdBy: userId,
  updatedBy: userId
});

const importExams = async (req, res, next) => {
  try {
    let items = req.body.exams;

    if (!items && req.body.apiUrl) {
      const response = await fetch(req.body.apiUrl);

      if (!response.ok) {
        return res.status(502).json({
          message: `External API failed with status ${response.status}`
        });
      }

      const data = await response.json();
      items = Array.isArray(data) ? data : data.exams;
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Provide exams array or apiUrl returning an exams array"
      });
    }

    const imported = [];

    for (const item of items) {
      const payload = normalizeExternalExam(item, req.userId);

      if (!payload.name) {
        continue;
      }

      const query = payload.externalId
        ? { externalId: payload.externalId, source: "external" }
        : { name: payload.name, releaseYear: payload.releaseYear };

      const exam = await Exam.findOneAndUpdate(
        query,
        payload,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      imported.push(exam);
    }

    res.status(201).json({ importedCount: imported.length, exams: imported });
  } catch (error) {
    next(error);
  }
};

const listQuestions = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = await Question.find({ exam: exam._id }).sort({ questionNumber: 1 });
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

const importQuestionsFromExamPdf = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const pdfPath = getPdfPathFromUrl(exam.pdfUrl);

    if (!pdfPath) {
      return res.status(400).json({ message: "This exam does not have a local PDF file." });
    }

    const questionImport = await importQuestionsFromPdf({
      examId: exam._id,
      pdfPath,
      userId: req.userId
    });

    res.json(questionImport);
  } catch (error) {
    next(error);
  }
};

const createQuestion = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const payload = mapQuestionPayload(req.body, req.userId);
    const validationError = validateQuestionPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const [existingNumber, questionCount] = await Promise.all([
      Question.findOne({ exam: exam._id, questionNumber: payload.questionNumber }),
      Question.countDocuments({ exam: exam._id })
    ]);

    if (existingNumber) {
      return res.status(409).json({ message: "This question number already exists for the selected exam." });
    }

    if (questionCount >= 200) {
      return res.status(400).json({ message: "Each exam can contain a maximum of 200 questions." });
    }

    const question = await Question.create({
      ...payload,
      exam: exam._id,
      createdBy: req.userId
    });

    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const payload = mapQuestionPayload(req.body, req.userId, question);
    const validationError = validateQuestionPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const duplicate = await Question.findOne({
      exam: question.exam,
      questionNumber: payload.questionNumber,
      _id: { $ne: question._id }
    });

    if (duplicate) {
      return res.status(409).json({ message: "This question number already exists for the selected exam." });
    }

    Object.assign(question, payload);
    await question.save();

    res.json(question);
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    await question.deleteOne();
    res.json({ message: "Question deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuestion,
  getDashboardStats,
  importQuestionsFromExamPdf,
  deleteQuestion,
  listExams,
  listQuestions,
  createExam,
  updateExam,
  updateQuestion,
  deleteExam,
  importExams
};
