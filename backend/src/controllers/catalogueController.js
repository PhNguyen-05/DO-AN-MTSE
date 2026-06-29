const catalogueService = require("../services/catalogueService");

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

module.exports = {
  getHome,
  listBestSellers,
  listMostViewed,
  listProducts,
  listMostFavorited,
  getProductById,
  trackProductView
};
