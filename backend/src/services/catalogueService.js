const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const ExamAttempt = require("../models/ExamAttempt");
const Purchase = require("../models/Purchase");
const Question = require("../models/Question");
const Favorite = require("../models/Favorite");
const {
  articles,
  banners,
  fallbackExams,
  fallbackVocabularyProducts
} = require("../data/catalogueFallbackData");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 24;

const categories = [
  { id: "full-test", name: "Bộ đề full test", label: "FULL" },
  { id: "listening", name: "Đề Listening", label: "LISTEN" },
  { id: "reading", name: "Đề Reading", label: "READ" },
  { id: "vocabulary", name: "Bộ từ vựng", label: "VOCAB" }
];

const packageMeta = {
  bundle: {
    category: "full-test",
    skill: "full",
    categoryName: "Bộ đề full test",
    categoryLabel: "FULL",
    priceKey: "priceBundle",
    titleSuffix: "",
    tone: "blue"
  },
  listening: {
    category: "listening",
    skill: "listening",
    categoryName: "Đề Listening",
    categoryLabel: "LISTEN",
    priceKey: "priceListening",
    titleSuffix: " - Gói Listening",
    tone: "cyan"
  },
  reading: {
    category: "reading",
    skill: "reading",
    categoryName: "Đề Reading",
    categoryLabel: "READ",
    priceKey: "priceReading",
    titleSuffix: " - Gói Reading",
    tone: "violet"
  }
};

const difficultyLabel = {
  easy: "Cơ bản",
  medium: "Trung cấp",
  hard: "Nâng cao"
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPositiveInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => toList(item));
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const toId = (value) => String(value?._id || value || "");

const countMap = (items, keySelector, valueSelector = (item) => item.count) => (
  new Map(items.map((item) => [keySelector(item), valueSelector(item)]))
);

const getPurchaseKey = (examId, packageType) => `${examId}:${packageType}`;

const VALID_PACKAGE_TYPES = new Set(["bundle", "listening", "reading", "vocabulary"]);

const normalizePurchaseExamRef = (rawExamId, packageType = "bundle") => {
  const raw = String(rawExamId || "").trim();
  const tokens = raw.split("-");

  if (tokens.length >= 2 && VALID_PACKAGE_TYPES.has(tokens[tokens.length - 1])) {
    return {
      examId: tokens.slice(0, -1).join("-"),
      packageType: tokens[tokens.length - 1]
    };
  }

  return {
    examId: raw,
    packageType: String(packageType || "bundle").trim()
  };
};

const buildPurchaseCountsMap = (purchaseAgg = []) => {
  const purchaseCounts = new Map();

  purchaseAgg.forEach((item) => {
    const normalized = normalizePurchaseExamRef(item._id?.exam, item._id?.packageType);
    const key = getPurchaseKey(normalized.examId, normalized.packageType);
    purchaseCounts.set(key, (purchaseCounts.get(key) || 0) + Number(item.count || 0));
  });

  return purchaseCounts;
};

const syncSoldCountsIfNeeded = async (exams, purchaseCounts) => {
  if (!exams.length || !purchaseCounts.size) {
    return;
  }

  const bulkOps = [];

  exams.forEach((exam) => {
    const examId = toId(exam);
    if (!mongoose.isValidObjectId(examId)) {
      return;
    }

    const $set = {};
    ["bundle", "listening", "reading"].forEach((packageType) => {
      const aggregated = purchaseCounts.get(getPurchaseKey(examId, packageType)) || 0;
      const persisted = toPositiveInteger(exam.soldCounts?.[packageType], 0);
      if (aggregated > persisted) {
        $set[`soldCounts.${packageType}`] = aggregated;
      }
    });

    if (Object.keys($set).length) {
      bulkOps.push({
        updateOne: {
          filter: { _id: examId },
          update: { $set }
        }
      });
    }
  });

  if (bulkOps.length) {
    try {
      await Exam.bulkWrite(bulkOps, { ordered: false });
    } catch (error) {
      // ignore sync errors, aggregated counts still render correctly
    }
  }
};

const parseProductId = (productId) => {
  const tokens = String(productId).split("-");
  if (tokens.length < 2) return { examId: null, packageType: null };
  const packageType = tokens.pop();
  const examId = tokens.join("-");
  if (!VALID_PACKAGE_TYPES.has(packageType)) {
    return { examId: String(productId), packageType: null };
  }
  return { examId, packageType };
};

const BASELINE_PRODUCT_VIEWS = 220;

const getPersistedViewCount = (exam, packageType) => {
  if (!exam || !packageType) return null;
  const counts = [
    toPositiveInteger(exam.viewCounts?.bundle, null),
    toPositiveInteger(exam.viewCounts?.listening, null),
    toPositiveInteger(exam.viewCounts?.reading, null)
  ].filter((value) => value !== null);
  if (counts.length > 0) {
    return Math.max(...counts);
  }
  return null;
};

const getBaseProductsFromExams = (exams, maps = {}, useFallbackScores = false) => {
  const questionCounts = maps.questionCounts || new Map();
  const purchaseCounts = maps.purchaseCounts || new Map();
  const attemptCounts = maps.attemptCounts || new Map();

  return exams.flatMap((exam, index) => {
    const examId = toId(exam);
    const questionCount = questionCounts.get(examId) || (useFallbackScores ? 200 - (index * 8) : 0);
    const attemptCount = attemptCounts.get(examId) || 0;
    const updatedAt = exam.updatedAt || exam.createdAt || `${exam.releaseYear || new Date().getFullYear()}-01-01`;

    return Object.entries(packageMeta)
      .map(([packageType, meta]) => {
        const price = toNumber(exam[meta.priceKey], 0);

        if (price <= 0) {
          return null;
        }

        const aggregatedSold = purchaseCounts.get(getPurchaseKey(examId, packageType)) || 0;
        const persistedSold = toPositiveInteger(exam.soldCounts?.[packageType], 0);
        const sold = Math.max(aggregatedSold, persistedSold) || (useFallbackScores ? 320 - (index * 33) : 0);
        const persistedViews = getPersistedViewCount(exam, packageType);
        const heuristicViews = (attemptCount * 6) + questionCount + (sold * 4);
        const views = persistedViews !== null
          ? persistedViews
          : (useFallbackScores ? heuristicViews + 900 - (index * 60) : Math.max(heuristicViews, 220));
        const rating = Math.min(5, 4.6 + Math.min(questionCount, 200) / 1000 + Math.min(sold, 100) / 1000);

        return {
          id: `${examId}-${packageType}`,
          examId,
          title: `${exam.name}${meta.titleSuffix}`,
          subtitle: `${difficultyLabel[exam.difficulty] || "Trung cấp"} - ${questionCount || 200} câu - ${exam.audioUrls?.length ? "Có audio" : "PDF luyện thi"}`,
          type: "exam",
          category: meta.category,
          categoryName: meta.categoryName,
          categoryLabel: meta.categoryLabel,
          skill: meta.skill,
          packageType,
          year: exam.releaseYear,
          price,
          originalPrice: Math.round(price * 1.22),
          rating: Number(rating.toFixed(1)),
          reviews: Math.max(18, Math.round((views || 120) / 18)),
          sold,
          views,
          tone: meta.tone,
          updatedAt,
          questionCount,
          difficulty: exam.difficulty,
          pdfUrl: exam.pdfUrl,
          audioCount: exam.audioUrls?.length || 0
        };
      })
      .filter(Boolean);
  });
};

const getDbProducts = async () => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }

  const exams = await Exam.find({ isHidden: { $ne: true } })
    .sort({ releaseYear: -1, createdAt: -1 })
    .lean();

  if (!exams.length) {
    return [];
  }

  const examIds = exams.map((exam) => exam._id);

  const [questionAgg, purchaseAgg, attemptAgg] = await Promise.all([
    Question.aggregate([
      { $match: { exam: { $in: examIds } } },
      { $group: { _id: "$exam", count: { $sum: 1 } } }
    ]),
    Purchase.aggregate([
      { $match: { status: "paid" } },
      {
        $project: {
          examRaw: {
            $convert: { input: "$exam", to: "string", onError: "", onNull: "" }
          },
          packageType: { $ifNull: ["$packageType", "bundle"] },
          user: 1
        }
      },
      { $match: { examRaw: { $ne: "" } } },
      { $group: { _id: { exam: "$examRaw", packageType: "$packageType", user: "$user" } } },
      { $group: { _id: { exam: "$_id.exam", packageType: "$_id.packageType" }, count: { $sum: 1 } } }
    ]),
    ExamAttempt.aggregate([
      { $match: { exam: { $in: examIds } } },
      { $group: { _id: "$exam", count: { $sum: 1 } } }
    ])
  ]);

  const purchaseCounts = buildPurchaseCountsMap(purchaseAgg);
  await syncSoldCountsIfNeeded(exams, purchaseCounts);

  return getBaseProductsFromExams(exams, {
    questionCounts: countMap(questionAgg, (item) => toId(item._id)),
    purchaseCounts,
    attemptCounts: countMap(attemptAgg, (item) => toId(item._id))
  });
};

const getFallbackProducts = () => [
  ...getBaseProductsFromExams(fallbackExams, {}, true),
  ...fallbackVocabularyProducts
];

const getProducts = async () => {
  const dbProducts = await getDbProducts();
  const products = dbProducts.length ? dbProducts : getFallbackProducts();

  try {
    if (mongoose.connection.readyState === 1) {
      const favAgg = await Favorite.aggregate([
        { $group: { _id: "$productId", count: { $sum: 1 } } }
      ]);
      const favMap = countMap(favAgg, (item) => item._id, (item) => item.count);
      return products.map((p) => ({ ...p, favorites: favMap.get(p.id) || 0 }));
    }
  } catch (err) {
    // ignore aggregation errors
  }

  return products.map((p) => ({ ...p, favorites: 0 }));
};

const normalizeSort = (sort) => {
  const allowedSorts = new Set([
    "latest",
    "best-seller",
    "most-viewed",
    "most-favorited",
    "price-asc",
    "price-desc",
    "rating"
  ]);

  return allowedSorts.has(sort) ? sort : "latest";
};

const sortProducts = (items, sort) => {
  const result = [...items];
  const sorter = normalizeSort(sort);
  const byNewest = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);

  if (sorter === "best-seller") {
    result.sort((a, b) => b.sold - a.sold || byNewest(a, b));
  } else if (sorter === "most-viewed") {
    result.sort((a, b) => b.views - a.views || byNewest(a, b));
  } else if (sorter === "most-favorited") {
    result.sort((a, b) => (b.favorites || 0) - (a.favorites || 0) || byNewest(a, b));
  } else if (sorter === "price-asc") {
    result.sort((a, b) => a.price - b.price || byNewest(a, b));
  } else if (sorter === "price-desc") {
    result.sort((a, b) => b.price - a.price || byNewest(a, b));
  } else if (sorter === "rating") {
    result.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  } else {
    result.sort(byNewest);
  }

  return result;
};

const filterProducts = (items, query = {}) => {
  const keyword = String(query.keyword || "").trim().toLowerCase();
  const keywordTerms = keyword ? keyword.split(/\s+/).filter(Boolean) : [];
  const categoryFilter = toList(query.category).filter((item) => item !== "all");
  const skillFilter = toList(query.skill).filter((item) => item !== "all");
  const typeFilter = toList(query.type).filter((item) => item !== "all");
  const yearFilter = toList(query.year).filter((item) => item !== "all").map(Number);
  const minPrice = query.minPrice === undefined || query.minPrice === "" ? null : toNumber(query.minPrice, null);
  const maxPrice = query.maxPrice === undefined || query.maxPrice === "" ? null : toNumber(query.maxPrice, null);
  const minRating = query.minRating === undefined || query.minRating === "" ? null : toNumber(query.minRating, null);
  const exactRating = query.rating === undefined || query.rating === "" ? null : toNumber(query.rating, null);

  return items.filter((product) => {
    const searchableText = [
      product.title,
      product.subtitle,
      product.categoryName,
      product.categoryLabel,
      product.skill,
      product.type,
      product.year
    ].join(" ").toLowerCase();

    if (keywordTerms.length && !keywordTerms.every((term) => searchableText.includes(term))) return false;
    if (categoryFilter.length && !categoryFilter.includes(product.category)) return false;
    if (skillFilter.length && !skillFilter.includes(product.skill)) return false;
    if (typeFilter.length && !typeFilter.includes(product.type)) return false;
    if (yearFilter.length && !yearFilter.includes(product.year)) return false;
    if (minPrice !== null && product.price < minPrice) return false;
    if (maxPrice !== null && product.price > maxPrice) return false;
    if (exactRating !== null) {
      const rounded = Math.round(product.rating || 0);
      if (rounded !== exactRating) return false;
    } else if (minRating !== null && product.rating < minRating) return false;

    return true;
  });
};

const paginate = (items, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) => {
  const safePage = toPositiveInteger(page, DEFAULT_PAGE);
  const safeLimit = Math.min(toPositiveInteger(limit, DEFAULT_LIMIT), MAX_LIMIT);
  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
  const start = (safePage - 1) * safeLimit;

  return {
    items: items.slice(start, start + safeLimit),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasMore: safePage < totalPages
    }
  };
};

const getFilterOptions = (products) => ({
  categories,
  years: [...new Set(products.map((product) => product.year))].sort((a, b) => b - a),
  skills: [
    { id: "full", name: "Full test" },
    { id: "listening", name: "Nghe" },
    { id: "reading", name: "Đọc" },
    { id: "vocabulary", name: "Từ vựng" }
  ],
  types: [
    { id: "exam", name: "Đề thi" },
    { id: "vocabulary", name: "Bộ từ vựng" }
  ],
  ratingLevels: [5, 4, 3, 2, 1]
});

const listProducts = async (query = {}) => {
  const products = await getProducts();
  const filteredProducts = filterProducts(products, query);
  const sortedProducts = sortProducts(filteredProducts, query.sort);

  return paginate(sortedProducts, query.page, query.limit);
};

const listRankedProducts = async (sort, query = {}) => {
  const products = await getProducts();
  const topProducts = sortProducts(products, sort).slice(0, 10);

  return paginate(topProducts, query.page, query.limit || 5);
};

const getHomeData = async () => {
  const products = await getProducts();
  const sortedLatest = sortProducts(products, "latest");

  return {
    banners,
    categories,
    articles,
    latestProducts: sortedLatest.slice(0, 8),
    filters: getFilterOptions(products),
    stats: {
      products: products.length,
      exams: products.filter((product) => product.type === "exam").length,
      vocabulary: products.filter((product) => product.type === "vocabulary").length,
      averageRating: products.length
        ? Number((products.reduce((sum, product) => sum + product.rating, 0) / products.length).toFixed(1))
        : 0
    }
  };
};

const getProductById = async (productId) => {
  if (!productId) return null;
  const products = await getProducts();
  return products.find((product) => String(product.id) === String(productId)) || null;
};

const incrementProductViewCount = async (productId) => {
  if (!productId) return null;
  const { examId, packageType } = parseProductId(productId);
  const validPackages = new Set(['bundle', 'listening', 'reading']);

  if (examId && validPackages.has(packageType) && mongoose.Types.ObjectId.isValid(examId)) {
    try {
      await Exam.findByIdAndUpdate(
        examId,
        { $inc: { 'viewCounts.bundle': 1, 'viewCounts.listening': 1, 'viewCounts.reading': 1 } },
        { new: true }
      );
    } catch (error) {
      // ignore cast or update errors, fallback to returning the product
    }
  }

  return getProductById(productId);
};

module.exports = {
  getHomeData,
  listProducts,
  listRankedProducts,
  getProducts,
  getProductById,
  incrementProductViewCount
};
