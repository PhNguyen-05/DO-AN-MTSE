import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiInstance from "../utils/axiosInstance";
import { getLocalStorage } from "../utils/storage.js";

const formatVnd = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

function Checkout() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  useEffect(() => {
    const savedItems = getLocalStorage('cart', []);
    if (!savedItems || savedItems.length === 0) {
      toast.info("Giỏ hàng của bạn đang trống.");
      navigate("/cart");
    }
    setItems(savedItems);
  }, [navigate]);

  const [paymentMethod, setPaymentMethod] = useState("VNPay");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0),
    [items]
  );

  if (!items.length && !loading) {
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
        paymentMethod,
        couponCode: couponCode.trim() || undefined
      };

      const res = await apiInstance.post("/api/orders", payload);
      const { order, paymentUrl, discountAmount } = res.data.data;

      if (discountAmount > 0) {
        toast.info(`Đã giảm ${formatVnd(discountAmount)}`);
      }

      localStorage.removeItem('cart');

      if (paymentMethod === "VNPay" && paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      toast.success("Đặt hàng COD thành công. Vui lòng chờ xác nhận thanh toán.");
      navigate("/orders", { state: { highlightOrderId: order._id } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tạo đơn hàng.");
    } finally {
      setLoading(false);
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
                <label className={`border rounded-3 p-3 d-flex align-items-center gap-3 ${paymentMethod === "VNPay" ? "border-primary bg-primary bg-opacity-10" : ""}`}>
                  <input type="radio" name="paymentMethod" value="VNPay" checked={paymentMethod === "VNPay"} onChange={() => setPaymentMethod("VNPay")} />
                  <div>
                    <div className="fw-semibold">VNPay</div>
                    <small className="text-muted">Thanh toán online qua thẻ/QR (sandbox)</small>
                  </div>
                </label>

                <label className={`border rounded-3 p-3 d-flex align-items-center gap-3 ${paymentMethod === "COD" ? "border-primary bg-primary bg-opacity-10" : ""}`}>
                  <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                  <div>
                    <div className="fw-semibold">COD / Thanh toán sau</div>
                    <small className="text-muted">Đơn hàng chờ xác nhận từ quản trị viên</small>
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
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Đang xử lý..." : paymentMethod === "VNPay" ? "Thanh toán VNPay" : "Đặt hàng COD"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
