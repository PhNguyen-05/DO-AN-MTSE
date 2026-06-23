import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AcademicLayout from '../components/AcademicLayout.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { api, getApiMessage } from '../services/api.js';

export default function Vocabulary() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth || {});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let canceled = false;
    const fetch = async () => {
      try {
        setLoading(true);
        const resp = await api.get('/api/products', { params: { type: 'vocabulary', page: 1, limit: 999 } });
        if (!canceled) setItems(resp.data.items || []);
      } catch (err) {
        if (!canceled) setError(getApiMessage(err, 'Không thể tải từ vựng'));
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    fetch();
    return () => { canceled = true; };
  }, []);

  const handleProductAction = (product) => {
    if (!isAuthenticated) { navigate('/register'); return; }
    setNotice(`Đã chọn ${product.title}`);
  };

  return (
    <AcademicLayout>
      <div>
        <div className="academic-panel">
          <h2>Từ vựng</h2>
        </div>

        {error && <div className="academic-alert">{error}</div>}
        {notice && <div className="academic-success">{notice}</div>}

        <div className="academic-section">
          <div className="academic-section-heading"><div><h3>Tất cả từ vựng</h3></div></div>
          {loading ? (
            <div className="academic-carousel hide-scrollbar" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => <div className="academic-product-card academic-skeleton" key={i} />)}
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}} className="academic-all-products">
              {items.map((p) => <ProductCard product={p} onAction={handleProductAction} key={p.id} />)}
            </div>
          )}
        </div>
      </div>
    </AcademicLayout>
  );
}
