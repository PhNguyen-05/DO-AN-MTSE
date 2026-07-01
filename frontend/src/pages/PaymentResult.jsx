import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import apiInstance from "../utils/axiosInstance";

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const txnRef = searchParams.get("vnp_TxnRef");
    const responseCode = searchParams.get("vnp_ResponseCode");

    if (!txnRef) {
      setStatus("failed");
      return;
    }

    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    apiInstance
      .get("/api/orders/vnpay/return", { params })
      .then(() => setStatus(responseCode === "00" ? "success" : "failed"))
      .catch(() => setStatus(responseCode === "00" ? "success" : "failed"));
  }, [searchParams]);

  const amount = Number(searchParams.get("vnp_Amount") || 0) / 100;

  return (
    <div className="auth-container">
      <div className="glass-card text-center" style={{ maxWidth: 520 }}>
        {status === "loading" && (
          <>
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="text-muted mb-0">Đang xử lý kết quả thanh toán...</p>
          </>
        )}

        {status === "success" && (
          <>
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
            <h3 className="fw-bold mt-3 text-success">Thanh toán thành công</h3>
            <p className="text-muted">Mã giao dịch: <strong>{searchParams.get("vnp_TxnRef")}</strong></p>
            <p className="text-muted">Số tiền: <strong>{amount.toLocaleString("vi-VN")} đ</strong></p>
            <div className="d-flex gap-2 justify-content-center mt-4">
              <button className="btn btn-primary" onClick={() => navigate("/orders")}>Xem đơn hàng</button>
              <Link to="/user/home" className="btn btn-outline-primary">Về trang chủ</Link>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: "4rem" }}></i>
            <h3 className="fw-bold mt-3 text-danger">Thanh toán thất bại</h3>
            <p className="text-muted">
              Mã lỗi: <strong>{searchParams.get("vnp_ResponseCode") || "Không xác định"}</strong>
            </p>
            <div className="d-flex gap-2 justify-content-center mt-4">
              <Link to="/checkout" className="btn btn-primary">Thử lại</Link>
              <Link to="/user/home" className="btn btn-outline-secondary">Về trang chủ</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentResult;
