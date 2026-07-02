const Exam = require("../models/Exam");
const ExamAttempt = require("../models/ExamAttempt");
const Coupon = require("../models/Coupon");
const Payment = require("../models/Payment");
const Purchase = require("../models/Purchase");
const Question = require("../models/Question");
const User = require("../models/User");
const UserSession = require("../models/UserSession");
const VocabularySet = require("../models/VocabularySet");
const BlogPost = require("../models/BlogPost");
const Comment = require("../models/Comment");
const {
  getPdfPathFromUrl,
  importQuestionsFromPdf
} = require("../services/questionImportService");
const { getRevenueStats } = require("../services/revenueService");

const path = require("path");
const UPLOADS_ROOT = path.join(__dirname, "..", "..", "uploads");

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
  durationMinutes: toNumber(body.durationMinutes ?? body.duration ?? existing.durationMinutes, 120),
  updatedBy: userId
});

const validateExamPayload = (payload) => {
  if (!Number.isInteger(payload.durationMinutes) || payload.durationMinutes < 1 || payload.durationMinutes > 300) {
    return "Exam duration must be between 1 and 300 minutes.";
  }

  return null;
};

// Build URL from actual file.path relative to uploads root.
// Handles subfolders: uploads/avatar/, uploads/questions/, uploads/ root.
const fileUrl = (req, file) => {
  const relativePath = path.relative(UPLOADS_ROOT, file.path).replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/uploads/${relativePath}`;
};
const getBaseUrl = (req) => `${req.protocol}://${req.get("host")}`;
const getUploadedFile = (req, fieldName) => {
  if (req.files?.[fieldName]?.[0]) return req.files[fieldName][0];
  if (req.file?.fieldname === fieldName) return req.file;
  return null;
};

const answerKeys = ["A", "B", "C", "D"];
const getRequiredAnswerKeys = (part) => (part === 2 ? ["A", "B", "C"] : answerKeys);

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
  const words = parseJsonArray(body.words, existing.words || []).map((word, index) => ({
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
  const isActiveInput = body.isActive === undefined ? (existing.isActive ?? true) : body.isActive === true || body.isActive === "true";

  return {
    code: (body.code ?? existing.code ?? "").trim().toUpperCase(),
    discountType: body.discountType ?? existing.discountType ?? "percent",
    discountPercent: toNumber(body.discountPercent ?? existing.discountPercent),
    fixedAmount: toNumber(body.fixedAmount ?? existing.fixedAmount),
    minimumOrderValue: toNumber(body.minimumOrderValue ?? existing.minimumOrderValue),
    maxUses: toNumber(body.maxUses ?? existing.maxUses),
    maxUsesPerUser: toNumber(body.maxUsesPerUser ?? existing.maxUsesPerUser, 1),
    startDate: body.startDate ?? existing.startDate,
    endDate: endDate,
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

const mapQuestionPayload = (body, userId, existing = {}, uploadedImageFile = null, req = null) => {
  const answers = answerKeys.reduce((result, key) => {
    result[key] = body.answers?.[key] ?? body[`answer${key}`] ?? existing.answers?.[key] ?? "";
    return result;
  }, {});

  // Resolve imageUrl: new upload > keep existing > empty
  let imageUrl = existing.imageUrl ?? "";
  if (uploadedImageFile && req) {
    imageUrl = fileUrl(req, uploadedImageFile);
  } else if (body.removeImage === "true") {
    imageUrl = "";
  } else if (body.imageUrl !== undefined) {
    imageUrl = body.imageUrl;
  }

  return {
    part: toNumber(body.part ?? existing.part),
    questionNumber: toNumber(body.questionNumber ?? existing.questionNumber),
    readingPassage: body.readingPassage ?? existing.readingPassage ?? "",
    imageUrl,
    imagePage: (() => {
      const val = body.imagePage !== undefined ? body.imagePage : existing.imagePage;
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return Number.isFinite(num) && num >= 1 ? num : undefined;
    })(),
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

  if (!getRequiredAnswerKeys(payload.part).every((key) => payload.answers[key]?.trim())) {
    return payload.part === 2
      ? "Please enter answers A, B and C."
      : "Please enter all answers A, B, C and D.";
  }

  if (!answerKeys.includes(payload.correctAnswer)) {
    return "Correct answer must be A, B, C or D.";
  }

  return null;
};

const attachUploadedFiles = (req, payload, existing = {}) => {
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

  // Handle per-part audio for Listening (Parts 1-4)
  // Start from existing DB values so parts not re-uploaded are preserved
  const existingPartAudio = existing.partAudioUrls || {};
  const partAudioUrls = {
    part1: existingPartAudio.part1 || "",
    part2: existingPartAudio.part2 || "",
    part3: existingPartAudio.part3 || "",
    part4: existingPartAudio.part4 || ""
  };

  ["partAudio1", "partAudio2", "partAudio3", "partAudio4"].forEach((fieldName, index) => {
    const partKey = `part${index + 1}`;
    if (req.files?.[fieldName]?.[0]) {
      partAudioUrls[partKey] = fileUrl(req, req.files[fieldName][0]);
    } else if (req.body[`remove_partAudio${index + 1}`] === "true") {
      partAudioUrls[partKey] = "";
    }
  });
  payload.partAudioUrls = partAudioUrls;

  return payload;
};

const getDashboardStats = async (req, res, next) => {
  try {
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

    const [
      totalUsers,
      totalExams,
      totalBlogPosts,
      totalVocabularySets,
      totalCoupons,
      totalComments,
      totalAttempts,
      completedAttempts
    ] = await Promise.all([
      User.countDocuments({ role: "User" }),
      Exam.countDocuments({ isHidden: false }),
      BlogPost.countDocuments({ isHidden: false }),
      VocabularySet.countDocuments({ isHidden: false }),
      Coupon.countDocuments({ isHidden: false }),
      Comment.countDocuments(),
      ExamAttempt.countDocuments(),
      ExamAttempt.countDocuments({ status: "completed" })
    ]);

    const response = {
      totalUsers,
      totalExams,
      totalBlogPosts,
      totalVocabularySets,
      totalCoupons,
      totalComments,
      totalAttempts,
      completedAttempts
    };

    if (String(req.userRole || "").toLowerCase() === "admin") {
      const revenueStats = await getRevenueStats(year);
      response.revenue = revenueStats.revenue;
      response.monthlyRevenue = revenueStats.monthlyRevenue;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const getInteractionStats = async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const dateFilter = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    const [
      examAttempts,
      completedExamAttempts,
      activeUsers,
      userActivityAgg
    ] = await Promise.all([
      ExamAttempt.countDocuments(dateFilter),
      ExamAttempt.countDocuments({ ...dateFilter, status: "completed" }),
      User.countDocuments({ role: "User", createdAt: { $gte: startDate, $lte: endDate } }),
      ExamAttempt.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$user",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            userName: { $arrayElemAt: ["$user.name", 0] },
            userEmail: { $arrayElemAt: ["$user.email", 0] },
            activityCount: "$count"
          }
        }
      ])
    ]);

    const practiceAttempts = examAttempts;
    const vocabularyStudyCount = await VocabularySet.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: { $size: "$words" } }
        }
      }
    ]).then((result) => result[0]?.total || 0);

    const mostActiveUser = userActivityAgg.length > 0 ? userActivityAgg[0] : null;

    const response = {
      examAttempts,
      practiceAttempts,
      vocabularyStudyCount,
      activeUsers,
      mostActiveUser: mostActiveUser || null,
      startDate,
      endDate
    };

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
    const uploadedAnswerPdf = req.files?.answerPdf?.[0];
    const payload = attachUploadedFiles(req, {
      ...mapExamPayload(req.body, req.userId),
      createdBy: req.userId
    });
    const validationError = validateExamPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const exam = await Exam.create(payload);
    const questionImport = uploadedPdf
      ? await importQuestionsFromPdf({
        examId: exam._id,
        pdfPath: uploadedPdf.path,
        answerPdfPath: uploadedAnswerPdf?.path,
        userId: req.userId,
        baseUrl: getBaseUrl(req)
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
    const uploadedAnswerPdf = req.files?.answerPdf?.[0];
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const payload = attachUploadedFiles(req, mapExamPayload(req.body, req.userId, exam), exam);
    const validationError = validateExamPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    Object.assign(exam, payload);
    exam.markModified("partAudioUrls");

    await exam.save();
    const questionImport = uploadedPdf || uploadedAnswerPdf
      ? await importQuestionsFromPdf({
        examId: exam._id,
        pdfPath: uploadedPdf?.path || getPdfPathFromUrl(exam.pdfUrl),
        answerPdfPath: uploadedAnswerPdf?.path || getPdfPathFromUrl(exam.answerPdfUrl),
        userId: req.userId,
        baseUrl: getBaseUrl(req)
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
  durationMinutes: toNumber(item.durationMinutes || item.duration, 120),
  pdfUrl: item.pdfUrl || item.pdf,
  answerPdfUrl: item.answerPdfUrl || item.answerPdf,
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
      answerPdfPath: getPdfPathFromUrl(exam.answerPdfUrl),
      userId: req.userId,
      baseUrl: getBaseUrl(req)
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

    const uploadedImageFile = req.file || null;
    const payload = mapQuestionPayload(req.body, req.userId, {}, uploadedImageFile, req);
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

    const uploadedImageFile = req.file || null;
    const payload = mapQuestionPayload(req.body, req.userId, question, uploadedImageFile, req);
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

// Blog Post Controllers
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const listBlogPosts = async (req, res, next) => {
  try {
    const { status, category, includeHidden } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (includeHidden !== 'true') filter.isHidden = false;

    const posts = await BlogPost.find(filter)
      .populate('author', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

const createBlogPost = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, submitForApproval } = req.body;
    const userId = req.userId;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const slug = generateSlug(title);
    const existingPost = await BlogPost.findOne({ slug });

    if (existingPost) {
      return res.status(409).json({ message: "A post with this title already exists." });
    }

    const blogPost = new BlogPost({
      title: title.trim(),
      slug,
      content: content.trim(),
      excerpt: excerpt?.trim() || content.substring(0, 200).trim(),
      category: category || 'blog',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      author: userId,
      status: submitForApproval === 'true' ? 'PENDING' : 'DRAFT'
    });

    const thumbnail = getUploadedFile(req, "thumbnail");
    if (thumbnail) {
      blogPost.thumbnailUrl = fileUrl(req, thumbnail);
    }

    await blogPost.save();
    await blogPost.populate('author', 'name email');

    res.status(201).json(blogPost);
  } catch (error) {
    next(error);
  }
};

const updateBlogPost = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, submitForApproval } = req.body;
    const userId = req.userId;
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    if (title?.trim()) {
      const newSlug = generateSlug(title);
      if (newSlug !== post.slug) {
        const existingPost = await BlogPost.findOne({ slug: newSlug, _id: { $ne: post._id } });
        if (existingPost) {
          return res.status(409).json({ message: "A post with this title already exists." });
        }
        post.slug = newSlug;
      }
      post.title = title.trim();
    }

    if (content?.trim()) post.content = content.trim();
    if (excerpt?.trim) post.excerpt = excerpt.trim();
    if (category) post.category = category;
    if (tags) post.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());

    const thumbnail = getUploadedFile(req, "thumbnail");
    if (thumbnail) {
      post.thumbnailUrl = fileUrl(req, thumbnail);
    }

    // If editing an approved post, require re-approval
    if (post.status === 'APPROVED') {
      post.status = 'PENDING';
    } else if (submitForApproval === 'true' && post.status === 'DRAFT') {
      post.status = 'PENDING';
    }

    post.updatedBy = userId;
    await post.save();
    await post.populate('author', 'name email');

    res.json(post);
  } catch (error) {
    next(error);
  }
};

const approveBlogPost = async (req, res, next) => {
  try {
    const userId = req.userId;
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    if (post.status !== 'PENDING') {
      return res.status(400).json({ message: "Only pending posts can be approved." });
    }

    post.status = 'APPROVED';
    post.approvedBy = userId;
    post.approvedAt = new Date();
    post.publishedAt = new Date();
    post.updatedBy = userId;

    await post.save();
    await post.populate('author', 'name email');
    await post.populate('approvedBy', 'name email');

    res.json(post);
  } catch (error) {
    next(error);
  }
};

const deleteBlogPost = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    post.isHidden = true;
    post.hiddenAt = new Date();
    post.updatedBy = req.userId;
    await post.save();

    res.json({ message: "Blog post hidden successfully.", mode: "soft" });
  } catch (error) {
    next(error);
  }
};

// Comment Controllers
const listComments = async (req, res, next) => {
  try {
    const { status, targetType, includeHidden } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;
    if (includeHidden !== 'true') filter.status = 'VISIBLE';

    const comments = await Comment.find(filter)
      .populate('author', 'name email role')
      .populate('replyTo', 'content author')
      .populate('hiddenBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { content, targetType, targetId, replyTo } = req.body;
    const userId = req.userId;

    if (!content?.trim() || !targetType || !targetId) {
      return res.status(400).json({ message: "Content, target type, and target ID are required." });
    }

    const user = await User.findById(userId);
    const isAdminReply = user.role === 'admin' || user.role === 'manager';

    const comment = new Comment({
      content: content.trim(),
      author: userId,
      targetType,
      targetId,
      replyTo: replyTo || null,
      isAdminReply
    });

    await comment.save();
    await comment.populate('author', 'name email role');

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

const hideComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    comment.status = 'HIDDEN';
    comment.hiddenBy = req.userId;
    comment.hiddenAt = new Date();

    await comment.save();
    await comment.populate('author', 'name email role');
    await comment.populate('hiddenBy', 'name email');

    res.json(comment);
  } catch (error) {
    next(error);
  }
};

const showComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    comment.status = 'VISIBLE';
    comment.hiddenBy = null;
    comment.hiddenAt = null;

    await comment.save();
    await comment.populate('author', 'name email role');

    res.json(comment);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: "Comment deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// User Management Controllers
const listUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (role && role !== "") {
      filter.role = role;
    }

    if (status && status !== "") {
      filter.status = status;
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash -otp -resetPasswordOtp')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const mappedUsers = users.map(u => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      avatarUrl: u.avatarUrl,
      role: u.role,
      accountType: u.accountType || "Thường",
      status: u.status
    }));

    res.json({
      data: mappedUsers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { newRole } = req.body;
    const validRoles = ['Admin', 'Manager', 'User', 'Employee'];
    const mappedRole = validRoles.find(r => r.toLowerCase() === newRole?.toLowerCase()) || 'User';

    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found." });
    }

    userToUpdate.role = mappedRole;
    await userToUpdate.save();

    res.json({ message: "Cập nhật quyền thành công." });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found." });
    }

    const isBeingLocked = userToUpdate.status !== "Bị khóa";
    userToUpdate.status = isBeingLocked ? "Bị khóa" : "Đang hoạt động";
    await userToUpdate.save();

    // Revoke only the locked user's sessions
    if (isBeingLocked) {
      await UserSession.deleteMany({ userId: userToUpdate._id });
    }

    res.json({ 
      message: isBeingLocked 
        ? "Tài khoản đã bị khóa thành công." 
        : "Tài khoản đã được mở khóa thành công." 
    });
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
  getInteractionStats,
  importQuestionsFromExamPdf,
  deleteQuestion,
  listExams,
  listCoupons,
  listQuestions,
  listVocabularySets,
  createExam,
  updateExam,
  updateCoupon,
  updateQuestion,
  updateVocabularySet,
  deleteVocabularySet,
  deleteExam,
  importExams,
  // Blog Post exports
  listBlogPosts,
  createBlogPost,
  updateBlogPost,
  approveBlogPost,
  deleteBlogPost,
  // Comment exports
  listComments,
  createComment,
  hideComment,
  showComment,
  deleteComment,
  // User Management
  listUsers,
  updateUserRole,
  updateUserStatus
};
