const Promotion = require('../models/Promotion');

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getDiscountText = (promo) => {
  if (promo.discountText) return promo.discountText;
  if (promo.discountValue) return String(promo.discountValue);
  if (promo.fixedAmount !== undefined && promo.fixedAmount !== null && promo.fixedAmount > 0) {
    return `${promo.fixedAmount.toLocaleString('vi-VN')}đ`;
  }
  if (promo.discountAmount !== undefined && promo.discountAmount !== null && promo.discountAmount > 0) {
    return `${promo.discountAmount.toLocaleString('vi-VN')}đ`;
  }
  if (promo.discountPercent !== undefined && promo.discountPercent !== null && promo.discountPercent > 0) {
    return `${promo.discountPercent}%`;
  }
  if (promo.discountType === 'shipping') return 'Miễn phí vận chuyển';
  if (promo.discountType === 'free-shipping') return 'Miễn phí vận chuyển';
  if (promo.discountType === 'percent') return 'Phần trăm';
  if (promo.discountType === 'fixed') return 'Số tiền cố định';
  return '';
};

const getStatus = (promo) => {
  const now = new Date();
  const expiry = promo.endDate || promo.expiryDate || promo.expirationDate || promo.expiresAt || promo.expiry || promo.expireDate;
  const expiryDate = expiry ? new Date(expiry) : null;
  
  // Check if coupon is inactive
  if (promo.isActive === false) return 'expired';
  if (promo.status && String(promo.status).toLowerCase() === 'expired') return 'expired';
  if (promo.status && String(promo.status).toLowerCase() === 'used') return 'used';
  if (promo.used) return 'used';
  
  // Check if expired by date
  if (expiryDate && expiryDate < now) return 'expired';
  
  return 'unused';
};

const normalizePromotion = (promo) => {
  const status = getStatus(promo);
  const expiry = formatDate(promo.endDate || promo.expiryDate || promo.expirationDate || promo.expiresAt || promo.expiry || promo.expireDate);
  const discountText = getDiscountText(promo);
  const badge = promo.badge || (status === 'expired' ? 'Đã hết hạn' : 'Ưu đãi mới');

  // Generate title from code or discount info
  const title = promo.title 
    || promo.name 
    || promo.label 
    || promo.headline 
    || promo.subject 
    || promo.nameTitle 
    || `Mã ${promo.code || 'khuyến mãi'}`;
  
  // Generate description from discount type and value
  const description = promo.description 
    || promo.subtitle 
    || promo.summary 
    || promo.detailsText 
    || promo.body 
    || `Giảm ${discountText}${promo.minimumOrderValue ? ` cho đơn từ ${promo.minimumOrderValue.toLocaleString('vi-VN')}đ` : ''}`;
  
  const code = promo.code || promo.promoCode || promo.voucher || promo.discountCode || promo.coupon || promo.couponCode || '';

  const details = Array.isArray(promo.details)
    ? promo.details
    : promo.details
      ? [String(promo.details)]
      : [
          promo.minimumOrderValue && `Đơn hàng tối thiểu: ${promo.minimumOrderValue.toLocaleString('vi-VN')}đ`,
          promo.maxUsesPerUser && `Tối đa ${promo.maxUsesPerUser} lần/user`,
          promo.scope && `Áp dụng: ${promo.scope}`
        ].filter(Boolean);

  return {
    id: String(promo._id || promo.id || promo.code || code || `${title}-${code}`),
    title,
    description,
    code,
    discountText,
    expiry,
    status,
    badge,
    details,
    icon: promo.icon || promo.type || promo.discountType || 'percent'
  };
};

const listPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find({}).sort({ createdAt: -1 }).lean();
    const result = promotions.map(normalizePromotion);
    res.json({ promotions: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPromotions
};
