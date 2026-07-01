
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { registerUser, googleLogin, clearError, clearMessage } from "../redux/authSlice";

const Register = () => {
  const [formData, setFormData] = useState({

    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { loading, error, message, isAuthenticated, pendingVerificationEmail } = useSelector((state) => state.auth);
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
      if (message.includes("OTP") || message.includes("email") || message.includes("kiểm tra")) {
        const verifyEmail = pendingVerificationEmail || formData.email.trim().toLowerCase();
        navigate("/verify-otp", { state: { email: verifyEmail } });
      }
    }
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [error, message, isAuthenticated, navigate, dispatch, formData.email, pendingVerificationEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Calculate password strength
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[a-z]/.test(value) && /\d/.test(value)) strength += 25;
      if (/[@$!%*?&]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.warning("Mật khẩu xác nhận không khớp.");
    }
    if (passwordStrength < 100) {
      return toast.warning("Mật khẩu chưa đủ mạnh. Cần ít nhất 8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt.");
    }
    dispatch(registerUser(formData));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin({ idToken: credentialResponse.credential }));
  };

  const handleGoogleError = () => {
    toast.error("Đăng ký bằng Google thất bại. Vui lòng thử lại.");
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
        <h2 className="text-center fw-bold text-primary-custom mb-4">Tạo Tài Khoản</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Họ và tên</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Nhập họ và tên"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="Nhập địa chỉ email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label fw-semibold">Mật khẩu</label>
            <div className="input-group mb-1">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="Nhập mật khẩu"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span 
                className="input-group-text bg-white"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
              </span>
            </div>
            {formData.password && (
              <div className="progress mt-2" style={{ height: "6px" }}>
                <div 
                  className={`progress-bar ${getStrengthColor()} transition-all`} 
                  role="progressbar" 
                  style={{ width: `${passwordStrength}%` }}
                ></div>
              </div>
            )}
            <small className="text-muted mt-1 d-block" style={{ fontSize: "0.75rem" }}>
              Cần ít nhất 8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt.
            </small>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Xác nhận mật khẩu</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="Nhập lại mật khẩu"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
          
          <button 
            type="submit" 
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xử lý...</>
            ) : "Đăng Ký"}
          </button>
        </form>

        <div className="d-flex align-items-center my-4">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted small">HOẶC</span>
          <hr className="flex-grow-1" />
        </div>

        <div className="d-flex justify-content-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="rectangular"
            theme="outline"
            size="large"
            text="signup_with"
          />
        </div>

        <p className="text-center mb-0 mt-3">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-primary-custom text-decoration-none fw-semibold">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};


export default Register;
