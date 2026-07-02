export const isFreeToeicExam = (product) => {
  if (!product) return false;
  const price = product.price ?? product.priceBundle ?? null;
  if (price !== null && Number(price) === 0) return true;
  if (product.accessType === 'free') return true;
  if (product.title) {
    if (price !== null && Number(price) > 0) return false;
    return /Đề\s*TOEIC\s*1|Đề\s*TOEIC\s*2/i.test(String(product.title).trim());
  }
  return false;
};

export const getProductPriceLabel = ({ product, isPurchased = false, isPremiumUser = false, formatCurrency }) => {
  if (isFreeToeicExam(product)) return 'Miễn phí';
  if (isPurchased) return 'Đã mua';
  if (isPremiumUser) return 'Miễn phí';
  return formatCurrency(product?.price || 0);
};

export const canPracticeProduct = ({ product, isPurchased = false, isPremiumUser = false }) => (
  isFreeToeicExam(product) || isPurchased || isPremiumUser
);
