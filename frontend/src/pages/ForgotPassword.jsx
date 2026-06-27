import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { forgotPassword, resetPassword, clearError, clearMessage } from "../redux/authSlice";
import apiInstance from "../utils/axiosInstance";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { loading, error, message } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      if (step === 1 && message.includes("OTP")) {
        setStep(2);
      } else if (step === 3 && message.includes("successful")) {
        setTimeout(() => navigate("/login"), 2000);
      }
    }
  }, [error, message, step, navigate, dispatch]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email) return toast.warning("Vui lòng nhập email.");
    dispatch(forgotPassword({ email }));
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.warning("Vui lòng nhập đúng 6 số OTP.");
    
    try {
      const res = await apiInstance.post("/api/verify-reset-otp", { email, otp });
      if (res.data.success) {
        toast.success("Mã OTP hợp lệ.");
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã OTP không hợp lệ.");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    
    let strength = 0;
    if (value.length >= 8) strength += 25;
    if (/[A-Z]/.test(value)) strength += 25;
    if (/[a-z]/.test(value) && /\d/.test(value)) strength += 25;
    if (/[@$!%*?&]/.test(value)) strength += 25;
    setPasswordStrength(strength);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.warning("Mật khẩu xác nhận không khớp.");
    }
    if (passwordStrength < 100) {
      return toast.warning("Mật khẩu chưa đủ mạnh.");
    }
    dispatch(resetPassword({ email, otp, newPassword }));
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-light";
    if (passwordStrength <= 25) return "bg-danger";
    if (passwordStrength <= 50) return "bg-warning";
    if (passwordStrength <= 75) return "bg-info";
    return "bg-success";
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        {step === 1 && (
          <>
            <div className="text-center mb-4">
              <i className="bi bi-shield-lock text-primary-custom" style={{ fontSize: "3rem" }}></i>
              <h2 className="fw-bold mt-2">Quên Mật Khẩu</h2>
              <p className="text-muted">Nhập email của bạn để nhận mã khôi phục</p>
            </div>
            <form onSubmit={handleSendOtp}>
              <div className="mb-4">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Nhập địa chỉ email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi Mã OTP"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-4">
              <i className="bi bi-envelope-open text-primary-custom" style={{ fontSize: "3rem" }}></i>
              <h2 className="fw-bold mt-2">Nhập Mã OTP</h2>
              <p className="text-muted">Mã đã được gửi đến <strong>{email}</strong></p>
            </div>
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4">
                <label className="form-label fw-semibold">Mã OTP (6 chữ số)</label>
                <input
                  type="text"
                  maxLength="6"
                  className="form-control text-center fs-4 letter-spacing-lg"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Xác Nhận OTP</button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center mb-4">
              <i className="bi bi-key text-primary-custom" style={{ fontSize: "3rem" }}></i>
              <h2 className="fw-bold mt-2">Đặt Lại Mật Khẩu</h2>
              <p className="text-muted">Tạo mật khẩu mới cho tài khoản của bạn</p>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Mật khẩu mới</label>
                <div className="input-group mb-1">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-control border-end-0"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <span 
                    className="input-group-text bg-white"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    <i className={`bi ${showNewPassword ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
                  </span>
                </div>
                {newPassword && (
                  <div className="progress mt-2" style={{ height: "6px" }}>
                    <div 
                      className={`progress-bar ${getStrengthColor()} transition-all`} 
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Xác nhận mật khẩu mới</label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control border-end-0"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span 
                    className="input-group-text bg-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
                  </span>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Đang xử lý..." : "Lưu Mật Khẩu"}
              </button>
            </form>
          </>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-muted text-decoration-none hover-primary">
            <i className="bi bi-arrow-left me-1"></i> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
