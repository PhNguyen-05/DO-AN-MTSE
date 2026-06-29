import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AcademicLayout from '../components/AcademicLayout.jsx';
import { api, getAuthorizationHeader, getApiMessage } from '../services/api.js';
import { fetchUserPurchasedItems, isCartItemPurchased, mergePurchasedItemsLocal, notifyPurchaseUpdated, parseProductRef } from '../utils/purchase.js';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../utils/storage.js';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatCurrency = (v) => currencyFormatter.format(v || 0);
const formatDate = (value) => {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [voucher, setVoucher] = useState(null);
  const [availablePromotions, setAvailablePromotions] = useState([]);
  const [usedPromotionCodes, setUsedPromotionCodes] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  useEffect(() => {
    try {
      const saved = getLocalStorage('cart', []);
      
      // Fetch purchased items from server if logged in
      const fetchPurchasedItems = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            const purchased = getLocalStorage('purchasedItems', []);
            const filtered = Array.isArray(saved)
              ? saved.filter((item) => !isCartItemPurchased(purchased, item))
              : [];
            if (JSON.stringify(filtered) !== JSON.stringify(saved)) {
              setLocalStorage('cart', filtered);
            }
            setItems(filtered || []);
            return;
          }

          const purchasedItems = await fetchUserPurchasedItems();
          const filtered = Array.isArray(saved)
            ? saved.filter((item) => !isCartItemPurchased(purchasedItems, item))
            : [];
          if (JSON.stringify(filtered) !== JSON.stringify(saved)) {
            setLocalStorage('cart', filtered);
          }
          setItems(filtered || []);
        } catch (error) {
          console.error('Error fetching purchased items:', error);
          const purchased = getLocalStorage('purchasedItems', []);
          const filtered = Array.isArray(saved)
            ? saved.filter((item) => !isCartItemPurchased(purchased, item))
            : [];
          if (JSON.stringify(filtered) !== JSON.stringify(saved)) {
            setLocalStorage('cart', filtered);
          }
          setItems(filtered || []);
        }
      };
      
      fetchPurchasedItems();
    } catch (e) {
      setItems([]);
    }

    try {
      const selected = getLocalStorage('selectedPromotion', null);
      const used = getLocalStorage('usedPromotions', []);
      const codes = Array.isArray(used)
        ? used.map((c) => String(c || '').trim().toLowerCase())
        : [];
      setUsedPromotionCodes(codes);
      if (selected && selected.code && !codes.includes(String(selected.code || '').trim().toLowerCase())) {
        setVoucher(selected);
      }
    } catch (e) {
      // ignore
    }

    fetch('/api/promotions')
      .then((r) => r.json())
      .then((data) => setAvailablePromotions(Array.isArray(data) ? data : []))
      .catch(() => setAvailablePromotions([]));
  }, []);

  const subtotal = useMemo(() => items.reduce((s, it) => s + ((it.price || 0) * (it.quantity || 1)), 0), [items]);

  const computeDiscount = () => {
    if (!voucher) return 0;
    const code = String(voucher.code || '').trim().toLowerCase();
    if (usedPromotionCodes.includes(code)) return 0;
    const percent = Number(voucher.discountPercent || 0);
    const amount = Number(voucher.discountAmount || voucher.fixedAmount || 0);
    if (percent > 0) return Math.floor((subtotal * percent) / 100);
    if (amount > 0) return Math.min(amount, subtotal);

    const text = String(voucher.discountText || '');
    const percentMatch = text.match(/(\d+)%/);
    if (percentMatch) return Math.floor((subtotal * Number(percentMatch[1])) / 100);

    const kMatch = text.match(/(\d+[.,]?\d*)\s?K/i);
    if (kMatch) return Math.min(Number(kMatch[1].replace(',', '').replace('.', '')) * 1000, subtotal);

    const rawAmountMatch = text.match(/(\d+[.,]?\d*)\s?đ/i);
    if (rawAmountMatch) return Math.min(Number(rawAmountMatch[1].replace(',', '').replace('.', '')), subtotal);

    return 0;
  };

  const handlePayNow = async () => {
    if (voucher && voucher.code) {
      const code = String(voucher.code || '').trim().toLowerCase();
      if (usedPromotionCodes.includes(code)) {
        setCheckoutMessage('Mã giảm giá này đã được sử dụng. Vui lòng chọn mã khác.');
        return;
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const purchasePayload = {
      items: (items || []).map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        price: item.price,
        tone: item.tone,
        packageType: item.packageType || parseProductRef(item.id, item.type === 'vocabulary' ? 'vocabulary' : 'bundle').packageType
      })),
      voucherCode: voucher?.code || '',
      subtotal,
      discount,
      total
    };

    try {
      const response = await api.post('/api/purchase', purchasePayload, {
        headers: { Authorization: getAuthorizationHeader() }
      });

      const paymentData = response.data?.payment || {};
      const orderIdFromApi = response.data?.orderId || paymentData.orderId || `DH${String(Date.now()).slice(-8)}`;
      const paymentDateFromApi = paymentData.paidAt || new Date().toISOString();

      if (voucher && voucher.code) {
        const used = getLocalStorage('usedPromotions', []);
        const codes = Array.isArray(used)
          ? used.map((c) => String(c || '').trim().toLowerCase())
          : [];
        const code = String(voucher.code || '').trim().toLowerCase();
        if (!codes.includes(code)) {
          codes.push(code);
          setLocalStorage('usedPromotions', codes);
        }
        removeLocalStorage('selectedPromotion');
      }

      try {
        await fetchUserPurchasedItems();
        mergePurchasedItemsLocal(items);
        notifyPurchaseUpdated();

        const order = {
          orderId: orderIdFromApi,
          date: formatDate(paymentDateFromApi),
          total,
          voucherCode: voucher?.code || '',
          items: purchasePayload.items
        };

        const storedHistory = getLocalStorage('purchaseHistory', []);
        const history = Array.isArray(storedHistory) ? storedHistory : [];
        history.unshift(order);
        setLocalStorage('purchaseHistory', history.slice(0, 20));
      } catch (e) {
        console.error('Error updating purchased items:', e);
        // ignore local storage fallback
      }

      removeLocalStorage('cart');
      setOrderId(orderIdFromApi);
      setPaymentDate(formatDate(paymentDateFromApi));
      setPaymentSuccess(true);
      setVoucher(null);
      setCheckoutMessage('');
    } catch (error) {
      const message = getApiMessage(error, 'Không thể hoàn tất thanh toán. Vui lòng thử lại.');
      setCheckoutMessage(message);
    }
  };

  const discount = computeDiscount();
  const total = Math.max(0, subtotal - discount);

  if (paymentSuccess) {
    return (
      <AcademicLayout>
        <div className="checkout-page" style={{ padding: '24px 0' }}>
          <div className="checkout-success-card academic-panel" style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center', padding: 32 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', margin: '0 auto 24px', display: 'grid', placeItems: 'center', background: '#e6f4ff', color: '#0d6efd' }}>
              <i className="bi bi-check-circle-fill" style={{ fontSize: 40 }} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.9rem', color: '#10233f' }}>Thanh toán thành công!</h2>
            <p style={{ margin: '16px 0 24px', color: '#475569' }}>Đơn hàng của bạn đã được xử lý thành công. Cảm ơn bạn đã tin tưởng mua sắm tại chúng tôi.</p>
            <div style={{ textAlign: 'left', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span>Mã đơn hàng</span>
                <strong>{orderId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span>Ngày thanh toán</span>
                <strong>{paymentDate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" type="button" onClick={() => navigate('/')}>Về trang chủ</button>
              <button className="btn btn-outline btn-lg" type="button" onClick={() => navigate('/purchase-history')}>Xem lịch sử mua hàng</button>
            </div>
          </div>
        </div>
      </AcademicLayout>
    );
  }

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
          {checkoutMessage ? (
            <div className="cart-alert warning" role="alert" style={{ marginTop: 16 }}>
              {checkoutMessage}
            </div>
          ) : null}
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
                        <i className={`bi ${it.type === 'premium' ? 'bi-stars' : it.type === 'vocabulary' ? 'bi-layers' : 'bi-journal-bookmark'}`} />
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
                  const promoCode = String(p.code || '').trim().toLowerCase();
                  const isUsedPromo = usedPromotionCodes.includes(promoCode);
                  const isApplied = voucher && voucher.code === p.code;
                  return (
                    <button
                      key={p.code}
                      type="button"
                      className={`voucher-card ${isApplied ? 'applied' : ''} ${isUsedPromo ? 'used' : ''}`}
                      disabled={isUsedPromo}
                      onClick={() => {
                        if (isUsedPromo) return;
                        setVoucher(p);
                        setLocalStorage('selectedPromotion', p);
                      }}
                    >
                      <div className="voucher-left">
                        <div className="voucher-tag">{p.type === 'percent' ? '%' : '₫'}</div>
                      </div>
                      <div className="voucher-body">
                        <div className="voucher-title">{p.title || p.code}</div>
                        <div className="voucher-desc">{p.description || p.discountText}</div>
                      </div>
                      <div className="voucher-right">
                        {isUsedPromo ? 'Đã sử dụng' : (isApplied ? <i className="bi bi-check-circle-fill" /> : <i className="bi bi-chevron-right" />)}
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
              <div style={{ padding: '16px 18px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
                <strong>Ví MoMo</strong>
              </div>
            </div>

            <div style={{ height: 12 }} />

            <div className="cart-summary">
              <h4>Tóm tắt đơn hàng</h4>
              <div className="summary-row"><span>Tạm tính ({items.length} sản phẩm)</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="summary-row"><span>Giảm giá{voucher ? ` (${voucher.code})` : ''}</span><span className="discount-value">-{formatCurrency(discount)}</span></div>
              <div className="summary-total"><span>Tổng cộng</span><span className="total-value">{formatCurrency(total)}</span></div>
              <button className="btn btn-primary w-100" type="button" onClick={handlePayNow}>Thanh toán ngay</button>
              <button className="btn btn-outline w-100" type="button" onClick={() => navigate('/cart')}>Quay lại giỏ hàng</button>
            </div>
          </aside>
        </div>
      </div>
    </AcademicLayout>
  );
}
