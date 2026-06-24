import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AcademicLayout from '../components/AcademicLayout.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { api, getApiMessage, getAuthorizationHeader } from '../services/api.js';

export default function Favorites() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth || {});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let canceled = false;
    const fetchFavs = async () => {
      if (!isAuthenticated) { navigate('/login'); return; }
      try {
        setLoading(true);
        const resp = await api.get('/api/favorites', { headers: { Authorization: getAuthorizationHeader() } });
        if (!canceled) setItems(resp.data.items || []);
      } catch (err) {
        if (!canceled) setError(getApiMessage(err, 'Không thể tải yêu thích'));
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    fetchFavs();
    return () => { canceled = true; };
  }, [isAuthenticated]);

  const handleToggleFavorite = async (product) => {
    // remove favorite
    try {
      await api.delete(`/api/favorites/${encodeURIComponent(product.id)}`, { headers: { Authorization: getAuthorizationHeader() } });
      setItems((cur) => cur.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(getApiMessage(err, 'Không thể cập nhật yêu thích'));
    }
  };

  return (
    <AcademicLayout>
      <div>
        <div className="academic-panel"><h2>Yêu thích</h2></div>

        {error && <div className="academic-alert">{error}</div>}

        <div className="academic-section">
          <div className="academic-section-heading"><div><h3>Sản phẩm bạn đã yêu thích</h3></div></div>
          {loading ? (
            <div className="academic-carousel hide-scrollbar" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => <div className="academic-product-card academic-skeleton" key={i} />)}
            </div>
          ) : (
            <div className="academic-all-products">
              {items.map((p) => <ProductCard product={p} isFavorited onToggleFavorite={handleToggleFavorite} key={p.id} />)}
            </div>
          )}
        </div>
      </div>
    </AcademicLayout>
  );
}
