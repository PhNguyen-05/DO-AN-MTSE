import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AcademicLayout from '../components/AcademicLayout.jsx';
import { api, getApiMessage } from '../services/api.js';
import { getLocalStorage, hasPremiumAccess, setLocalStorage } from '../utils/storage.js';

const emptyPlan = {
  id: '',
  name: 'Gói Premium',
  price: 0,
  formattedPrice: '',
  description: 'Đang tải thông tin gói Premium...',
  features: [],
  buttonText: 'Đăng ký ngay',
  durationMonths: 12,
  isActive: false
};

export default function Premium() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth || {});
  const [showAlert, setShowAlert] = useState(false);
  const [plan, setPlan] = useState(emptyPlan);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPremiumUser, setIsPremiumUser] = useState(
    () => typeof window !== 'undefined' && hasPremiumAccess()
  );

  useEffect(() => {
    const syncPremium = () => setIsPremiumUser(hasPremiumAccess());
    syncPremium();
    window.addEventListener('purchase:updated', syncPremium);
    return () => window.removeEventListener('purchase:updated', syncPremium);
  }, []);

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

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      setShowAlert(true);
      return;
    }

    if (isPremiumUser) return;

    try {
      const premiumId = plan.id || 'premium';
      const saved = getLocalStorage('cart', []);
      const cartItems = Array.isArray(saved) ? saved : [];
      const alreadyInCart = cartItems.some(
        (item) => item?.type === 'premium' || String(item?.id) === String(premiumId)
      );

      if (alreadyInCart) {
        navigate('/cart');
        return;
      }

      cartItems.push({
        id: premiumId,
        title: plan.name || 'Gói Premium',
        price: typeof plan.price === 'number' ? plan.price : Number(plan.price) || 0,
        type: 'premium',
        packageType: 'premium',
        tone: 'blue',
        quantity: 1
      });
      setLocalStorage('cart', cartItems);
      navigate('/cart');
    } catch (err) {
      setError('Không thể thêm gói Premium vào giỏ hàng.');
    }
  };

  // Format giá nếu backend chưa format
  const displayPrice = plan.formattedPrice
    || (typeof plan.price === 'number'
      ? `${plan.price.toLocaleString('vi-VN')}đ`
      : plan.price || '');

  const btnDisabled = loading || !plan.isActive || isPremiumUser;

  return (
    <AcademicLayout>
      {/* Alert đăng nhập */}
      {showAlert && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '14px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12, minWidth: 320,
        }}>
          <span style={{ fontSize: '1.3rem' }}>⚠️</span>
          <p style={{ margin: 0, color: '#991b1b', fontSize: '0.95rem', fontWeight: 500 }}>
            Bạn cần đăng nhập trước khi đăng ký gói Premium.
          </p>
          <button onClick={() => setShowAlert(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.2rem', color: '#991b1b', marginLeft: 'auto'
          }}>✕</button>
        </div>
      )}

      <div style={{ padding: '48px 20px', maxWidth: 900, margin: '0 auto' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#fff', padding: '4px 14px', borderRadius: 999,
            fontSize: '0.78rem', fontWeight: 700, letterSpacing: 1,
            marginBottom: 14, textTransform: 'uppercase'
          }}>
            <i className="bi bi-gem" /> Premium
          </span>
          <h1 style={{ margin: '0 0 12px', fontSize: '2rem', color: '#10233f', fontWeight: 900 }}>
            {loading ? 'Đang tải...' : plan.name}
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            {loading ? 'Vui lòng chờ...' : plan.description}
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
            padding: '12px 16px', color: '#b91c1c', fontSize: '0.9rem',
            textAlign: 'center', marginBottom: 28
          }}>
            {error}
          </div>
        )}

        {/* Card gói */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%', maxWidth: 480,
            border: '2px solid #2563eb',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.15)',
          }}>
            {/* Header card */}
            <div style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              padding: '28px 28px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                {loading ? '---' : displayPrice}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>
                {loading ? 'Đang tải thông tin...' : plan.durationMonths
                  ? `Truy cập đầy đủ trong ${plan.durationMonths} tháng`
                  : 'Thời hạn đang cập nhật'}
              </div>

              {isPremiumUser && (
                <div style={{
                  marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.2)', color: '#fff',
                  borderRadius: 999, padding: '4px 12px', fontSize: '0.82rem', fontWeight: 700
                }}>
                  <i className="bi bi-check-circle-fill" /> Bạn đang có gói này
                </div>
              )}
            </div>

            {/* Body card */}
            <div style={{ padding: '28px 28px 24px', background: '#fff' }}>
              {/* Tính năng */}
              {plan.features.length > 0 && (
                <ul style={{ padding: 0, margin: '0 0 24px', display: 'grid', gap: 12 }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ listStyle: 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#eff6ff', color: '#2563eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: '0.75rem', fontWeight: 700, marginTop: 1
                      }}>✓</span>
                      <span style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.5 }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Thông tin thêm */}
              <div style={{
                background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
                marginBottom: 22, display: 'flex', gap: 18, flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#475569' }}>
                  <i className="bi bi-calendar-check" style={{ color: '#2563eb' }} />
                  {plan.durationMonths} tháng truy cập
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#475569' }}>
                  <i className="bi bi-shield-check" style={{ color: '#2563eb' }} />
                  Thanh toán bảo mật
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#475569' }}>
                  <i className="bi bi-headset" style={{ color: '#2563eb' }} />
                  Hỗ trợ 24/7
                </div>
              </div>

              {/* Nút CTA */}
              {isPremiumUser ? (
                <>
                  <div style={{
                    textAlign: 'center', marginBottom: 12,
                    background: '#f0fdf4', borderRadius: 10, padding: '10px 14px',
                    border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.88rem', fontWeight: 600
                  }}>
                    <i className="bi bi-check-circle-fill" style={{ marginRight: 6, color: '#16a34a' }} />
                    Bạn đang sử dụng gói Premium
                  </div>
                  <Link
                    to="/premium-dashboard"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      width: '100%', padding: '14px 16px', fontSize: '1rem', fontWeight: 700,
                      borderRadius: 10, textDecoration: 'none', color: '#fff',
                      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                      boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)';
                    }}
                  >
                    <i className="bi bi-speedometer2" />
                    Vào Premium Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleRegisterClick}
                    disabled={loading || !plan.isActive}
                    style={{
                      width: '100%', padding: '14px 16px', fontSize: '1rem', fontWeight: 700,
                      border: 'none', borderRadius: 10,
                      background: loading || !plan.isActive
                        ? '#94a3b8'
                        : 'linear-gradient(135deg, #2563eb, #4f46e5)',
                      color: '#fff',
                      cursor: loading || !plan.isActive ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease', letterSpacing: 0.3,
                      boxShadow: loading || !plan.isActive ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
                    }}
                    onMouseOver={(e) => {
                      if (!loading && plan.isActive) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!loading && plan.isActive) {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)';
                      }
                    }}
                  >
                    {loading
                      ? <><i className="bi bi-hourglass-split" /> Đang tải...</>
                      : <><i className="bi bi-cart-plus" /> {plan.buttonText || 'Đăng ký ngay'}</>
                    }
                  </button>
                  {!loading && (
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem', marginTop: 12 }}>
                      Thanh toán an toàn qua VNPay · Hoàn tiền trong 7 ngày nếu không hài lòng
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* So sánh gói */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.25rem', color: '#10233f', fontWeight: 800, marginBottom: 24 }}>
            So sánh tính năng
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 0, borderRadius: 14, overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}>
            {/* Header */}
            <div style={{ background: '#f8fafc', padding: '14px 20px', fontWeight: 700, color: '#475569', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
              Tính năng
            </div>
            <div style={{ background: '#eff6ff', padding: '14px 20px', fontWeight: 700, color: '#2563eb', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
              <i className="bi bi-gem" /> Premium
            </div>

            {[
              ['Đề thi miễn phí', true],
              ['Đề thi Premium (tất cả)', true],
              ['Từ vựng TOEIC đầy đủ', true],
              ['Luyện theo Part không giới hạn', true],
              ['Thống kê tiến độ chi tiết', true],
              ['Sổ tay từ vựng cá nhân', true],
              ['Câu hỏi khó đã lưu', true],
            ].map(([feature, hasPremium], i) => (
              <React.Fragment key={i}>
                <div style={{
                  padding: '13px 20px', fontSize: '0.88rem', color: '#334155',
                  borderBottom: i < 6 ? '1px solid #f1f5f9' : 'none',
                  background: i % 2 === 0 ? '#fff' : '#fafbfc'
                }}>
                  {feature}
                </div>
                <div style={{
                  padding: '13px 20px', textAlign: 'center',
                  borderBottom: i < 6 ? '1px solid #f1f5f9' : 'none',
                  background: i % 2 === 0 ? '#f0f7ff' : '#e8f0fe'
                }}>
                  {hasPremium
                    ? <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '1rem' }}>✓</span>
                    : <span style={{ color: '#94a3b8' }}>—</span>
                  }
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </AcademicLayout>
  );
}
