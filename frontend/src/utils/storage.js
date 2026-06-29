const USER_STORAGE_KEY = 'user';
const KNOWN_APP_KEYS = [
  'cart',
  'purchasedItems',
  'purchaseHistory',
  'usedPromotions',
  'selectedPromotion'
];

const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

export const getCurrentStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null');
  } catch (e) {
    return null;
  }
};

const getUserPrefix = () => {
  const user = getCurrentStoredUser();
  if (!user || typeof user !== 'object') return null;
  if (user.id != null && user.id !== '') return `user:${String(user.id).trim()}`;
  if (user.email) return `email:${String(user.email).trim().toLowerCase()}`;
  return null;
};

export const getStorageKey = (key) => {
  const prefix = getUserPrefix();
  return prefix ? `${key}:${prefix}` : key;
};

const clearGlobalAppStorage = () => {
  KNOWN_APP_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  });
};

export const getLocalStorage = (key, fallback = null) => {
  try {
    const prefix = getUserPrefix();
    if (prefix) {
      const namespacedKey = `${key}:${prefix}`;
      const value = localStorage.getItem(namespacedKey);
      return value !== null ? parseJson(value, fallback) : fallback;
    }
    const rawValue = localStorage.getItem(key);
    return parseJson(rawValue, fallback);
  } catch (e) {
    return fallback;
  }
};

export const setLocalStorage = (key, value) => {
  try {
    const namespacedKey = getStorageKey(key);
    localStorage.setItem(namespacedKey, JSON.stringify(value));
  } catch (e) {
    // ignore storage write errors
  }
};

export const removeLocalStorage = (key) => {
  try {
    const namespacedKey = getStorageKey(key);
    localStorage.removeItem(namespacedKey);
    localStorage.removeItem(key);
  } catch (e) {
    // ignore cleanup errors
  }
};

export const getGlobalLocalStorage = (key, fallback = null) => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue !== null ? parseJson(rawValue, fallback) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const setGlobalLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore storage write errors
  }
};

export const removeGlobalLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // ignore cleanup errors
  }
};

const isSameUser = (a, b) => {
  if (!a || !b) return false;
  if (a.id != null && b.id != null) return String(a.id) === String(b.id);
  if (a.email && b.email) return String(a.email).trim().toLowerCase() === String(b.email).trim().toLowerCase();
  return false;
};

export const clearAppStorageForCurrentUser = () => {
  KNOWN_APP_KEYS.forEach((key) => removeLocalStorage(key));
};

export const clearAppStorageWhenUserChanges = (newUser) => {
  const currentUser = getCurrentStoredUser();
  if (!currentUser) return;
  if (!isSameUser(currentUser, newUser)) {
    clearAppStorageForCurrentUser();
  }
};

export const hasPremiumAccess = () => {
  try {
    const purchasedItems = getLocalStorage('purchasedItems', []);
    if (Array.isArray(purchasedItems)) {
      for (const it of purchasedItems) {
        if (!it) continue;
        if (typeof it === 'string') {
          const value = it.trim().toLowerCase();
          if (value.includes('premium') || value.includes('membership')) return true;
          continue;
        }
        const t = String(it?.type || it?.packageType || '').toLowerCase();
        if (t === 'premium' || t === 'membership') return true;
        const title = String(it?.title || '').toLowerCase();
        if (title.includes('premium') || title.includes('membership')) return true;
      }
    }

    const history = getLocalStorage('purchaseHistory', []);
    if (Array.isArray(history)) {
      for (const order of history) {
        if (!order) continue;
        if (String(order?.packageType || '').toLowerCase() === 'premium') return true;
        if (String(order?.packageType || '').toLowerCase() === 'membership') return true;
        if (Array.isArray(order.items)) {
          for (const it of order.items) {
            if (!it) continue;
            const t = String(it?.type || it?.packageType || '').toLowerCase();
            if (t === 'premium' || t === 'membership') return true;
            const title = String(it?.title || '').toLowerCase();
            if (title.includes('premium') || title.includes('membership')) return true;
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return false;
};
