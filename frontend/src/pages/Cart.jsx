import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AcademicLayout from '../components/AcademicLayout.jsx';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatCurrency = (v) => currencyFormatter.format(v || 0);

export default function Cart() {
  const [items, setItems] = useState([]);
  const [voucher, setVoucher] = useState('');
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cart') || '[]');
      setItems(saved || []);
    } catch (e) {
      setItems([]);
    }
  }, []);

  const subtotal = useMemo(() => items.reduce((s, it) => s + ((it.price || 0) * (it.quantity || 1)), 0), [items]);
  const total = Math.max(0, subtotal - (discount || 0));

  // quantity is kept in storage but not editable in this UI (design request)

  const removeItem = (id) => {
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const applyVoucher = () => {
    // simple demo voucher logic
    if (!voucher) return;
    if (voucher.toLowerCase() === 'giamm50k') {
      setDiscount(50000);
    } else if (voucher.toLowerCase() === 'giamm10') {
      setDiscount(Math.floor(subtotal * 0.1));
    } else {
      setDiscount(0);
    }
  };

  const handleCheckout = () => {
    // for now require login check
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    // placeholder: navigate to checkout flow
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
                      <button className="link-button cart-remove" onClick={() => removeItem(it.id)} aria-label={`Xóa ${it.title}`}><i className="bi bi-trash" /></button>
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
                <div className="voucher-card">Giảm 50K <small>Đơn tối thiểu 500K</small></div>
                <div className="voucher-card">Giảm 10% <small>Cho thành viên mới</small></div>
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
