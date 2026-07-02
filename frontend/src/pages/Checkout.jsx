import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import apiInstance from "../utils/axiosInstance";
import { getLocalStorage } from "../utils/storage.js";
import { updateUser } from "../redux/authSlice";
import { fetchUserPurchasedItems, notifyPurchaseUpdated } from "../utils/purchase";

const formatVnd = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("MoMo");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);

  // States for MoMo Fake QR payment modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const savedItems = getLocalStorage('cart', []);
    if (!savedItems || savedItems.length === 0) {
      toast.info("Giỏ hàng của bạn đang trống.");
      navigate("/cart");
    }
    setItems(savedItems);
  }, [navigate]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0),
    [items]
  );

  if (!items.length && !loading && !showQrModal) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: 560 }}>
        <div className="dashboard-card p-5">
          <i className="bi bi-cart-x text-muted" style={{ fontSize: "3rem" }}></i>
          <h4 className="fw-bold mt-3">Chưa có sản phẩm để thanh toán</h4>
          <p className="text-muted">Hãy chọn đề thi, bộ từ vựng hoặc gói Premium trước khi thanh toán.</p>
          <Link to="/user/home" className="btn btn-primary">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      return toast.warning("Giỏ hàng của bạn đang trống.");
    }
    try {
      setLoading(true);
      const payload = {
        items: items.map((item) => ({
          productType: item.type,
          productId: item.id,
          packageType: item.packageType || "bundle",
          productName: item.title,
          price: item.price
        })),
        paymentMethod: "MoMo", // enforce MoMo for QR payments
        couponCode: couponCode.trim() || undefined
      };

      const res = await apiInstance.post("/api/orders", payload);
      const { order, discountAmount } = res.data.data;

      if (discountAmount > 0) {
        toast.info(`Đã giảm ${formatVnd(discountAmount)}`);
      }

      localStorage.removeItem('cart');
      setActiveOrder(order);
      setShowQrModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tạo đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMockPayment = async () => {
    if (!activeOrder) return;
    try {
      setPaying(true);
      // Trigger the mock payment fulfillment endpoint on backend
      const res = await apiInstance.put(`/api/orders/${activeOrder._id}/mock-pay`);
      const updatedOrder = res.data?.data;

      toast.success("Thanh toán MoMo thành công!");

      // 1. Sync purchased items local storage cache
      try {
        await fetchUserPurchasedItems();
        notifyPurchaseUpdated();
      } catch (e) {
        console.error("Failed to sync purchased items", e);
      }

      // 2. Refresh profile to update accountType in Redux & localStorage
      try {
        const profileRes = await apiInstance.get("/api/profile");
        const profileData = profileRes.data?.data;
        if (profileData) {
          const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
          const updatedUser = { ...existingUser, ...profileData };
          dispatch(updateUser(updatedUser));
        }
      } catch (e) {
        console.error("Failed to update profile", e);
      }

      // 3. Determine redirection
      const hasPremiumItem = updatedOrder?.items?.some(
        (item) =>
          item.productType === "Gói Premium" ||
          item.packageType === "premium" ||
          String(item.productName || "").toLowerCase().includes("premium")
      );

      setShowQrModal(false);
      if (hasPremiumItem) {
        navigate("/premium-dashboard");
      } else {
        navigate("/orders", { state: { highlightOrderId: updatedOrder?._id } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xác nhận thanh toán giả lập.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container" style={{ maxWidth: 960 }}>
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/user/home" className="text-decoration-none">Trang chủ</Link></li>
            <li className="breadcrumb-item"><Link to="/cart" className="text-decoration-none">Giỏ hàng</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Thanh toán</li>
          </ol>
        </nav>

        <form onSubmit={handleSubmit} className="row g-4">
          <div className="col-lg-7">
            <div className="dashboard-card p-4">
              <h5 className="fw-bold mb-4"><i className="bi bi-credit-card me-2"></i>Phương thức thanh toán</h5>

              <div className="d-flex flex-column gap-3">
                <label className="border rounded-3 p-3 d-flex align-items-center gap-3 border-primary bg-primary bg-opacity-10" style={{ cursor: "pointer" }}>
                  <input type="radio" name="paymentMethod" value="MoMo" checked={true} readOnly style={{ accentColor: "#d82d8b" }} />
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: "#a50064", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "0.85rem" }}>MoMo</div>
                    <div>
                      <div className="fw-semibold">Ví MoMo (Quét mã QR chuyển khoản)</div>
                      <small className="text-muted">Quét mã QR bằng ứng dụng MoMo của bạn để chuyển khoản</small>
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-4">
                <label className="form-label fw-semibold">Mã giảm giá (tùy chọn)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã giảm giá"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="dashboard-card p-4">
              <h5 className="fw-bold mb-3">Đơn hàng</h5>
              <div className="d-flex flex-column gap-3 mb-3">
                {items.map((item) => (
                  <div key={`${item.id}`} className="d-flex justify-content-between gap-3">
                    <div>
                      <div className="fw-semibold">{item.title}</div>
                      <small className="text-muted">{item.type}{item.packageType ? ` • ${item.packageType}` : ""}</small>
                    </div>
                    <div className="fw-semibold text-nowrap">{formatVnd(item.price)}</div>
                  </div>
                ))}
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold">Tổng thanh toán</span>
                <span className="fw-bold text-primary">{formatVnd(subtotal)}</span>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading} style={{ background: "linear-gradient(135deg, #a50064, #d82d8b)", border: "none" }}>
                {loading ? "Đang xử lý..." : "Thanh toán bằng MoMo (Mã QR)"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* MoMo QR Code Payment Modal */}
      {showQrModal && activeOrder && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <div className="dashboard-card p-0" style={{ maxWidth: 440, width: "100%", overflow: "hidden", borderRadius: 16 }}>
            {/* Header */}
            <div style={{ background: "#a50064", color: "#fff", padding: "20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "#fff", color: "#a50064", width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.85rem" }}>MoMo</div>
              <div>
                <h6 style={{ margin: 0, fontWeight: 700 }}>Thanh toán qua Ví MoMo</h6>
                <small style={{ opacity: 0.85 }}>Mã đơn hàng: {activeOrder.orderCode}</small>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "0 0 16px" }}>
                Mở ứng dụng <strong>MoMo</strong> và quét mã QR bên dưới để chuyển khoản thanh toán.
              </p>

              {/* QR Image Container */}
              <div style={{
                background: "#f8fafc", padding: "16px", borderRadius: 12, display: "inline-block",
                border: "1px solid #e2e8f0", marginBottom: 20
              }}>
                <img
                  src={`https://img.vietqr.io/image/momo-0969696969-compact2.png?amount=${activeOrder.totalAmount}&addInfo=TOEIC%20${activeOrder.orderCode}`}
                  alt="MoMo QR Code"
                  style={{ width: 220, height: 220, display: "block" }}
                />
              </div>

              {/* Payment Details */}
              <div style={{ textAlign: "left", background: "#f1f5f9", padding: "14px 18px", borderRadius: 10, fontSize: "0.88rem", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748b" }}>Số điện thoại nhận:</span>
                  <strong style={{ color: "#0f172a" }}>0969 696 969</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748b" }}>Chủ tài khoản:</span>
                  <strong style={{ color: "#0f172a" }}>TRUNG TÂM TOEIC</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748b" }}>Số tiền:</span>
                  <strong style={{ color: "#d82d8b", fontSize: "1.05rem" }}>{formatVnd(activeOrder.totalAmount)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>Nội dung chuyển khoản:</span>
                  <strong style={{ color: "#0f172a" }}>{activeOrder.orderCode}</strong>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  disabled={paying}
                  onClick={handleConfirmMockPayment}
                  style={{ background: "linear-gradient(135deg, #a50064, #d82d8b)", border: "none", padding: "11px" }}
                >
                  {paying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang xử lý giao dịch...
                    </>
                  ) : "Tôi đã hoàn thành chuyển khoản"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  disabled={paying}
                  onClick={() => setShowQrModal(false)}
                  style={{ padding: "11px" }}
                >
                  Hủy giao dịch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
