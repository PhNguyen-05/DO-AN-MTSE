import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AcademicLayout from '../components/AcademicLayout.jsx';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatCurrency = (v) => currencyFormatter.format(v || 0);

export default function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [voucher, setVoucher] = useState(null);
  const [availablePromotions, setAvailablePromotions] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cart') || '[]');
      setItems(saved || []);
    } catch (e) {
      setItems([]);
    }

    try {
      const selected = JSON.parse(localStorage.getItem('selectedPromotion') || 'null');
      if (selected && selected.code) {
        setVoucher(selected);
      }
    } catch (e) {
      // ignore
    }

    // fetch available promotions for voucher cards
    fetch('/api/promotions')
      .then((r) => r.json())
      .then((data) => setAvailablePromotions(Array.isArray(data) ? data : []))
      .catch(() => setAvailablePromotions([]));
  }, []);

  const subtotal = useMemo(() => items.reduce((s, it) => s + ((it.price || 0) * (it.quantity || 1)), 0), [items]);

  const computeDiscount = () => {
    if (!voucher) return 0;
    const percent = Number(voucher.discountPercent || 0);
    const amount = Number(voucher.discountAmount || voucher.fixedAmount || 0);
    if (percent > 0) return Math.floor((subtotal * percent) / 100);
    if (amount > 0) return Math.min(amount, subtotal);
    const text = String(voucher.discountText || '') || '';
    const m = text.match(/(\d+)%/);
    if (m) return Math.floor((subtotal * Number(m[1])) / 100);
    const vm = text.match(/(\d+[.,]?\d*)\s?K/i);
    if (vm) return Math.min(Number(vm[1].replace(',', '').replace('.', '')) * 1000, subtotal);
    return 0;
  };

  const discount = computeDiscount();
  const total = Math.max(0, subtotal - discount);

  return (
    <AcademicLayout>
      <div className="cart-page">
        <div className="cart-header">
          <h2>Thanh toán</h2>
          <div className="checkout-steps">
            <div className="step">
              <div className="step-num done">1</div>
              <div className="step-label">Giỏ hàng</div>
            </div>
            <div className="step-line" />
            <div className="step">
              <div className="step-num active">2</div>
              <div className="step-label">Thanh toán</div>
            </div>
          </div>
        </div>

        <div className="cart-grid">
          <div className="cart-left">
            <div className="academic-panel">
              <div className="academic-panel-title is-tertiary"><i className="bi bi-box-seam" /> <h3>Sản phẩm trong đơn hàng</h3></div>
              <div className="cart-items">
                {items.length === 0 ? (
                  <div className="academic-panel">Không có sản phẩm trong giỏ hàng.</div>
                ) : items.map((it) => (
                  <div className="cart-item" key={it.id}>
                    <div className={`cart-thumb product-tone-${it.tone || 'blue'}`}>
                      <div className="academic-product-art" aria-hidden>
                        <i className={`bi ${it.type === 'vocabulary' ? 'bi-layers' : 'bi-journal-bookmark'}`} />
                      </div>
                    </div>
                    <div className="cart-body">
                      <h4>{it.title}</h4>
                      <div className="cart-meta">{it.type}</div>
                    </div>
                    <div className="cart-right-item">
                      <div className="cart-item-price">{formatCurrency((it.price || 0) * (it.quantity || 1))}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cart-voucher-panel">
              <h4>Mã giảm giá</h4>
              <div className="voucher-row">
                <input value={voucher?.code || ''} readOnly placeholder="Chọn mã từ trang Khuyến mãi" />
                <button className="btn btn-outline" type="button" onClick={() => navigate('/promotions?return=checkout')}>Chọn mã</button>
              </div>

              <div className="voucher-cards">
                {availablePromotions.map((p) => {
                  const isApplied = voucher && voucher.code === p.code;
                  return (
                    <button key={p.code} type="button" className={`voucher-card ${isApplied ? 'applied' : ''}`} onClick={() => { setVoucher(p); localStorage.setItem('selectedPromotion', JSON.stringify(p)); }}>
                      <div className="voucher-left">
                        <div className="voucher-tag">{p.type === 'percent' ? '%' : '₫'}</div>
                      </div>
                      <div className="voucher-body">
                        <div className="voucher-title">{p.title || p.code}</div>
                        <div className="voucher-desc">{p.description || p.discountText}</div>
                      </div>
                      <div className="voucher-right">
                        {isApplied ? <i className="bi bi-check-circle-fill" /> : <i className="bi bi-chevron-right" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="cart-right">
            <div className="cart-summary">
              <h4>Phương thức thanh toán</h4>
              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" name="pm" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} />
                  <span>Ví MoMo</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" name="pm" checked={paymentMethod === 'zalopay'} onChange={() => setPaymentMethod('zalopay')} />
                  <span>Ví ZaloPay</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" name="pm" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                  <span>Thẻ ATM / Internet Banking</span>
                </label>
              </div>
            </div>

            <div style={{ height: 12 }} />

            <div className="cart-summary">
              <h4>Tóm tắt đơn hàng</h4>
              <div className="summary-row"><span>Tạm tính ({items.length} sản phẩm)</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="summary-row"><span>Giảm giá{voucher ? ` (${voucher.code})` : ''}</span><span className="discount-value">-{formatCurrency(discount)}</span></div>
              <div className="summary-total"><span>Tổng cộng</span><span className="total-value">{formatCurrency(total)}</span></div>
              <button className="btn btn-primary w-100" type="button" onClick={() => alert('Tiến hành thanh toán (demo)')}>Thanh toán ngay</button>
              <button className="btn btn-outline w-100" type="button" onClick={() => navigate('/cart')}>Quay lại giỏ hàng</button>
            </div>
          </aside>
        </div>
      </div>
    </AcademicLayout>
  );
}
