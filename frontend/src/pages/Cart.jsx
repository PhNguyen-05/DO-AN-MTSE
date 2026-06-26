import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AcademicLayout from '../components/AcademicLayout.jsx';
import { api, getApiMessage } from '../services/api.js';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatCurrency = (v) => currencyFormatter.format(v || 0);

export default function Cart() {
  const [items, setItems] = useState([]);
  const [voucher, setVoucher] = useState('');
  const [discount, setDiscount] = useState(0);
  const [availablePromotions, setAvailablePromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [cartMessage, setCartMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadCart = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('cart') || '[]');
        setItems(saved || []);
      } catch (e) {
        setItems([]);
      }
    };

    const loadSelectedPromotion = () => {
      try {
        const selected = JSON.parse(localStorage.getItem('selectedPromotion') || 'null');
        if (selected && selected.code) {
          setVoucher(selected.code);
          setSelectedPromo(selected);
          localStorage.removeItem('selectedPromotion');
        }
      } catch (e) {
        // ignore
      }
    };

    const token = localStorage.getItem('token');
    setIsLoggedIn(Boolean(token));

    loadCart();
    loadSelectedPromotion();
  }, []);

  const subtotal = useMemo(() => items.reduce((s, it) => s + ((it.price || 0) * (it.quantity || 1)), 0), [items]);
  const total = Math.max(0, subtotal - (discount || 0));

  const getVoucherDiscount = (code, currentSubtotal) => {
    if (!code) return 0;
    const normalizedCode = code.trim().toLowerCase();
    const promo = availablePromotions.find((item) => String(item.code || '').trim().toLowerCase() === normalizedCode)
      || (selectedPromo && String(selectedPromo.code || '').trim().toLowerCase() === normalizedCode ? selectedPromo : null);

    if (promo) {
      const amount = Number(promo.discountAmount || promo.fixedAmount || 0);
      const percent = Number(promo.discountPercent || 0);
      if (percent > 0) {
        return Math.floor((currentSubtotal * percent) / 100);
      }
      if (amount > 0) {
        return Math.min(amount, currentSubtotal);
      }
      const text = String(promo.discountText || '').trim();
      const percentMatch = text.match(/(\d+)%/);
      if (percentMatch) {
        return Math.floor((currentSubtotal * Number(percentMatch[1])) / 100);
      }
      const valueMatch = text.match(/(\d+[.,]?\d*)\s?K/i);
      if (valueMatch) {
        const thousands = Number(valueMatch[1].replace('.', '').replace(',', '')) * 1000;
        return Math.min(thousands, currentSubtotal);
      }
    }

    if (normalizedCode === 'giamm50k') {
      return Math.min(50000, currentSubtotal);
    }
    if (normalizedCode === 'giamm10') {
      return Math.floor((currentSubtotal * 10) / 100);
    }
    return 0;
  };

  const applyVoucher = () => {
    if (!voucher) {
      setDiscount(0);
      setSelectedPromo(null);
      return;
    }
    const discountAmount = getVoucherDiscount(voucher, subtotal);
    setDiscount(discountAmount);
    if (discountAmount > 0) {
      const promo = availablePromotions.find((item) => String(item.code || '').trim().toLowerCase() === voucher.trim().toLowerCase());
      if (promo) setSelectedPromo(promo);
    }
  };

  useEffect(() => {
    const loadPromos = async () => {
      try {
        const response = await api.get('/api/promotions');
        setAvailablePromotions(response.data.promotions || []);
      } catch (err) {
        console.error(getApiMessage(err, 'Không thể tải dữ liệu khuyến mãi.'));
      }
    };

    loadPromos();
  }, []);

  useEffect(() => {
    if (voucher) {
      const timer = window.setTimeout(() => applyVoucher(), 200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [availablePromotions, voucher, subtotal]);

  // quantity is kept in storage but not editable in this UI (design request)

  const removeItem = (id) => {
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const clearCart = () => {
    if (!isLoggedIn) {
      setCartMessage('Vui lòng đăng nhập để xóa sản phẩm.');
      return;
    }
    setItems([]);
    localStorage.removeItem('cart');
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      setCartMessage('Vui lòng chọn sản phẩm để thanh toán.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    navigate('/checkout');
  };

  return (
    <AcademicLayout>
      <div className="cart-page">
        <div className="cart-header">
          <h2>Giỏ hàng của bạn</h2>
          <div className="cart-actions-top">
            <button className="link-button" onClick={clearCart}>Xóa tất cả</button>
          </div>
        </div>
        {cartMessage && (
          <div className="cart-alert warning" role="alert">
            {cartMessage}
          </div>
        )}

        <div className="cart-grid">
          <div className="cart-left">
            <div className="cart-items">
              {items.length === 0 ? (
                <div className="academic-panel">Giỏ hàng đang trống. <Link to="/">Tiếp tục mua hàng</Link></div>
              ) : (
                items.map((it) => (
                  <div className="cart-item" key={it.id}>
                    <div className={`cart-thumb product-tone-${it.tone || 'blue'}`}>
                      <div className="academic-product-art" aria-hidden>
                        <i className={`bi ${it.type === 'vocabulary' ? 'bi-layers' : 'bi-journal-bookmark'}`} />
                      </div>
                    </div>
                    <div className="cart-body">
                      <h4>{it.title}</h4>
                      <div className="cart-meta">{it.type} • Giá: <strong>{formatCurrency(it.price)}</strong></div>
                      {/* quantity removed from UI per request */}
                    </div>
                    <div className="cart-right-item">
                      <div className="cart-item-price">{formatCurrency((it.price || 0) * (it.quantity || 1))}</div>
                      <button
                        className="link-button cart-remove"
                        onClick={() => removeItem(it.id)}
                        aria-label={`Xóa ${it.title}`}
                        disabled={!isLoggedIn}
                        title={!isLoggedIn ? 'Vui lòng đăng nhập để xóa sản phẩm' : undefined}
                      ><i className="bi bi-trash" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cart-section">
              <button className="section-row" type="button" onClick={() => { /* placeholder */ }}>
                <div className="section-left">
                  <i className="bi bi-clock" />
                  <div className="section-title">Lịch sử mua hàng</div>
                </div>
                <i className="bi bi-chevron-right" />
              </button>

              <button className="section-row" type="button" onClick={() => { /* placeholder */ }}>
                <div className="section-left">
                  <i className="bi bi-star" />
                  <div className="section-title">Đánh giá sao</div>
                </div>
                <i className="bi bi-chevron-right" />
              </button>
            </div>

            <div className="cart-voucher-panel">
              <h4>Mã giảm giá</h4>
              <div className="voucher-row">
                <input value={voucher} onChange={(e) => setVoucher(e.target.value)} placeholder="Nhập mã giảm giá..." />
                <button className="btn btn-outline" type="button" onClick={applyVoucher}>Áp dụng</button>
              </div>
              <div className="voucher-list">
                {availablePromotions.length > 0 ? availablePromotions.map((promo) => (
                  <button
                    key={promo.id}
                    type="button"
                    className={`voucher-card ${String(promo.code || '').trim().toLowerCase() === String(voucher || '').trim().toLowerCase() ? 'active' : ''}`}
                    onClick={() => {
                      setVoucher(promo.code || '');
                      setSelectedPromo(promo);
                      try { localStorage.setItem('selectedPromotion', JSON.stringify(promo)); } catch (e) { /* ignore */ }
                    }}
                  >
                    <strong>{promo.code}</strong>
                    <small>{promo.description || promo.discountText}</small>
                  </button>
                )) : (
                  <>
                    <button type="button" className="voucher-card" onClick={() => { setVoucher('giamm50k'); try { localStorage.setItem('selectedPromotion', JSON.stringify({ code: 'giamm50k', discountText: 'Giảm 50K' })); } catch (e) {} }}>Giảm 50K <small>Đơn tối thiểu 500K</small></button>
                    <button type="button" className="voucher-card" onClick={() => { setVoucher('giamm10'); try { localStorage.setItem('selectedPromotion', JSON.stringify({ code: 'giamm10', discountText: 'Giảm 10%' })); } catch (e) {} }}>Giảm 10% <small>Cho thành viên mới</small></button>
                  </>
                )}
              </div>
            </div>
          </div>

          <aside className="cart-right">
            <div className="cart-summary">
              <h4>Tóm tắt đơn hàng</h4>
              <div className="summary-row"><span>Tạm tính ({items.length} sản phẩm)</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="summary-row"><span>Giảm giá</span><span>-{formatCurrency(discount)}</span></div>
              <div className="summary-total"><span>Tổng cộng</span><span>{formatCurrency(total)}</span></div>
              <button className="btn btn-primary w-100" onClick={handleCheckout}>Thanh toán ngay</button>
              <button className="btn btn-outline w-100" onClick={() => navigate('/')}>Tiếp tục mua hàng</button>
            </div>
            <div className="cart-help">
              <strong>Bạn cần hỗ trợ?</strong>
              <div>1900 123 456</div>
              <small>Hỗ trợ 24/7 (Miễn phí)</small>
            </div>
          </aside>
        </div>
      </div>
    </AcademicLayout>
  );
}
