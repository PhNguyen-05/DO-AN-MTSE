import { getLocalStorage, setLocalStorage } from './storage.js';
import { getAuthorizationHeader } from '../services/api.js';

const VALID_PACKAGE_TYPES = new Set(['bundle', 'listening', 'reading', 'vocabulary']);

export const parseProductRef = (productId, packageType = 'bundle') => {
  const raw = String(productId || '').trim();
  const tokens = raw.split('-');

  if (tokens.length >= 2) {
    const maybePackage = tokens[tokens.length - 1];
    if (VALID_PACKAGE_TYPES.has(maybePackage)) {
      return {
        productId: raw,
        examId: tokens.slice(0, -1).join('-'),
        packageType: maybePackage
      };
    }
  }

  const pkg = String(packageType || 'bundle').trim();
  return {
    productId: `${raw}-${pkg}`,
    examId: raw,
    packageType: pkg
  };
};

export const getPurchaseKey = (productId, packageType = 'bundle') => {
  const ref = parseProductRef(productId, packageType);
  return `${ref.examId}-${ref.packageType}`;
};

export const resolvePackageType = (product) => {
  if (!product) return 'bundle';
  if (product.packageType) return product.packageType;
  if (product.type === 'vocabulary') return 'vocabulary';
  return 'bundle';
};

export const isProductInPurchasedList = (purchasedItems, productId, packageType = 'bundle') => {
  if (!Array.isArray(purchasedItems) || productId == null || productId === '') return false;

  const ref = parseProductRef(productId, packageType);
  const key = getPurchaseKey(ref.examId, ref.packageType);
  const normalized = purchasedItems.map((item) => String(item || '').trim());

  if (normalized.includes(key)) return true;
  if (normalized.includes(ref.productId)) return true;
  if (normalized.includes(ref.examId)) return true;
  return normalized.some((item) => item.startsWith(`${ref.examId}-`));
};

export const fetchUserPurchasedItems = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return getLocalStorage('purchasedItems', []);
  }

  try {
    const response = await fetch('/api/purchase/purchased-items', {
      headers: { Authorization: getAuthorizationHeader() }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.purchasedItems)) {
        setLocalStorage('purchasedItems', data.purchasedItems);
        return data.purchasedItems;
      }
    }
  } catch (error) {
    console.error('Error fetching purchased items:', error);
  }

  return getLocalStorage('purchasedItems', []);
};

export const checkProductPurchased = async (productId, packageType = 'bundle') => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  const ref = parseProductRef(productId, packageType);

  try {
    const params = new URLSearchParams({
      examId: ref.examId,
      packageType: ref.packageType
    });
    const response = await fetch(`/api/purchase/check-purchase?${params.toString()}`, {
      headers: { Authorization: getAuthorizationHeader() }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return !!data.isPurchased;
      }
    }
  } catch (error) {
    console.error('Error checking purchase status:', error);
  }

  const purchasedItems = await fetchUserPurchasedItems();
  return isProductInPurchasedList(purchasedItems, productId, packageType);
};

export const hasPremiumInPurchasedList = (purchasedItems) => {
  if (!Array.isArray(purchasedItems)) return false;
  return purchasedItems.some((item) => {
    if (!item) return false;
    if (typeof item === 'object') {
      const t = String(item?.type || item?.packageType || '').trim().toLowerCase();
      if (t === 'premium' || t === 'membership') return true;
      const title = String(item?.title || '').trim().toLowerCase();
      if (title.includes('premium') || title.includes('membership')) return true;
    }
    const value = String(item).trim().toLowerCase();
    return value === 'premium' || value.endsWith('-premium') || value.includes('premium');
  });
};

export const mergePurchasedItemsLocal = (cartItems = []) => {
  const purchased = getLocalStorage('purchasedItems', []);
  const purchasedIds = Array.isArray(purchased) ? purchased.map((id) => String(id || '').trim()) : [];
  const newKeys = (cartItems || []).map((item) => {
    if (item?.type === 'premium' || item?.packageType === 'premium') {
      return 'premium';
    }
    const pkg = item.packageType || (item.type === 'vocabulary' ? 'vocabulary' : 'bundle');
    return getPurchaseKey(item.id, pkg);
  });
  const merged = Array.from(new Set([...purchasedIds, ...newKeys]));
  setLocalStorage('purchasedItems', merged);
  return merged;
};

export const notifyPurchaseUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('purchase:updated'));
  }
};

export const isCartItemPurchased = (purchasedItems, cartItem) => {
  if (cartItem?.type === 'premium' || cartItem?.packageType === 'premium') {
    return hasPremiumInPurchasedList(purchasedItems);
  }
  const packageType = cartItem?.packageType || (cartItem?.type === 'vocabulary' ? 'vocabulary' : 'bundle');
  return isProductInPurchasedList(purchasedItems, cartItem?.id, packageType);
};
