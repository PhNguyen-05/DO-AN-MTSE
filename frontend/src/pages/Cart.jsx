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
  const [usedPromotionCodes, setUsedPromotionCodes] = useState([]);
  const [cartMessage, setCartMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadCart = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('cart') || '[]');
        const purchased = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
        const filtered = Array.isArray(saved) ? saved.filter((item) => !Array.isArray(purchased) || !purchased.includes(item.id)) : [];
        if (JSON.stringify(filtered) !== JSON.stringify(saved)) {
          localStorage.setItem('cart', JSON.stringify(filtered));
        }
        setItems(filtered || []);
      } catch (e) {
        setItems([]);
      }
    };

    const loadSelectedPromotion = () => {
      try {
        const selected = JSON.parse(localStorage.getItem('selectedPromotion') || 'null');
        const used = JSON.parse(localStorage.getItem('usedPromotions') || '[]');
        const codes = Array.isArray(used)
          ? used.map((c) => String(c || '').trim().toLowerCase())
          : [];
        setUsedPromotionCodes(codes);
        if (selected && selected.code && !codes.includes(String(selected.code || '').trim().toLowerCase())) {
          setVoucher(selected.code);
          setSelectedPromo(selected);
        }
        localStorage.removeItem('selectedPromotion');
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
    if (usedPromotionCodes.includes(normalizedCode)) return 0;
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
    const normalizedCode = voucher.trim().toLowerCase();
    if (usedPromotionCodes.includes(normalizedCode)) {
      setDiscount(0);
      setSelectedPromo(null);
      setCartMessage('Mã giảm giá này đã được sử dụng. Vui lòng chọn mã khác.');
      return;
    }
    const discountAmount = getVoucherDiscount(voucher, subtotal);
    setDiscount(discountAmount);
    setCartMessage('');
    if (discountAmount > 0) {
      const promo = availablePromotions.find((item) => String(item.code || '').trim().toLowerCase() === normalizedCode);
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
<button className="section-row" type="button" onClick={() => navigate('/purchase-history')}>
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
                {availablePromotions.length > 0 ? (
                  availablePromotions.map((promo) => {
                    const isActive = selectedPromo && String(selectedPromo.code || '').trim().toLowerCase() === String(promo.code || '').trim().toLowerCase();
                    const promoCode = String(promo.code || '').trim().toLowerCase();
                    const isUsedPromo = usedPromotionCodes.includes(promoCode);
                    return (
                      <button
                        key={promo.id || promo.code}
                        type="button"
                        className={`voucher-card ${isActive ? 'applied' : ''} ${isUsedPromo ? 'used' : ''}`}
                        disabled={isUsedPromo}
                        onClick={() => {
                          if (isUsedPromo) return;
                          setVoucher(promo.code || '');
                          setSelectedPromo(promo);
                          try { localStorage.setItem('selectedPromotion', JSON.stringify(promo)); } catch (e) { /* ignore */ }
                        }}
                      >
                        <div className="voucher-left">
                          <div className="voucher-tag">Mã</div>
                          <div>
                            <div className="voucher-title">{promo.code}</div>
                            <div className="voucher-desc">{promo.description || promo.discountText || 'Áp dụng mã giảm giá'}</div>
                          </div>
                        </div>
                        <div className="voucher-right">{isUsedPromo ? 'Đã sử dụng' : (isActive ? 'Đã chọn' : 'Áp dụng')}</div>
                      </button>
                    );
                  })
                ) : (
                  <div className="voucher-hint">Nhập mã giảm giá hoặc chọn mã phù hợp để nhận ưu đãi.</div>
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
