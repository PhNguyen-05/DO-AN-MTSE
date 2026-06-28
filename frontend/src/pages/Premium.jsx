import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AcademicLayout from '../components/AcademicLayout.jsx';
import { api, getApiMessage } from '../services/api.js';
import { getLocalStorage, setLocalStorage } from '../utils/storage.js';

const emptyPlan = {
  id: '',
  name: 'Gói Premium',
  price: '',
  description: 'Đang tải thông tin gói Premium...',
  features: [],
  buttonText: 'Đăng ký ngay',
  isActive: false
};

export default function Premium() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth || {});
  const [showAlert, setShowAlert] = useState(false);
  const [plan, setPlan] = useState(emptyPlan);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    const fetchPremiumPlan = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/api/premium');
        const plans = response.data?.plans || [];
        if (Array.isArray(plans) && plans.length > 0) {
          setPlan(plans[0]);
        } else {
          setError('Không tìm thấy dữ liệu gói Premium.');
        }
      } catch (err) {
        setError(getApiMessage(err, 'Không thể tải dữ liệu gói Premium.'));
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumPlan();
  }, []);

  useEffect(() => {
    if (!plan.id) {
      setIsPurchased(false);
      return;
    }

    try {
      const purchased = getLocalStorage('purchasedItems', []);
      const normalized = Array.isArray(purchased)
        ? purchased.map((id) => String(id || '').trim())
        : [];
      setIsPurchased(normalized.includes(String(plan.id)));
    } catch (e) {
      setIsPurchased(false);
    }
  }, [plan.id]);

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      setShowAlert(true);
      return;
    }

    try {
      const saved = getLocalStorage('cart', []);
      const existingIndex = Array.isArray(saved)
        ? saved.findIndex((cartItem) => String(cartItem.id) === String(plan.id))
        : -1;

      const nextCart = Array.isArray(saved) ? [...saved] : [];
      if (existingIndex === -1) {
        nextCart.push({
          id: plan.id,
          title: plan.name,
          price: Number(plan.price) || 0,
          type: 'premium',
          thumbnail: plan.thumbnail || '',
          tone: plan.tone || 'purple',
          packageType: 'bundle',
          quantity: 1
        });
        setLocalStorage('cart', nextCart);
      }

      navigate('/cart');
    } catch (err) {
      setError('Không thể thêm gói Premium vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  return (
    <AcademicLayout>
      {showAlert && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div>
            <p style={{ margin: 0, color: '#991b1b', fontSize: '0.95rem', fontWeight: 500 }}>
              Bạn cần đăng nhập trước khi đăng ký gói Premium.
            </p>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#991b1b',
              marginLeft: 'auto'
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="academic-panel" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 32, maxWidth: 600 }}>
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#10233f', fontWeight: 800 }}>{plan.name}</h2>
          <p style={{ marginTop: 8, color: '#475569', fontSize: '0.95rem' }}>
            {plan.description}
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: 24, color: '#b91c1c', fontSize: '0.95rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ maxWidth: 450, width: '100%' }}>
          <div style={{
            border: '2px solid #2563eb',
            borderRadius: 16,
            padding: '28px 24px',
            background: 'linear-gradient(135deg, #f0f7ff 0%, #fff 100%)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#2563eb', letterSpacing: '-0.5px' }}>
                {plan.formattedPrice || plan.price}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
                {plan.durationMonths ? `cho ${plan.durationMonths} tháng truy cập` : 'Thông tin thời hạn đang cập nhật'}
              </div>
            </div>

            <ul style={{
              paddingLeft: 0,
              color: '#334155',
              display: 'grid',
              gap: 10,
              marginBottom: 24,
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}>
              {plan.features.map((feature) => (
                <li key={feature} style={{ listStyle: 'none', display: 'flex', gap: 8 }}>
                  <span style={{ color: '#2563eb', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRegisterClick}
              disabled={loading || !plan.isActive || isPurchased}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: 8,
                background: loading || !plan.isActive || isPurchased ? '#94a3b8' : '#2563eb',
                color: '#fff',
                cursor: loading || !plan.isActive || isPurchased ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (!loading && plan.isActive && !isPurchased) e.target.style.background = '#1d4ed8';
              }}
              onMouseOut={(e) => {
                if (!loading && plan.isActive && !isPurchased) e.target.style.background = '#2563eb';
              }}
            >
              {loading ? 'Đang tải...' : isPurchased ? 'Đã mua' : plan.buttonText}
            </button>
          </div>
        </div>
      </div>
    </AcademicLayout>
  );
}
