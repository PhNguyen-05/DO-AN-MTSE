const catalogueService = require("../services/catalogueService");
const ProductReviewComment = require("../models/ProductReviewComment");

const getHome = async (req, res, next) => {
  try {
    const data = await catalogueService.getHomeData();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const listProducts = async (req, res, next) => {
  try {
    const data = await catalogueService.listProducts(req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const listBestSellers = async (req, res, next) => {
  try {
    const data = await catalogueService.listRankedProducts("best-seller", req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const listMostViewed = async (req, res, next) => {
  try {
    const data = await catalogueService.listRankedProducts("most-viewed", req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const listMostFavorited = async (req, res, next) => {
  try {
    const data = await catalogueService.listRankedProducts("most-favorited", req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await catalogueService.getProductById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy." });
    }
    res.json({ item: product });
  } catch (error) {
    next(error);
  }
};

const trackProductView = async (req, res, next) => {
  try {
    const product = await catalogueService.incrementProductViewCount(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy." });
    }
    res.json({ item: product });
  } catch (error) {
    next(error);
  }
};

const submitProductReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { content, ratingStars, targetType } = req.body;
    const userId = req.userId;

    if (!content?.trim() || !ratingStars || !targetType) {
      return res.status(400).json({ message: "Thiếu nội dung, số sao hoặc loại sản phẩm." });
    }

    const stars = Number(ratingStars);
    if (stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Số sao phải từ 1 đến 5." });
    }

    let examId = productId;
    if (productId && productId.includes("-")) {
      const parts = productId.split("-");
      if (["bundle", "listening", "reading", "vocabulary"].includes(parts[parts.length - 1])) {
        examId = parts.slice(0, -1).join("-");
      }
    }

    const review = new ProductReviewComment({
      userId,
      targetType,
      productId: examId,
      rating: stars,
      comment: content.trim(),
      status: 'VISIBLE'
    });

    await review.save();
    await review.populate('userId', 'name email');

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

const listProductReviewsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let examId = productId;
    if (productId && productId.includes("-")) {
      const parts = productId.split("-");
      if (["bundle", "listening", "reading", "vocabulary"].includes(parts[parts.length - 1])) {
        examId = parts.slice(0, -1).join("-");
      }
    }
    const reviews = await ProductReviewComment.find({
      productId: examId,
      status: 'VISIBLE'
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHome,
  listBestSellers,
  listMostViewed,
  listProducts,
  listMostFavorited,
  getProductById,
  trackProductView,
  submitProductReview,
  listProductReviewsByProduct
};
