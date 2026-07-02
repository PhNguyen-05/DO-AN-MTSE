import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AcademicLayout from '../components/AcademicLayout.jsx';
import { api, getAuthorizationHeader } from '../services/api.js';
import { examApi } from '../services/userApi.js';
import { getCurrentStoredUser, getGlobalLocalStorage, setGlobalLocalStorage, getLocalStorage, hasPremiumAccess } from '../utils/storage.js';
import { isFreeToeicExam } from '../utils/product.js';
import '../styles/review.css';

const starLabels = ['Rất tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'];

const formatDate = (value) => {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const isReviewByUser = (review, user) => {
  if (!review || !user) return false;
  if (review.userId != null && user.id != null) return String(review.userId) === String(user.id);
  const author = String(review.author || '').trim();
  if (!author) return false;
  const names = [user.name, user.fullName, user.email]
    .filter(Boolean)
    .map((value) => String(value).trim());
  return names.some((name) => name && name === author);
};

const normalizeProductReviews = (reviews) => {
  if (!reviews || typeof reviews !== 'object') return {};
  return Object.entries(reviews).reduce((result, [productId, value]) => {
    if (Array.isArray(value)) {
      result[productId] = value;
    } else if (value && typeof value === 'object') {
      result[productId] = [value];
    }
    return result;
  }, {});
};

const getCurrentUserReviews = (globalReviews, user) => {
  const currentUserReviews = {};
  if (!user || !globalReviews || typeof globalReviews !== 'object') return currentUserReviews;
  Object.entries(globalReviews).forEach(([productId, reviewList]) => {
    const list = Array.isArray(reviewList) ? reviewList : [reviewList];
    const userReview = list.find((review) => isReviewByUser(review, user));
    if (userReview) currentUserReviews[productId] = userReview;
  });
  return currentUserReviews;
};

const normalizePurchasedId = (value) => {
  if (!value) return '';
  const raw = String(value).trim();
  const tokens = raw.split('-');
  const validPackageTypes = ['bundle', 'listening', 'reading', 'vocabulary', 'premium'];
  const lastToken = tokens[tokens.length - 1];
  if (tokens.length > 1 && validPackageTypes.includes(lastToken)) {
    return tokens.slice(0, -1).join('-');
  }
  return raw;
};

const isFreeExamProduct = (product) => {
  if (!product) return false;
  if (product.accessType === 'free') return true;
  if (Number(product.price || product.priceValue || 0) === 0) return true;
  if (product.priceBundle != null || product.priceListening != null || product.priceReading != null) {
    return Number(product.priceBundle || 0) === 0 && Number(product.priceListening || 0) === 0 && Number(product.priceReading || 0) === 0;
  }
  return isFreeToeicExam(product);
};

const getReviewableItemId = (item) => {
  if (!item) return '';
  return String(item.id || item.examId || item.exam || item._id || '').trim();
};

export default function ProductReview() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [examList, setExamList] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [reviews, setReviews] = useState({});
  const [globalReviews, setGlobalReviews] = useState({});
  const [notice, setNotice] = useState('');
  const [isPremiumUser, setIsPremiumUser] = useState(() => hasPremiumAccess());

  useEffect(() => {
    try {
      const storedHistory = getLocalStorage('purchaseHistory', []);
      setHistory(Array.isArray(storedHistory) ? storedHistory : []);
    } catch (e) {
      setHistory([]);
    }

    try {
      const storedPurchased = getLocalStorage('purchasedItems', []);
      setPurchasedIds(Array.isArray(storedPurchased) ? storedPurchased.map((id) => String(id || '').trim()) : []);
    } catch (e) {
      setPurchasedIds([]);
    }

    try {
      const storedReviews = getGlobalLocalStorage('productReviews', {});
      const normalizedReviews = normalizeProductReviews(storedReviews);
      setGlobalReviews(normalizedReviews);
      setReviews(getCurrentUserReviews(normalizedReviews, getCurrentStoredUser()));
    } catch (e) {
      setGlobalReviews({});
      setReviews({});
    }

    const checkPremiumStatus = async () => {
      if (hasPremiumAccess()) {
        setIsPremiumUser(true);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/premium-status', {
          headers: { Authorization: getAuthorizationHeader() }
        });

        if (response.ok) {
          const data = await response.json();
          setIsPremiumUser(!!data.isPremium);
        }
      } catch (_) {
        // ignore
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products', { params: { page: 1, limit: 999 } });
        const items = response.data.items || [];
        const map = {};
        items.forEach((item) => {
          if (item && item.id != null) map[String(item.id)] = item;
        });
        setProductMap(map);
      } catch (_) {
        // ignore
      }
    };

    // Lấy danh sách đề thi (bao gồm accessType và canAccess)
    const fetchExamList = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const data = await examApi.getExams();
        if (Array.isArray(data)) {
          setExamList(data);
        }
      } catch (_) {
        // ignore nếu chưa đăng nhập
      }
    };

    const fetchPurchaseState = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [historyResp, purchasedResp] = await Promise.all([
          api.get('/api/purchase-history', { headers: { Authorization: getAuthorizationHeader() } }),
          api.get('/api/purchase/purchased-items', { headers: { Authorization: getAuthorizationHeader() } })
        ]);

        const apiHistory = Array.isArray(historyResp.data?.history) ? historyResp.data.history : [];
        const apiPurchased = Array.isArray(purchasedResp.data?.purchasedItems) ? purchasedResp.data.purchasedItems : [];

        if (apiHistory.length > 0) {
          setHistory(apiHistory);
        }
        if (apiPurchased.length > 0) {
          setPurchasedIds(apiPurchased.map(normalizePurchasedId));
        }
      } catch (_) {
        // ignore
      }
    };

    checkPremiumStatus();
    fetchProducts();
    fetchExamList();
    fetchPurchaseState();
  }, []);

  const purchasedItems = useMemo(() => {
    return history.flatMap((order) => Array.isArray(order.items) ? order.items : []);
  }, [history]);

  const premiumPurchasedIds = useMemo(() => {
    const ids = new Set();
    history.forEach((order) => {
      if (!order || !Array.isArray(order.items)) return;
      order.items.forEach((item) => {
        const id = String(item?.id || item?.examId || '').trim();
        if (!id) return;
        const type = String(item?.type || '').toLowerCase();
        const title = String(item?.title || '').toLowerCase();
        if (type === 'premium' || title.includes('premium')) {
          ids.add(id);
        }
      });
    });
    return ids;
  }, [history]);

  const uniqueItems = useMemo(() => {
    const map = new Map();

    // 1. Thêm đề miễn phí và đề có quyền truy cập từ exam list API
    examList.forEach((exam) => {
      const id = String(exam._id || '');
      if (!id) return;
      const isFree = exam.accessType === 'free';
      const hasPurchasedAccess = exam.canAccess && !isFree;

      if (isFree || hasPurchasedAccess || isPremiumUser) {
        map.set(id, {
          id,
          _id: exam._id,
          title: exam.name || 'Đề thi',
          subtitle: exam.skill || '',
          type: 'exam',
          accessType: exam.accessType,
          canAccess: exam.canAccess,
          isFree
        });
      }
    });

    // 2. Thêm sản phẩm từ product catalog (vocabulary, v.v.)
    if (isPremiumUser) {
      Object.values(productMap).forEach((product) => {
        if (!product?.id) return;
        if (product.type === 'vocabulary') return; // bỏ qua vocab
        const key = String(product.id);
        if (!map.has(key)) map.set(key, { ...product, isFree: isFreeExamProduct(product) });
      });
    }

    Object.values(productMap).forEach((product) => {
      if (!product?.id) return;
      if (product.type === 'vocabulary') return;
      if (isFreeExamProduct(product)) {
        const key = String(product.id);
        if (!map.has(key)) map.set(key, { ...product, isFree: true });
      }
    });

    // 3. Thêm sản phẩm từ lịch sử mua hàng
    purchasedItems.forEach((item) => {
      const itemId = getReviewableItemId(item);
      if (!itemId) return;
      const key = String(itemId);
      if (premiumPurchasedIds.has(key)) return;
      if (String(item.type || '').toLowerCase() === 'premium') return;
      if (!map.has(key)) {
        map.set(key, productMap[key] || {
          id: key,
          title: item.title || 'Đề thi đã mua',
          type: item.type || 'exam',
          isFree: false
        });
      }
    });

    // 4. Thêm từ purchasedIds nếu còn thiếu
    purchasedIds.forEach((id) => {
      const key = normalizePurchasedId(id);
      if (!key || premiumPurchasedIds.has(key)) return;
      if (key.toLowerCase().includes('premium') || key.toLowerCase().includes('membership')) return;
      if (!map.has(key)) {
        map.set(key, productMap[key] || { id: key, title: 'Đề thi đã mua', type: 'exam', isFree: false });
      }
    });

    return Array.from(map.values());
  }, [isPremiumUser, examList, productMap, purchasedItems, purchasedIds, premiumPurchasedIds]);

  const handleStarChange = (productId, value) => {
    setDrafts((prev) => ({
      ...prev,
      [productId]: {
        rating: value,
        comment: prev[productId]?.comment || ''
      }
    }));
  };

  const handleCommentChange = (productId, value) => {
    setDrafts((prev) => ({
      ...prev,
      [productId]: {
        rating: prev[productId]?.rating || 0,
        comment: value
      }
    }));
  };

  const handleSubmitReview = async (item) => {
    const draft = drafts[item.id] || { rating: 0, comment: '' };
    if (!draft.rating) {
      setNotice('Vui lòng chọn số sao trước khi gửi đánh giá.');
      return;
    }
    if (!draft.comment.trim()) {
      setNotice('Vui lòng nhập nhận xét của bạn.');
      return;
    }

    const currentUser = getCurrentStoredUser();
    const currentUserName = currentUser?.name || currentUser?.fullName || currentUser?.email || 'Người dùng';
    const nextReview = {
      rating: draft.rating,
      comment: draft.comment.trim(),
      date: new Date().toISOString(),
      author: currentUserName,
      userId: currentUser?.id ?? null
    };

    const existingReviews = Array.isArray(globalReviews[item.id])
      ? globalReviews[item.id]
      : globalReviews[item.id] && typeof globalReviews[item.id] === 'object'
        ? [globalReviews[item.id]]
        : [];
    const nextGlobalReviews = {
      ...globalReviews,
      [item.id]: [...existingReviews, nextReview]
    };

    setReviews((prev) => ({
      ...prev,
      [item.id]: nextReview
    }));
    setGlobalReviews(nextGlobalReviews);
    setGlobalLocalStorage('productReviews', nextGlobalReviews);

    // Attempt to persist to backend as well
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const targetType = item.skill === 'vocabulary' ? 'Bài viết' : 'Đề thi';
        await api.post(
          `/api/products/${encodeURIComponent(item.id)}/reviews`,
          {
            content: draft.comment.trim(),
            ratingStars: draft.rating,
            targetType
          },
          { headers: { Authorization: getAuthorizationHeader() } }
        );
      }
    } catch (_) {
      // Backend save failed — localStorage already saved, so no action needed
    }

    setNotice('Đã gửi đánh giá. Cảm ơn bạn!');
  };

  const allReviewed = uniqueItems.every((item) => reviews[item.id]);

  return (
    <AcademicLayout>
      <div className="product-review-page" style={{ padding: '24px 0' }}>
        <div className="review-page-header" style={{ marginBottom: 24 }}>
          <button type="button" className="back-button" onClick={() => navigate(-1)} style={{ border: 0, background: 'transparent', color: '#334155', cursor: 'pointer', marginBottom: 18 }}>
            <i className="bi bi-arrow-left" style={{ marginRight: 8 }} /> Quay lại
          </button>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#10233f' }}>Đánh giá sản phẩm của bạn</h1>
          <p style={{ margin: '12px 0 0', color: '#475569', maxWidth: 720 }}>
            Chia sẻ trải nghiệm học tập của bạn để chúng tôi cải thiện chất lượng các khóa học TOEIC.
            {isPremiumUser ? ' Gói Premium của bạn cho phép đánh giá tất cả đề thi.' : ''}
          </p>
        </div>

        {notice && <div className="academic-alert" style={{ marginBottom: 20 }}>{notice}</div>}

        {uniqueItems.length === 0 ? (
          <div className="academic-panel" style={{ padding: 32, textAlign: 'center' }}>
            <h3>Chưa có sản phẩm để đánh giá</h3>
            <p>Hãy thử các đề thi miễn phí hoặc mua đề thi để có thể đánh giá.</p>
          </div>
        ) : (
          <div className="review-list">
            {uniqueItems.map((item) => {
              const savedReview = reviews[item.id];
              const draft = drafts[item.id] || { rating: savedReview?.rating || 0, comment: savedReview?.comment || '' };
              const isFreeItem = item.isFree || item.accessType === 'free';
              const isPurchasedItem = !isFreeItem && item.canAccess;

              return (
                <div className="review-card" key={item.id}>
                  <div className="review-card-top">
                    <div>
                      <h3>{item.title}</h3>
                      <p className="review-card-subtitle">
                        {item.subtitle || item.type || 'Đề thi'}{item.type ? ` • ${item.type}` : ''}
                      </p>
                    </div>
                    {/* Badge trạng thái */}
                    <span
                      style={{
                        padding: '5px 14px',
                        borderRadius: 999,
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        background: isFreeItem ? '#ecfdf5' : (isPurchasedItem ? '#eff6ff' : '#f8fafc'),
                        color: isFreeItem ? '#166534' : (isPurchasedItem ? '#1d4ed8' : '#64748b'),
                        border: `1px solid ${isFreeItem ? '#bbf7d0' : (isPurchasedItem ? '#bfdbfe' : '#e2e8f0')}`,
                        whiteSpace: 'nowrap',
                        alignSelf: 'flex-start'
                      }}
                    >
                      {isFreeItem ? '✓ Miễn phí' : isPurchasedItem ? '✓ Đã mua' : 'Đề thi'}
                    </span>
                  </div>

                  <div className="review-card-body">
                    <div className="review-stars">
                      <span className="review-stars-label">
                        {savedReview ? (
                          (savedReview.author && savedReview.author !== (getCurrentStoredUser()?.name || getCurrentStoredUser()?.fullName || getCurrentStoredUser()?.email))
                            ? `Đánh giá của ${savedReview.author}`
                            : 'Đánh giá của bạn'
                        ) : 'Đánh giá của bạn:'}
                      </span>
                      <div className="review-stars-input">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            className={`star-button ${value <= (draft.rating || 0) ? 'active' : ''}`}
                            onClick={() => handleStarChange(item.id, value)}
                            disabled={Boolean(savedReview)}
                            aria-label={`${value} sao`}
                          >
                            <i className="bi bi-star-fill" />
                          </button>
                        ))}
                      </div>
                      <div className="review-stars-hint">{starLabels[(draft.rating || 1) - 1] || 'Chưa chọn'}</div>
                    </div>

                    {savedReview ? (
                      <div className="review-saved">
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>
                          {(() => {
                            const currentUser = getCurrentStoredUser();
                            const currentUserName = currentUser?.name || currentUser?.fullName || currentUser?.email || '';
                            return savedReview.author && savedReview.author !== currentUserName
                              ? `Đánh giá của ${savedReview.author}`
                              : 'Đánh giá của bạn';
                          })()}
                        </div>
                        <div className="review-saved-score"><strong>{savedReview.rating}</strong> sao</div>
                        <div className="review-saved-comment">{savedReview.comment}</div>
                        <div className="review-saved-date">{savedReview.author ? `${savedReview.author} • ` : ''}{formatDate(savedReview.date)}</div>
                      </div>
                    ) : (
                      <>
                        <textarea
                          className="review-comment-input"
                          placeholder="Nhập nhận xét của bạn về sản phẩm này..."
                          value={draft.comment}
                          onChange={(e) => handleCommentChange(item.id, e.target.value)}
                          rows={4}
                        />
                        <div className="review-actions">
                          <button type="button" className="btn btn-primary" onClick={() => handleSubmitReview(item)}>
                            Gửi đánh giá
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {allReviewed && uniqueItems.length > 0 ? (
          <div className="review-summary-note">Cảm ơn bạn đã đánh giá tất cả sản phẩm. Nhận xét của bạn giúp cải thiện chất lượng khóa học.</div>
        ) : null}
      </div>
    </AcademicLayout>
  );
}
