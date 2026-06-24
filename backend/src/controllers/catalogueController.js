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

module.exports = {
  getHome,
  listBestSellers,
  listMostViewed,
  listProducts,
  listMostFavorited
};
