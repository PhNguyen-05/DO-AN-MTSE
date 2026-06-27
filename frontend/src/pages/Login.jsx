import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { loginUser, googleLogin, clearError, clearMessage } from "../redux/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error, message, isAuthenticated, user } = useSelector((state) => state.auth);
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
    }
    if (isAuthenticated && user) {
      if (user.role === "Admin") {
        navigate("/admin/home");
      } else if (["Manager", "Employee"].includes(user.role)) {
        navigate("/manager/home");
      } else {
        navigate("/user/home");
      }
    }
  }, [error, message, isAuthenticated, user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.warning("Vui lòng nhập đầy đủ email và mật khẩu.");
    }
    dispatch(loginUser({ email, password }));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin({ idToken: credentialResponse.credential }));
  };

  const handleGoogleError = () => {
    toast.error("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h2 className="text-center fw-bold text-primary-custom mb-4">TOEIC Practice</h2>
        <p className="text-center text-muted mb-4">Đăng nhập để tiếp tục học tập</p>
        
        <form onSubmit={handleSubmit}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="d-flex justify-content-between">
              <label className="form-label fw-semibold">Mật khẩu</label>
              <Link to="/forgot-password" className="text-decoration-none text-primary-custom small">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span 
                className="input-group-text bg-white"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
              </span>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang đăng nhập...</>
            ) : "Đăng Nhập"}
          </button>
        </form>

        <div className="d-flex align-items-center my-4">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted small">HOẶC ĐĂNG NHẬP VỚI</span>
          <hr className="flex-grow-1" />
        </div>

        <div className="d-flex justify-content-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            shape="rectangular"
            theme="outline"
            size="large"
            text="signin_with"
          />
        </div>

        <p className="text-center mb-0 mt-3">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-primary-custom text-decoration-none fw-semibold">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
