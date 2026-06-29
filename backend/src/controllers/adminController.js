const Exam = require("../models/Exam");
const ExamAttempt = require("../models/ExamAttempt");
const Coupon = require("../models/Coupon");
const Payment = require("../models/Payment");
const Purchase = require("../models/Purchase");
const Question = require("../models/Question");
const User = require("../models/User");
const VocabularySet = require("../models/VocabularySet");
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

const parseJsonArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const mapVocabularyPayload = (req, existing = {}) => {
  const body = req.body;
  let uploadedAudioIndex = 0;
  let uploadedImageIndex = 0;
  const words = parseJsonArray(body.words, existing.words || []).map((word) => ({
    term: word.term || word.word || "",
    phonetic: word.phonetic || "",
    partOfSpeech: word.partOfSpeech || "",
    meaning: word.meaning || "",
    example: word.example || "",
    audioUrl: word.hasNewAudio && req.files?.wordAudios?.[uploadedAudioIndex]
      ? fileUrl(req, req.files.wordAudios[uploadedAudioIndex++])
      : (word.audioUrl || ""),
    imageUrl: word.hasNewImage && req.files?.wordImages?.[uploadedImageIndex]
      ? fileUrl(req, req.files.wordImages[uploadedImageIndex++])
      : (word.imageUrl || "")
  })).filter((word) => word.term.trim() && word.meaning.trim());

  const payload = {
    name: body.name ?? existing.name,
    description: body.description ?? existing.description ?? "",
    price: toNumber(body.price ?? existing.price),
    accessType: body.accessType ?? existing.accessType ?? "paid",
    words,
    updatedBy: req.userId
  };

  if (req.files?.thumbnail?.[0]) {
    payload.thumbnailUrl = fileUrl(req, req.files.thumbnail[0]);
  } else if (existing.thumbnailUrl) {
    payload.thumbnailUrl = existing.thumbnailUrl;
  }

  return payload;
};

const validateVocabularyPayload = (payload) => {
  if (!payload.name?.trim()) return "Vocabulary set name is required.";
  if (!["free", "paid", "premium"].includes(payload.accessType)) return "Invalid access type.";
  if (!Number.isFinite(payload.price) || payload.price < 0) return "Price must be greater than or equal to 0.";
  if (!Array.isArray(payload.words) || payload.words.length === 0) return "Please add at least one vocabulary word.";
  return null;
};

const mapCouponPayload = (body, userId, existing = {}) => {
  const endDate = body.endDate ?? existing.endDate;
  const isExpired = endDate && new Date(endDate) < new Date();
  const isActiveInput = body.isActive === undefined
    ? (existing.isActive ?? true)
    : body.isActive === true || body.isActive === "true";

  return {
    code: (body.code ?? existing.code ?? "").trim().toUpperCase(),
    discountType: body.discountType ?? existing.discountType ?? "percent",
    discountPercent: toNumber(body.discountPercent ?? existing.discountPercent),
    fixedAmount: toNumber(body.fixedAmount ?? existing.fixedAmount),
    minimumOrderValue: toNumber(body.minimumOrderValue ?? existing.minimumOrderValue),
    maxUses: toNumber(body.maxUses ?? existing.maxUses),
    maxUsesPerUser: toNumber(body.maxUsesPerUser ?? existing.maxUsesPerUser, 1),
    startDate: body.startDate ?? existing.startDate,
    endDate,
    scope: body.scope ?? existing.scope ?? "system",
    isActive: isExpired ? false : isActiveInput,
    updatedBy: userId
  };
};

const validateCouponPayload = (payload) => {
  if (!payload.code) return "Coupon code is required.";
  if (!["percent", "fixed"].includes(payload.discountType)) return "Invalid discount type.";
  if (payload.discountType === "percent" && (payload.discountPercent <= 0 || payload.discountPercent > 100)) {
    return "Percent discount must be between 1 and 100.";
  }
  if (payload.discountType === "fixed" && payload.fixedAmount <= 0) {
    return "Fixed amount must be greater than 0.";
  }
  if (!["system", "exam_2026", "premium"].includes(payload.scope)) return "Invalid coupon scope.";
  if (!payload.startDate || !payload.endDate || Number.isNaN(new Date(payload.startDate).getTime()) || Number.isNaN(new Date(payload.endDate).getTime())) {
    return "Start and end dates are required.";
  }
  if (new Date(payload.endDate) < new Date(payload.startDate)) {
    return "End date must be after start date.";
  }
  return null;
};

const attachUploadedFiles = (req, payload) => {
  if (req.files?.pdf?.[0]) {
    payload.pdfUrl = fileUrl(req, req.files.pdf[0]);
  }

  if (req.files?.answerPdf?.[0]) {
    payload.answerPdfUrl = fileUrl(req, req.files.answerPdf[0]);
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

const listVocabularySets = async (req, res, next) => {
  try {
    const includeHidden = req.query.includeHidden === "true";
    const filter = includeHidden ? {} : { isHidden: false };
    const vocabularySets = await VocabularySet.find(filter).sort({ createdAt: -1 });

    res.json(vocabularySets);
  } catch (error) {
    next(error);
  }
};

const createVocabularySet = async (req, res, next) => {
  try {
    const payload = {
      ...mapVocabularyPayload(req),
      createdBy: req.userId
    };
    const validationError = validateVocabularyPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const vocabularySet = await VocabularySet.create(payload);
    res.status(201).json(vocabularySet);
  } catch (error) {
    next(error);
  }
};

const updateVocabularySet = async (req, res, next) => {
  try {
    const vocabularySet = await VocabularySet.findById(req.params.id);

    if (!vocabularySet) {
      return res.status(404).json({ message: "Vocabulary set not found" });
    }

    const payload = mapVocabularyPayload(req, vocabularySet);
    const validationError = validateVocabularyPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    Object.assign(vocabularySet, payload);
    await vocabularySet.save();

    res.json(vocabularySet);
  } catch (error) {
    next(error);
  }
};

const deleteVocabularySet = async (req, res, next) => {
  try {
    const vocabularySet = await VocabularySet.findById(req.params.id);

    if (!vocabularySet) {
      return res.status(404).json({ message: "Vocabulary set not found" });
    }

    vocabularySet.isHidden = true;
    vocabularySet.hiddenAt = new Date();
    vocabularySet.updatedBy = req.userId;
    await vocabularySet.save();

    res.json({ message: "Vocabulary set hidden successfully.", mode: "soft" });
  } catch (error) {
    next(error);
  }
};

const listCoupons = async (req, res, next) => {
  try {
    const includeHidden = req.query.includeHidden === "true";
    const filter = includeHidden ? {} : { isHidden: false };
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });

    const mappedCoupons = coupons.map((coupon) => {
      const obj = coupon.toObject();
      if (obj.isActive && obj.endDate && new Date(obj.endDate) < new Date()) {
        obj.isActive = false;
      }
      return obj;
    });

    res.json(mappedCoupons);
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const payload = {
      ...mapCouponPayload(req.body, req.userId),
      createdBy: req.userId
    };
    const validationError = validateCouponPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const coupon = await Coupon.create(payload);
    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Coupon code already exists." });
    }
    next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const payload = mapCouponPayload(req.body, req.userId, coupon);
    const validationError = validateCouponPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    Object.assign(coupon, payload);
    await coupon.save();

    res.json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Coupon code already exists." });
    }
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isHidden = true;
    coupon.isActive = false;
    coupon.hiddenAt = new Date();
    coupon.updatedBy = req.userId;
    await coupon.save();

    res.json({ message: "Coupon hidden successfully.", mode: "soft" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCoupon,
  createQuestion,
  createVocabularySet,
  deleteCoupon,
  getDashboardStats,
  importQuestionsFromExamPdf,
  deleteQuestion,
  deleteVocabularySet,
  listExams,
  listCoupons,
  listQuestions,
  listVocabularySets,
  createExam,
  updateExam,
  updateCoupon,
  updateQuestion,
  updateVocabularySet,
  deleteExam,
  importExams
};
