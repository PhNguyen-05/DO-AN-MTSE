const express = require("express");
const {
  getHome,
  listBestSellers,
  listMostViewed,
  listProducts,
  listMostFavorited,
  getProductById,
  trackProductView
} = require("../controllers/catalogueController");

const router = express.Router();

router.get("/home", getHome);
router.get("/products", listProducts);
router.get("/products/best-sellers", listBestSellers);
router.get("/products/most-viewed", listMostViewed);
router.get("/products/most-favorited", listMostFavorited);
router.get("/products/:productId/view", trackProductView);
router.get("/products/:productId", getProductById);

module.exports = router;
