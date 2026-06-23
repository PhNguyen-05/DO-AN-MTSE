const express = require("express");
const {
  getHome,
  listBestSellers,
  listMostViewed,
  listProducts
} = require("../controllers/catalogueController");

const router = express.Router();

router.get("/home", getHome);
router.get("/products", listProducts);
router.get("/products/best-sellers", listBestSellers);
router.get("/products/most-viewed", listMostViewed);

module.exports = router;
