import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AcademicLayout from "../components/AcademicLayout.jsx";
import { api, getApiMessage, getAuthorizationHeader } from "../services/api.js";
import { getCurrentStoredUser, getGlobalLocalStorage, getLocalStorage, setLocalStorage, hasPremiumAccess } from '../utils/storage.js';
const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const compactNumberFormatter = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 });
const formatCurrency = (v) => currencyFormatter.format(v || 0);
const formatCompact = (v) => compactNumberFormatter.format(v || 0);

const HERO_IMAGE = "https://lh3.googleusercontent.com/aida/AP1WRLt_yxa7EhZw8Q8_LzPf2Kd3TfwRGdcEM1ofXKn5TzH6lkYPN67loyQDBE5-ccyTrxRTIpLhE0cGpSbXcY4bN91-pUqD6QEnB148gcwQT1btlP0x3LELmXLI8zOZS2jnlYW_mG4ubRAzUgH1DXAUQSQ5uuo9QqGvPYSAAhxfkHOmUU9IqJVBIPX7v-4CKDCRf9ZInKkiaFl4m05qmTkycwWzJbz4evU736fZvdBZI7ivWY2AqtONmvA0";
const PRODUCT_IMAGES = { full: HERO_IMAGE, listening: HERO_IMAGE, reading: HERO_IMAGE, vocabulary: HERO_IMAGE };

const getProductImage = (p) => {
  if (!p) return null;
  return p.image || p.imageUrl || p.image_url || p.thumbnail || p.thumb || p.cover || p.coverImage || null;
};

const getProductIcon = (product) => {
  if (!product) return 'bi-journal-bookmark';
  if (product.skill === 'listening') return 'bi-headphones';
  if (product.skill === 'reading') return 'bi-pencil-square';
  if (product.skill === 'vocabulary') return 'bi-layers';
  return 'bi-journal-bookmark';
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

function StatPill({ icon, label, value }) {
  return (
    <div className="stat-pill">
      <i className={`bi ${icon}`} aria-hidden="true" />
      <div className="stat-pill-body">
        <div className="stat-pill-value">{value}</div>
        <div className="stat-pill-label">{label}</div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [similar, setSimilar] = useState([]);
  const [recent, setRecent] = useState([]);
  const [notice, setNotice] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [productReviews, setProductReviews] = useState([]);

  const similarRef = useRef(null);
  const recentRef = useRef(null);

  const scrollContainer = (ref, dir = 1) => {
    if (!ref || !ref.current) return;
    const el = ref.current;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const targetLeft = Math.min(Math.max(el.scrollLeft + dir * Math.round(el.clientWidth * 0.9), 0), maxScrollLeft);
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  const isAuthenticated = !!localStorage.getItem("token");

  const loadProductReviews = () => {
    if (!product) {
      setProductReviews([]);
      return;
    }
    try {
      const stored = normalizeProductReviews(getGlobalLocalStorage('productReviews', {}));
      const reviewsForProduct = Array.isArray(stored[String(product.id)]) ? stored[String(product.id)] : [];
      setProductReviews(reviewsForProduct);
    } catch (e) {
      setProductReviews([]);
    }
  };

  useEffect(() => {
    loadProductReviews();
  }, [product]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError("");
        const resp = await api.get("/api/products", { params: { page: 1, limit: 999 } });
        const items = resp.data.items || [];
        const found = items.find((p) => String(p.id) === String(productId));

        if (!found) {
          setError("Sản phẩm không tìm thấy.");
          setProduct(null);
          setSimilar([]);
          return;
        }

        setProduct(found);

        const similarItems = items.filter((p) => p.type === found.type && p.id !== found.id).slice(0, 4);
        setSimilar(similarItems);

        // update recently viewed in localStorage
        try {
          const saved = getLocalStorage('recentlyViewed', []);
          const newList = [found, ...saved.filter((s) => s.id !== found.id)].slice(0, 8);
          setLocalStorage('recentlyViewed', newList);
          setRecent(newList);
        } catch (e) {
          // ignore
        }
      } catch (err) {
        setError(getApiMessage(err, 'Không thể tải thông tin sản phẩm.'));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [productId]);

  useEffect(() => {
    const checkFav = async () => {
      if (!isAuthenticated || !product) return setIsFavorited(false);
      try {
        const resp = await api.get('/api/favorites', { headers: { Authorization: getAuthorizationHeader() } });
        const ids = new Set((resp.data.items || []).map((p) => p.id));
        setIsFavorited(ids.has(product.id));
      } catch (err) {
        // ignore
      }
    };
    checkFav();
  }, [isAuthenticated, product]);

  const isPurchased = useMemo(() => {
    try {
      const purchased = getLocalStorage('purchasedItems', []);
      if (!Array.isArray(purchased)) return false;
      return purchased.map((id) => String(id || '').trim()).includes(String(productId || '').trim());
    } catch (e) {
      return false;
    }
  }, [productId]);

  const isPremiumUser = useMemo(() => (typeof window !== 'undefined' ? hasPremiumAccess() : false), []);

  const isExamOrVocab = useMemo(() => {
    return product && (product.type === 'exam' || product.type === 'vocabulary');
  }, [product]);

  const isSpecialToeic = useMemo(() => {
    if (!product || !product.title) return false;
    // Match titles containing 'Đề TOEIC 1' or 'Đề TOEIC 2' (case-insensitive)
    return /Đề\s*TOEIC\s*1|Đề\s*TOEIC\s*2/i.test(product.title);
  }, [product]);

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setNotice('Vui lòng đăng nhập để mua sản phẩm.');
      return;
    }

    if (isPurchased) {
      setNotice('Bạn đã mua sản phẩm này.');
      return;
    }

    // add to cart and go to cart
    try {
      const saved = getLocalStorage('cart', []);
      const idx = saved.findIndex((c) => String(c.id) === String(product.id));
      if (idx >= 0) {
        setNotice('Sản phẩm đã có trong giỏ hàng.');
        navigate('/cart');
        return;
      }
      const thumb = product.image || product.imageUrl || product.thumbnail || product.thumb || product.cover || '';
      saved.push({ id: product.id, title: product.title, price: product.price || 0, type: product.type || 'exam', thumbnail: thumb, tone: product.tone || 'blue', quantity: 1 });
      setLocalStorage('cart', saved);
      navigate('/cart');
    } catch (e) {
      setNotice('Không thể thêm vào giỏ hàng.');
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setNotice('Vui lòng đăng nhập để thêm vào giỏ hàng.');
      return;
    }

    if (isPurchased) {
      setNotice('Bạn đã mua sản phẩm này.');
      return;
    }

    try {
      const saved = getLocalStorage('cart', []);
      const idx = saved.findIndex((c) => String(c.id) === String(product.id));
      const thumb = product.image || product.imageUrl || product.thumbnail || product.thumb || product.cover || '';
      if (idx >= 0) {
        setNotice('Sản phẩm đã có trong giỏ hàng.');
        return;
      }

      saved.push({ id: product.id, title: product.title, price: product.price || 0, type: product.type || 'exam', thumbnail: thumb, tone: product.tone || 'blue', quantity: 1 });
      setLocalStorage('cart', saved);
      navigate('/cart');
    } catch (e) {
      setNotice('Không thể thêm vào giỏ hàng.');
    }
  };

  const handlePractice = () => {
    navigate('/exams');
  };

  const renderStars = (rating) => (
    <div className="comment-stars" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <i key={index} className={`bi ${index < rating ? 'bi-star-fill' : 'bi-star'}`} style={{ color: index < rating ? '#f59e0b' : '#cbd5e1' }} />
      ))}
    </div>
  );

  const formatRating = (value) => {
    if (value == null || Number.isNaN(Number(value))) return '0.0';
    return Number(value).toFixed(1);
  };

  const purchaseCount = useMemo(() => {
    if (!product) return 0;
    const rawSold = product.sold;
    if (rawSold != null && rawSold !== '' && !Number.isNaN(Number(rawSold))) {
      return Number(rawSold);
    }

    try {
      const history = getLocalStorage('purchaseHistory', []);
      if (!Array.isArray(history)) return 0;
      return history.reduce((count, order) => {
        if (!order || !Array.isArray(order.items)) return count;
        return count + order.items.filter((item) => String(item.id) === String(product.id)).length;
      }, 0);
    } catch (e) {
      return 0;
    }
  }, [product]);

  const reviewCount = useMemo(() => {
    return Array.isArray(productReviews) ? productReviews.length : 0;
  }, [productReviews]);

  const averageRating = useMemo(() => {
    if (!Array.isArray(productReviews) || productReviews.length === 0) return null;
    const sum = productReviews.reduce((total, review) => total + (Number(review.rating) || 0), 0);
    return Math.round((sum / productReviews.length) * 10) / 10;
  }, [productReviews]);

  if (loading) {
    return (
      <AcademicLayout>
        <div className="academic-panel">Đang tải...</div>
      </AcademicLayout>
    );
  }

  if (error) {
    return (
      <AcademicLayout>
        <div className="academic-panel"><div className="academic-alert">{error}</div></div>
      </AcademicLayout>
    );
  }

  if (!product) {
    return (
      <AcademicLayout>
        <div className="academic-panel">Không có sản phẩm được chọn.</div>
      </AcademicLayout>
    );
  }

  return (
    <AcademicLayout>
      <div className="product-detail">
        {notice && <div className="academic-alert">{notice}</div>}

        <div className="product-detail-top">
          <div className="product-left">
            <div className="product-image-wrap">
              <div className={`academic-product-image`}>
                <div className={`academic-product-art product-tone-${product.tone || 'blue'}`} aria-hidden>
                  <i className={`bi ${getProductIcon(product)}`} />
                </div>
                {getProductImage(product) ? (
                  <img src={getProductImage(product)} alt={product.title || product.name} loading="lazy" onError={(e) => { e.currentTarget.hidden = true; }} />
                ) : null}
              </div>
            </div>
            <div className="detail-stats">
              <StatPill icon="bi-people" label="Đã mua" value={formatCompact(purchaseCount)} />
              <StatPill icon="bi-chat-left" label="Bình luận" value={formatCompact(reviewCount)} />
              <StatPill icon="bi-star-fill" label="Điểm" value={averageRating != null ? formatRating(averageRating) : (product.rating || '0.0')} />
            </div>
          </div>

          <div className="product-right">
            <div className="breadcrumb"><Link to="/">Trang chủ</Link> • <Link to={`/exams`}>{product.type === 'vocabulary' ? 'Từ vựng' : 'Đề thi'}</Link> • <span>Chi tiết</span></div>

            <h1 className="product-title">{product.title}</h1>
            <p className="product-sub">{product.subtitle}</p>

            <div className="price-row">
              <div className="price-block">
                {(!isExamOrVocab && !isPremiumUser && !isSpecialToeic && !isPurchased) ? (
                  <>
                    <div className="price-current">{formatCurrency(product.price)}</div>
                    {product.originalPrice ? <div className="price-origin">{formatCurrency(product.originalPrice)}</div> : null}
                  </>
                ) : null}
              </div>

              {(() => {
                const statusText = isExamOrVocab ? (isPurchased ? 'Đã mua' : 'Miễn phí') : (isPurchased ? 'Đã mua' : (isSpecialToeic ? 'Miễn phí' : 'Chưa mua'));
                return <div className={`status-pill ${isPurchased ? 'purchased' : 'not-purchased'}`}>{statusText}</div>;
              })()}
            </div>

            <div className="product-actions">
              {isExamOrVocab ? (
                <>
                  <button className="btn btn-primary" onClick={handlePractice}>Luyện đề</button>
                  <button className={`btn btn-outline favorite ${isFavorited ? 'is-fav' : ''}`} onClick={async () => {
                    if (!isAuthenticated) { setNotice('Vui lòng đăng nhập để thêm yêu thích.'); return; }
                    try {
                      if (isFavorited) {
                        await api.delete(`/api/favorites/${encodeURIComponent(product.id)}`, { headers: { Authorization: getAuthorizationHeader() } });
                        setIsFavorited(false);
                      } else {
                        await api.post('/api/favorites', { productId: product.id }, { headers: { Authorization: getAuthorizationHeader() } });
                        setIsFavorited(true);
                      }
                    } catch (err) {
                      setNotice(getApiMessage(err, 'Không thể cập nhật yêu thích'));
                    }
                  }}> <i className={`bi ${isFavorited ? 'bi-heart-fill' : 'bi-heart'}`} /> {isFavorited ? 'Yêu thích' : 'Thêm yêu thích'}</button>
                </>
              ) : isPremiumUser ? (
                <button className="btn btn-primary" disabled>Miễn phí</button>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={handleBuyNow}>Mua ngay</button>
                  <button className="btn btn-outline" onClick={handleAddToCart}>Thêm giỏ hàng</button>
                  <button className={`btn btn-outline favorite ${isFavorited ? 'is-fav' : ''}`} onClick={async () => {
                    if (!isAuthenticated) { setNotice('Vui lòng đăng nhập để thêm yêu thích.'); return; }
                    try {
                      if (isFavorited) {
                        await api.delete(`/api/favorites/${encodeURIComponent(product.id)}`, { headers: { Authorization: getAuthorizationHeader() } });
                        setIsFavorited(false);
                      } else {
                        await api.post('/api/favorites', { productId: product.id }, { headers: { Authorization: getAuthorizationHeader() } });
                        setIsFavorited(true);
                      }
                    } catch (err) {
                      setNotice(getApiMessage(err, 'Không thể cập nhật yêu thích'));
                    }
                  }}> <i className={`bi ${isFavorited ? 'bi-heart-fill' : 'bi-heart'}`} /> {isFavorited ? 'Yêu thích' : 'Thêm yêu thích'}</button>
                </>
              )}
            </div>

            <div className="product-details">
              <h3>Mô tả</h3>
              <p>{product.subtitle || product.description || 'Không có mô tả chi tiết.'}</p>

              <h4>Danh mục</h4>
              <p>{product.categoryName} • {product.year}</p>
            </div>
          </div>
        </div>

        <section className="academic-section">
          <div className="academic-section-heading">
            <div><h3>Đề thi tương tự</h3></div>
            <div className="section-actions">
              <Link to={product.type === 'vocabulary' ? '/vocabulary' : '/exams'} className="link-button">Xem tất cả</Link>
            </div>
          </div>

          <div className="similar-wrap">
            <button type="button" className="scroll-btn left" onClick={() => scrollContainer(similarRef, -1)} aria-label="Scroll similar left"><i className="bi bi-chevron-left" /></button>
            <div className="similar-grid" ref={similarRef}>
              {similar.map((s) => {
                const purchasedList = getLocalStorage('purchasedItems', []);
                const purchasedSet = new Set(Array.isArray(purchasedList) ? purchasedList.map((id) => String(id)) : []);
                const sIsPurchased = purchasedSet.has(String(s.id));
                const sIsSpecialToeic = /Đề\s*TOEIC\s*1|Đề\s*TOEIC\s*2/i.test(s.title || '');
                const priceLabel = sIsPurchased ? 'Đã mua' : (isPremiumUser ? 'Miễn phí' : (sIsSpecialToeic ? 'Miễn phí' : formatCurrency(s.price)));
                return (
                  <Link to={s.type === 'vocabulary' ? `/vocabulary/${s.id}` : `/exams/${s.id}`} key={s.id} className="similar-card">
                    <div className="similar-thumb">
                          <div className={`academic-product-art product-tone-${s.tone || 'blue'}`} aria-hidden>
                            <i className={`bi ${getProductIcon(s)}`} />
                          </div>
                          {getProductImage(s) ? (
                            <img src={getProductImage(s)} alt={s.title} loading="lazy" onError={(e) => { e.currentTarget.hidden = true; }} />
                          ) : null}
                    </div>
                    <div className="similar-body">
                      <div className="similar-title">{s.title}</div>
                      <div className="similar-price">{priceLabel}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <button type="button" className="scroll-btn right" onClick={() => scrollContainer(similarRef, 1)} aria-label="Scroll similar right"><i className="bi bi-chevron-right" /></button>
          </div>
        </section>

        <section className="academic-section">
          <div className="academic-section-heading"><div><h3>Bình luận</h3></div></div>
          <div className="comment-area">
            {productReviews.length > 0 ? (
              <div className="review-summary-list" style={{ marginBottom: 20 }}>
                {productReviews.map((review, index) => (
                  <div key={`review-${index}`} className="review-summary-card" style={{ marginBottom: 16, background: '#f8fafc', borderRadius: 18, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#10233f', marginBottom: 8 }}>
                          {review.author && review.author !== (getCurrentStoredUser()?.name || getCurrentStoredUser()?.fullName || getCurrentStoredUser()?.email)
                            ? `Đánh giá của ${review.author}`
                            : 'Đánh giá của bạn'}
                        </div>
                        {renderStars(Number(review.rating || 0))}
                      </div>
                    </div>
                    <div style={{ marginTop: 16, color: '#334155', lineHeight: 1.7 }}>{review.comment}</div>
                    <div style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>
                      {review.author ? `${review.author} • ` : ''}{new Date(review.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="review-empty" style={{ padding: 24, borderRadius: 18, background: '#f8fafc', color: '#475569' }}>
                Chưa có bình luận cho sản phẩm này.
              </div>
            )}
          </div>
        </section>

        {recent && recent.length > 0 && (
          <section className="academic-section">
            <div className="academic-section-heading"><div><h3>Đề thi đã xem gần đây</h3></div></div>

            <div className="recent-wrap">
              <button type="button" className="scroll-btn left" onClick={() => scrollContainer(recentRef, -1)} aria-label="Scroll recent left"><i className="bi bi-chevron-left" /></button>
              <div className="recent-list" ref={recentRef}>
                {recent.map((r) => (
                  <Link to={r.type === 'vocabulary' ? `/vocabulary/${r.id}` : `/exams/${r.id}`} key={`recent-${r.id}`} className="recent-item">
                    <div className="recent-thumb-img">
                      <div className={`academic-product-art product-tone-${r.tone || 'blue'}`} aria-hidden>
                        <i className={`bi ${getProductIcon(r)}`} />
                      </div>
                      {getProductImage(r) ? (
                        <img src={getProductImage(r)} alt={r.title} loading="lazy" onError={(e) => { e.currentTarget.hidden = true; }} />
                      ) : null}
                    </div>
                    <div className="recent-title">{r.title}</div>
                  </Link>
                ))}
              </div>
              <button type="button" className="scroll-btn right" onClick={() => scrollContainer(recentRef, 1)} aria-label="Scroll recent right"><i className="bi bi-chevron-right" /></button>
            </div>
          </section>
        )}
      </div>
    </AcademicLayout>
  );
}
