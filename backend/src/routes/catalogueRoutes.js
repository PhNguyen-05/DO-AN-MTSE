const express = require("express");
const {
  getHome,
  listBestSellers,
  listMostViewed,
  listProducts,
  listMostFavorited,
  getProductById,
  trackProductView,
  submitProductReview,
  listProductReviewsByProduct
} = require("../controllers/catalogueController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/home", getHome);
router.get("/products", listProducts);
router.get("/products/best-sellers", listBestSellers);
router.get("/products/most-viewed", listMostViewed);
router.get("/products/most-favorited", listMostFavorited);
router.get("/products/:productId/view", trackProductView);
router.get("/products/:productId", getProductById);
router.post("/products/:productId/reviews", authMiddleware, submitProductReview);
router.get("/products/:productId/reviews", listProductReviewsByProduct);

module.exports = router;
