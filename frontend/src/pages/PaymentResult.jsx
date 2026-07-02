import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import apiInstance from "../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { updateUser } from "../redux/authSlice";
import { fetchUserPurchasedItems, notifyPurchaseUpdated } from "../utils/purchase";

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [status, setStatus] = useState("loading");
  const [isPremium, setIsPremium] = useState(false);
  const [countdown, setCountdown] = useState(5);

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
      .then(async (res) => {
        const order = res.data?.data;
        if (responseCode === "00" && order) {
          setStatus("success");
          
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

          // 3. Check if the order contains a Premium Package
          const hasPremiumItem = order.items?.some(
            (item) =>
              item.productType === "Gói Premium" ||
              item.packageType === "premium" ||
              String(item.productName || "").toLowerCase().includes("premium")
          );

          if (hasPremiumItem) {
            setIsPremium(true);
          }
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [searchParams, dispatch]);

  // Handle countdown redirection for premium purchase
  useEffect(() => {
    if (status === "success" && isPremium) {
      if (countdown <= 0) {
        navigate("/premium-dashboard");
        return;
      }
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, isPremium, countdown, navigate]);

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
            <h3 className="fw-bold mt-3 text-success">
              {isPremium ? "Đăng ký Premium thành công!" : "Thanh toán thành công"}
            </h3>
            <p className="text-muted">Mã giao dịch: <strong>{searchParams.get("vnp_TxnRef")}</strong></p>
            <p className="text-muted">Số tiền: <strong>{amount.toLocaleString("vi-VN")} đ</strong></p>
            
            {isPremium ? (
              <div className="alert alert-info mt-3 py-2">
                Hệ thống sẽ tự động đưa bạn đến trang chủ Premium sau <strong>{countdown}</strong> giây...
              </div>
            ) : null}

            <div className="d-flex gap-2 justify-content-center mt-4">
              {isPremium ? (
                <button className="btn btn-primary" onClick={() => navigate("/premium-dashboard")}>
                  Vào Premium Dashboard ngay
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => navigate("/orders")}>
                  Xem đơn hàng
                </button>
              )}
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
