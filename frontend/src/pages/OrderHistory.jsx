import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiInstance from "../utils/axiosInstance";

const statusBadge = {
  SUCCESS: "bg-success",
  PENDING: "bg-warning text-dark",
  FAILED: "bg-danger"
};

const formatVnd = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiInstance
      .get("/api/orders/my-orders")
      .then((res) => setOrders(res.data.data || []))
      .catch(() => toast.error("Không thể tải lịch sử mua hàng."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container" style={{ maxWidth: 900 }}>
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/user/home" className="text-decoration-none">Trang chủ</Link></li>
            <li className="breadcrumb-item active">Lịch sử mua hàng</li>
          </ol>
        </nav>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Lịch sử mua hàng</h4>
          <Link to="/user/home" className="btn btn-outline-primary btn-sm">Tiếp tục mua</Link>
        </div>

        {orders.length === 0 ? (
          <div className="dashboard-card text-center p-5">
            <i className="bi bi-receipt text-muted" style={{ fontSize: "3rem" }}></i>
            <p className="text-muted mt-3 mb-0">Bạn chưa có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => (
              <div key={order._id} className="dashboard-card p-4">
                <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                  <div>
                    <div className="fw-bold">{order.orderCode}</div>
                    <small className="text-muted">
                      {new Date(order.createdAt).toLocaleString("vi-VN")} • {order.paymentMethod}
                    </small>
                  </div>
                  <div className="text-end">
                    <span className={`badge ${statusBadge[order.paymentStatus] || "bg-secondary"}`}>
                      {order.paymentStatus}
                    </span>
                    <div className="fw-bold text-primary mt-1">{formatVnd(order.totalAmount)}</div>
                  </div>
                </div>

                <div className="border-top pt-3">
                  {(order.items || []).map((item) => (
                    <div key={item._id} className="d-flex justify-content-between small py-1">
                      <span>{item.productName || item.productType}</span>
                      <span>{formatVnd(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;
