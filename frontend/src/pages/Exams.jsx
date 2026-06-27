import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AcademicLayout from '../components/AcademicLayout.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { api, getApiMessage, getAuthorizationHeader } from '../services/api.js';import { getLocalStorage, setLocalStorage } from '../utils/storage.js';
export default function Exams() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth || {});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const fetchFavs = async () => {
      if (!isAuthenticated) { setFavoriteIds(new Set()); return; }
      try {
        const resp = await api.get('/api/favorites', { headers: { Authorization: getAuthorizationHeader() } });
        const ids = new Set((resp.data.items || []).map((p) => p.id));
        setFavoriteIds(ids);
      } catch (err) {
        // ignore
      }
    };
    fetchFavs();
  }, [isAuthenticated]);

  useEffect(() => {
    let canceled = false;
    const fetch = async () => {
      try {
        setLoading(true);
        const resp = await api.get('/api/products', { params: { type: 'exam', page: 1, limit: 999 } });
        if (!canceled) setItems(resp.data.items || []);
      } catch (err) {
        if (!canceled) setError(getApiMessage(err, 'Không thể tải đề thi'));
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    fetch();
    return () => { canceled = true; };
  }, []);

  const handleProductAction = (product) => {
    if (!isAuthenticated) { setNotice('Vui lòng đăng nhập để thêm vào giỏ hàng.'); return; }
    try {
      const purchased = getLocalStorage('purchasedItems', []);
      const normalizedPurchased = Array.isArray(purchased) ? purchased.map((id) => String(id || '').trim()) : [];
      if (normalizedPurchased.includes(String(product.id || '').trim())) {
        setNotice('Bạn đã mua sản phẩm này.');
        return;
      }
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

  const handleToggleFavorite = async (product) => {
    if (!isAuthenticated) { setNotice('Vui lòng đăng nhập để thêm yêu thích.'); return; }
    const id = product.id;
    try {
      if (favoriteIds.has(id)) {
        await api.delete(`/api/favorites/${encodeURIComponent(id)}`, { headers: { Authorization: getAuthorizationHeader() } });
        setFavoriteIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      } else {
        await api.post('/api/favorites', { productId: id }, { headers: { Authorization: getAuthorizationHeader() } });
        setFavoriteIds((prev) => new Set(prev).add(id));
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <AcademicLayout>
      <div>
        <div className="academic-panel">
          <h2>Đề thi</h2>
        </div>

        {error && <div className="academic-alert">{error}</div>}
        {notice && <div className="academic-success">{notice}</div>}

        <div className="academic-section">
          <div className="academic-section-heading"><div><h3>Tất cả đề thi</h3></div></div>
          {loading ? (
            <div className="academic-carousel hide-scrollbar" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => <div className="academic-product-card academic-skeleton" key={i} />)}
            </div>
          ) : (
            <div className="academic-all-products">
              {items.map((p) => <ProductCard product={p} onAction={handleProductAction} isFavorited={favoriteIds.has(p.id)} onToggleFavorite={handleToggleFavorite} key={p.id} />)}
            </div>
          )}
        </div>
      </div>
    </AcademicLayout>
  );
}
