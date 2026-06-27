import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AcademicLayout from "../components/AcademicLayout.jsx";
import { api, getApiMessage } from "../services/api.js";
import { useLocation } from 'react-router-dom';
import { getLocalStorage, setLocalStorage } from '../utils/storage.js';

export default function Promotions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [promotions, setPromotions] = useState([]);
  const [usedPromotionCodes, setUsedPromotionCodes] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [copiedCode, setCopiedCode] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizeCode = (code) => String(code || '').trim().toLowerCase();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/api/promotions");
        setPromotions(response.data.promotions || []);
      } catch (err) {
        setError(getApiMessage(err, "Không thể tải dữ liệu khuyến mãi."));
      } finally {
        setLoading(false);
      }
    };

    const used = getLocalStorage('usedPromotions', []);
    const normalizedUsed = Array.isArray(used)
      ? used.map((c) => String(c || '').trim().toLowerCase())
      : [];
    setUsedPromotionCodes(normalizedUsed);
    fetchPromotions();
  }, []);

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "unused", label: "Chưa sử dụng" },
    { id: "used", label: "Đã sử dụng" },
    { id: "expired", label: "Đã hết hạn" }
  ];

  const filteredPromotions = useMemo(() => {
    if (activeTab === "all") return promotions;
    if (activeTab === "unused") {
      return promotions.filter((promo) => {
        const code = normalizeCode(promo.code);
        return promo.status !== 'expired' && !usedPromotionCodes.includes(code);
      });
    }
    if (activeTab === "used") {
      return promotions.filter((promo) => usedPromotionCodes.includes(normalizeCode(promo.code)));
    }
    return promotions.filter((promo) => promo.status === activeTab);
  }, [activeTab, promotions, usedPromotionCodes]);

  const handleCopyCode = async (code, id) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      window.setTimeout(() => setCopiedCode(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <AcademicLayout>
      <div className="promotions-page">
        <section className="academic-panel promotions-header">
          <div>
            <h2>Mã khuyến mãi của bạn</h2>
            <p>Quản lý và sử dụng các mã giảm giá dành riêng cho tài khoản của bạn.</p>
          </div>
        </section>

        {error && <div className="promotions-alert error">{error}</div>}
        {loading && <div className="promotions-alert loading">Đang tải mã khuyến mãi...</div>}

        <div className="promotions-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`promotions-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="promotions-list-wrapper">
          <section className="promotion-grid">
            {filteredPromotions.length === 0 && !loading && !error ? (
              <div className="promotions-empty">
                <p>Hiện chưa có mã khuyến mãi. Vui lòng kiểm tra lại sau.</p>
              </div>
            ) : (
              filteredPromotions.map((promo) => (
                <article key={promo.id} className={`promo-card ${promo.status === "expired" ? "expired" : ""}`}>
                  <div className="promo-card-header">
                    <div>
                      <span className="promo-badge">{usedPromotionCodes.includes(normalizeCode(promo.code)) ? 'Đã sử dụng' : promo.badge}</span>
                      <h3>{promo.title}</h3>
                    </div>
                    {(() => {
                      const isUsed = usedPromotionCodes.includes(normalizeCode(promo.code));
                      const isExpired = promo.status === "expired";
                      return (
                        <span className={`promo-status ${isExpired ? "expired" : isUsed ? "used" : "active"}`}>
                          {isExpired ? "Hết hạn" : isUsed ? "Đã sử dụng" : "Còn hiệu lực"}
                        </span>
                      );
                    })()}
                  </div>

                  <p className="promo-description">{promo.description}</p>
                  <div className="promo-code-row">
                    <div>
                      <div className="promo-code-label">Mã ưu đãi</div>
                      <div className="promo-code-value">{promo.code}</div>
                    </div>
                    <button
                      type="button"
                      className="promo-copy-btn"
                      onClick={() => handleCopyCode(promo.code, promo.id)}
                    >
                      {copiedCode === promo.id ? "Đã sao chép" : "Sao chép"}
                    </button>
                  </div>

                  <div className="promo-info">
                    <div>
                      <span>Giảm giá</span>
                      <strong>{promo.discountText}</strong>
                    </div>
                    <div>
                      <span>Hạn dùng</span>
                      <strong>{promo.expiry}</strong>
                    </div>
                  </div>

                  {promo.details.length > 0 && (
                    <div className="promo-details">
                      {promo.details.map((detail) => (
                        <div key={detail}><i className="bi bi-check2-circle" aria-hidden="true" /> {detail}</div>
                      ))}
                    </div>
                  )}

                  <div className="promo-card-footer">
                    <button
                      type="button"
                      className="promo-action-btn"
                      disabled={promo.status === "expired" || usedPromotionCodes.includes(normalizeCode(promo.code))}
                      onClick={() => {
                        const isUsed = usedPromotionCodes.includes(normalizeCode(promo.code));
                        if (promo.status !== "expired" && !isUsed) {
                          setLocalStorage('selectedPromotion', promo);
                          const params = new URLSearchParams(location.search);
                          const ret = params.get('return');
                          if (ret === 'checkout') navigate('/checkout'); else navigate('/cart');
                        }
                      }}
                    >
                      {promo.status === "expired" ? "Không khả dụng" : usedPromotionCodes.includes(normalizeCode(promo.code)) ? "Đã sử dụng" : "Sử dụng ngay"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </AcademicLayout>
  );
}
