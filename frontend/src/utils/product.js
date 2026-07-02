// Chỉ "Đề TOEIC 1 năm 2023" và "Đề TOEIC 2 năm 2023" là miễn phí
export const isFreeToeicExam = (product) => {
  if (!product) return false;
  if (product.accessType === 'free') return true;
  if (product.title) {
    const title = String(product.title).trim();
    return /Đề\s*TOEIC\s*[12]\s*(năm\s*)?2023/i.test(title);
  }
  return false;
};

export const getProductPriceLabel = ({ product, isPurchased = false, isPremiumUser = false, formatCurrency }) => {
  if (isFreeToeicExam(product)) return 'Miễn phí';
  if (isPurchased) return 'Đã mua';
  if (isPremiumUser) return 'Miễn phí';
  const price = product?.priceBundle ?? product?.price ?? 0;
  return formatCurrency(price);
};

export const canPracticeProduct = ({ product, isPurchased = false, isPremiumUser = false }) => (
  isFreeToeicExam(product) || isPurchased || isPremiumUser
);
