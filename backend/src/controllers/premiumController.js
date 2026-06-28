const Premium = require('../models/Premium');

const formatPrice = (price, currency) => {
  if (price === undefined || price === null) return '';
  if (typeof price === 'number') {
    if (currency && currency.toUpperCase() === 'VND') {
      return `${price.toLocaleString('vi-VN')}đ`;
    }
    return price.toString();
  }
  return String(price);
};

const normalizePremium = (doc) => ({
  id: String(doc._id || doc.id || doc.name || 'premium'),
  name: doc.name || doc.title || doc.label || 'Gói Premium',
  description: doc.description || '',
  price: typeof doc.price === 'number' ? doc.price : Number(doc.price) || 0,
  formattedPrice: formatPrice(typeof doc.price === 'number' ? doc.price : Number(doc.price) || 0, doc.currency),
  currency: doc.currency || 'VND',
  durationMonths: doc.durationMonths || 12,
  features: Array.isArray(doc.features) ? doc.features : [],
  buttonText: doc.buttonText || 'Đăng ký ngay',
  isActive: doc.isActive !== false,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});

const listPremiumPlans = async (req, res, next) => {
  try {
    const premiums = await Premium.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).lean();
    const result = premiums.map(normalizePremium);
    res.json({ plans: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPremiumPlans
};
