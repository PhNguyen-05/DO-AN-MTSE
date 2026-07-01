import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../redux/authSlice.js";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notice, setNotice] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);
    dispatch(clearError());

    try {
      const result = await dispatch(registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      }));

      if (result.type === registerUser.fulfilled.type) {
        setNotice({
          type: "success",
          message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP."
        });
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`, {
            state: { email: form.email }
          });
        }, 1000);
      }
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h2 className="text-center fw-bold text-primary-custom mb-2">TOEIC Practice</h2>
        <p className="text-center text-muted mb-4">Tạo tài khoản để bắt đầu học tập</p>

        {error && (
          <div className="alert alert-danger py-2 small mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
        {notice && (
          <div className={`alert alert-${notice.type} py-2 small mb-3`}>
            <i className={`bi ${notice.type === "success" ? "bi-check-circle" : "bi-exclamation-triangle"} me-2`}></i>
            {notice.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Họ và tên */}
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
                value={form.name}
                onChange={updateField}
                required
              />
            </div>
          </div>

          {/* Email */}
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
                value={form.email}
                onChange={updateField}
                required
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Mật khẩu</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="Nhập mật khẩu"
                name="password"
                value={form.password}
                onChange={updateField}
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
          </div>

          {/* Xác nhận mật khẩu */}
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
                value={form.confirmPassword}
                onChange={updateField}
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
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang đăng ký...</>
            ) : "Đăng Ký"}
          </button>
        </form>

        <p className="text-center mb-0 mt-3">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-primary-custom text-decoration-none fw-semibold">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
