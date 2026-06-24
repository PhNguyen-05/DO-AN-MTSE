import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AcademicLayout from "../components/AcademicLayout.jsx";
import { api, getApiMessage, getAuthorizationHeader } from "../services/api.js";

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
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  const similarRef = useRef(null);
  const recentRef = useRef(null);

  const scrollContainer = (ref, dir = 1) => {
    if (!ref || !ref.current) return;
    const el = ref.current;
    const scrollAmount = Math.max(el.clientWidth * 0.9, 240);
    el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  };

  const isAuthenticated = !!localStorage.getItem("token");

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
        setComments(Array.from({ length: Math.min(3, found.reviews || 0) }).map((_, i) => ({ id: `c-${i}`, author: `Người dùng ${i+1}`, text: 'Bình luận mẫu', date: new Date().toISOString() })));

        const similarItems = items.filter((p) => p.type === found.type && p.id !== found.id).slice(0, 4);
        setSimilar(similarItems);

        // update recently viewed in localStorage
        try {
          const saved = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
          const newList = [found, ...saved.filter((s) => s.id !== found.id)].slice(0, 8);
          localStorage.setItem('recentlyViewed', JSON.stringify(newList));
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
      const purchased = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
      return purchased.includes(productId);
    } catch (e) {
      return false;
    }
  }, [productId]);

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setNotice('Vui lòng đăng nhập để mua sản phẩm.');
      return;
    }

    // Placeholder: navigate to cart
    navigate('/cart');
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setNotice('Vui lòng đăng nhập để thêm vào giỏ hàng.');
      return;
    }

    // Placeholder cart logic
    setNotice('Đã thêm vào giỏ hàng (giả lập).');
  };

  const handlePractice = () => {
    navigate('/exams');
  };

  const handleSendComment = () => {
    if (!isAuthenticated) {
      setNotice('Vui lòng đăng nhập để bình luận.');
      return;
    }

    if (!commentText.trim()) return;
    const c = { id: `c-${Date.now()}`, author: 'Bạn', text: commentText.trim(), date: new Date().toISOString() };
    setComments((s) => [c, ...s]);
    setCommentText('');
    setNotice('Bình luận đã gửi.');
  };

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
              <StatPill icon="bi-people" label="Đã mua" value={formatCompact(product.sold || 0)} />
              <StatPill icon="bi-chat-left" label="Bình luận" value={product.reviews || 0} />
              <StatPill icon="bi-star-fill" label="Điểm" value={product.rating || 0} />
            </div>
          </div>

          <div className="product-right">
            <div className="breadcrumb"><Link to="/">Trang chủ</Link> • <Link to={`/exams`}>{product.type === 'vocabulary' ? 'Từ vựng' : 'Đề thi'}</Link> • <span>Chi tiết</span></div>

            <h1 className="product-title">{product.title}</h1>
            <p className="product-sub">{product.subtitle}</p>

            <div className="price-row">
              <div className="price-block">
                <div className="price-current">{formatCurrency(product.price)}</div>
                {product.originalPrice ? <div className="price-origin">{formatCurrency(product.originalPrice)}</div> : null}
              </div>

              <div className={`status-pill ${isPurchased ? 'purchased' : 'not-purchased'}`}>{isPurchased ? 'Đã mua' : 'Chưa mua'}</div>
            </div>

            <div className="product-actions">
              {isPurchased ? (
                <button className="btn btn-primary" onClick={handlePractice}>Luyện đề</button>
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
              {similar.map((s) => (
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
                    <div className="similar-price">{formatCurrency(s.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
            <button type="button" className="scroll-btn right" onClick={() => scrollContainer(similarRef, 1)} aria-label="Scroll similar right"><i className="bi bi-chevron-right" /></button>
          </div>
        </section>

        <section className="academic-section">
          <div className="academic-section-heading"><div><h3>Bình luận</h3></div></div>
          <div className="comment-area">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Viết bình luận công khai..." />
              <div style={{ marginTop: 6 }}>
                <button className="btn btn-primary" onClick={handleSendComment}>Gửi</button>
              </div>
            </div>

            <ul className="comment-list">
              {comments.map((c) => (
                <li key={c.id} className="comment-item">
                  <div className="comment-avatar">{(c.author || 'A').slice(0,1)}</div>
                  <div className="comment-body">
                    <div className="comment-head"><strong>{c.author}</strong><span className="comment-date">{new Date(c.date).toLocaleString('vi-VN')}</span></div>
                    <div className="comment-text">{c.text}</div>
                  </div>
                </li>
              ))}
            </ul>
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
