const Exam = require("../models/Exam");
const ExamAttempt = require("../models/ExamAttempt");
const Payment = require("../models/Payment");
const Purchase = require("../models/Purchase");
const User = require("../models/User");

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
    const payload = attachUploadedFiles(req, {
      ...mapExamPayload(req.body, req.userId),
      createdBy: req.userId
    });

    const exam = await Exam.create(payload);

    res.status(201).json(exam);
  } catch (error) {
    next(error);
  }
};

const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    Object.assign(exam, attachUploadedFiles(req, mapExamPayload(req.body, req.userId, exam)));

    await exam.save();
    res.json(exam);
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

module.exports = {
  getDashboardStats,
  listExams,
  createExam,
  updateExam,
  deleteExam,
  importExams
};
