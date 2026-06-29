export const isFreeToeicExam = (product) => {
  if (!product?.title) return false;
  return /Đề\s*TOEIC\s*1|Đề\s*TOEIC\s*2/i.test(String(product.title).trim());
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
