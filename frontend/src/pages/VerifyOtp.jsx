import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { verifyOTP, clearError, clearMessage } from "../redux/authSlice";
import apiInstance from "../utils/axiosInstance";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("Không tìm thấy thông tin email. Vui lòng đăng ký lại.");
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      if (message.includes("thành công") || message.includes("successfully")) {
        setTimeout(() => navigate("/login"), 1500);
      }
    }
  }, [error, message, navigate, dispatch]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Allow pasting
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split("");
      for (let i = 0; i < pastedData.length; i++) {
        if (index + i < 6) newOtp[index + i] = pastedData[i];
      }
      setOtp(newOtp);
      const nextEmptyIndex = newOtp.findIndex(val => val === "");
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex].focus();
      } else {
        inputRefs.current[5].focus();
      }
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Auto focus previous input on backspace
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      return toast.warning("Vui lòng nhập đầy đủ 6 số OTP.");
    }
    dispatch(verifyOTP({ email, otp: otpValue }));
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    try {
      setIsResending(true);
      await apiInstance.post("/api/auth/resend-otp", { email, type: "Đăng ký" });
      setTimeLeft(600);
      toast.success("Mã OTP mới đã được gửi đến email của bạn.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể gửi lại OTP. Vui lòng thử lại sau.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="auth-container">
      <div className="glass-card text-center">
        <div className="mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3" style={{ width: "80px", height: "80px" }}>
            <i className="bi bi-envelope-check text-primary-custom" style={{ fontSize: "2.5rem" }}></i>
          </div>
          <h2 className="fw-bold text-primary-custom">Xác Thực Email</h2>
          <p className="text-muted mt-2">
            Mã OTP gồm 6 chữ số đã được gửi đến email<br />
            <strong>{email}</strong>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-center gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="6"
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
                required
              />
            ))}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100 mb-4"
            disabled={loading || otp.join("").length !== 6}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xác thực...</>
            ) : "Xác Thực"}
          </button>
        </form>

        <div className="mt-3">
          <p className="text-muted mb-1">Thời gian còn lại: <span className="fw-bold text-danger">{formatTime(timeLeft)}</span></p>
          <p className="mb-0">
            Chưa nhận được mã?{" "}
            <button 
              className={`btn btn-link p-0 text-decoration-none fw-semibold ${timeLeft > 0 ? "text-muted" : "text-primary-custom"}`}
              onClick={handleResend}
              disabled={timeLeft > 0 || isResending}
            >
              {isResending ? "Đang gửi..." : "Gửi lại OTP"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
