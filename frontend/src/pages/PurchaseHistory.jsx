import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AcademicLayout from "../components/AcademicLayout.jsx";
import { api, getAuthorizationHeader, getApiMessage } from "../services/api.js";

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatCurrency = (value) => currencyFormatter.format(value || 0);

const getActionLabel = (item) => {
  const type = String(item.type || '').toLowerCase();
  if (type.includes('premium') || type.includes('membership')) return 'Xem thời hạn';
  if (type.includes('vocabulary')) return 'Ôn tập';
  return 'Luyện đề';
};

export default function PurchaseHistory() {
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await api.get('/api/purchase-history', {
          headers: { Authorization: getAuthorizationHeader() }
        });

        const fetchedHistory = response.data?.history || [];
        setHistory(Array.isArray(fetchedHistory) ? fetchedHistory : []);
      } catch (err) {
        setErrorMessage(getApiMessage(err, 'Không thể tải lịch sử mua hàng. Vui lòng thử lại.'));
      }
    };

    fetchHistory();
  }, [navigate]);

  return (
    <AcademicLayout>
      <div className="purchase-history-page" style={{ padding: '24px 0' }}>
        <section className="academic-panel purchase-history-header" style={{ marginBottom: 24, padding: 24 }}>
          <button type="button" className="back-button" onClick={() => navigate(-1)} style={{ border: 0, background: 'transparent', color: '#334155', cursor: 'pointer', marginBottom: 16 }}>
            <i className="bi bi-arrow-left" style={{ marginRight: 8 }} /> Quay lại
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '2rem', color: '#10233f' }}>Lịch sử mua hàng</h2>
              <p style={{ margin: '12px 0 0', color: '#475569' }}>Quản lý các giao dịch và truy cập nhanh vào nội dung đã mua.</p>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <div className="academic-panel" style={{ padding: 32, textAlign: 'center' }}>
            <h3>Lỗi tải lịch sử</h3>
            <p>{errorMessage}</p>
            <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        ) : history.length === 0 ? (
          <div className="academic-panel" style={{ padding: 32, textAlign: 'center' }}>
            <h3>Chưa có giao dịch nào</h3>
            <p>Bạn chưa mua sản phẩm nào hoặc lịch sử mua hàng đang trống.</p>
            <button className="btn btn-primary" type="button" onClick={() => navigate('/')}>Tiếp tục mua hàng</button>
          </div>
        ) : (
          <div className="purchase-history-list" style={{ display: 'grid', gap: 24 }}>
            {history.map((order) => (
              <article key={order.orderId} className="order-card academic-panel" style={{ padding: 24, borderRadius: 20, border: '1px solid rgba(148, 163, 184, 0.24)', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span className="badge" style={{ padding: '8px 12px', borderRadius: 999, background: '#eef4ff', color: '#1d4ed8', fontWeight: 600 }}>ĐỀ THI</span>
                      <span style={{ color: '#64748b' }}>#{order.orderId}</span>
                    </div>
                    <div style={{ color: '#475569' }}>{order.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#64748b', fontSize: 14 }}>Tổng đơn</div>
                    <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>{formatCurrency(order.total)}</strong>
                  </div>
                </div>

                {order.voucherCode ? (
                  <div style={{ marginBottom: 18 }}>
                    <span className="promo-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999, background: '#e6ffed', color: '#166534', fontWeight: 600 }}>
                      <i className="bi bi-ticket" /> Voucher: {order.voucherCode}
                    </span>
                  </div>
                ) : null}

                <div style={{ display: 'grid', gap: 14 }}>
                  {Array.isArray(order.items) && order.items.map((item) => (
                    <div key={item.id} className="order-item" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center', padding: 18, borderRadius: 18, background: '#f8fafc' }}>
                      <div className={`order-item-icon product-tone-${item.tone || 'blue'}`} style={{ width: 58, height: 58, borderRadius: 16, display: 'grid', placeItems: 'center', background: '#eff6ff' }}>
                        <i className={`bi ${item.type === 'vocabulary' ? 'bi-layers' : 'bi-journal-bookmark'}`} style={{ fontSize: 24, color: '#2563eb' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 700 }}>{item.title}</span>
                          <span style={{ fontSize: 12, color: '#475569', background: '#f1f5f9', borderRadius: 999, padding: '4px 10px' }}>{item.type || item.category || 'Đề thi'}</span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: 14 }}>Giá gốc: {formatCurrency(item.price)}</div>
                      </div>
                      <button type="button" className="btn btn-secondary" style={{ whiteSpace: 'nowrap', borderColor: '#cbd5e1', color: '#475569', background: '#f8fafc' }} onClick={() => navigate(item.type === 'vocabulary' ? `/vocabulary/${item.id}` : `/exams/${item.id}`)}>
                        {getActionLabel(item)}
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AcademicLayout>
  );
}
