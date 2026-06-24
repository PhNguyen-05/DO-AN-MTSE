const Favorite = require('../models/Favorite');
const catalogueService = require('../services/catalogueService');

const addFavorite = async (req, res, next) => {
  try {
    const { productId, productType } = req.body || {};
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const existing = await Favorite.findOne({ user: req.userId, productId });
    if (existing) return res.status(200).json({ message: 'already' });

    await Favorite.create({ user: req.userId, productId, productType });
    return res.json({ message: 'added' });
  } catch (error) {
    return next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    await Favorite.findOneAndDelete({ user: req.userId, productId });
    return res.json({ message: 'removed' });
  } catch (error) {
    return next(error);
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.userId }).lean();
    const productIds = favorites.map((f) => f.productId);

    const allProducts = await catalogueService.getProducts();
    const items = allProducts.filter((p) => productIds.includes(p.id));

    return res.json({ items, total: items.length });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites
};
