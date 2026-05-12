import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dateOfBirth: ''
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'password') {
      checkPasswordStrength(e.target.value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength('');
      return;
    }
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (regex.test(password)) {
      setPasswordStrength('✅ Mật khẩu mạnh');
    } else {
      setPasswordStrength('⚠️ Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt');
    }
  };

  const togglePassword = (id) => {
    const input = document.getElementById(id);
    if (input) {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    if (formData.password !== formData.confirmPassword) {
      setErrors([{ msg: "Mật khẩu xác nhận không khớp!" }]);
      setLoading(false);
      return;
    }

    try {
      await api.register(formData);
      alert("Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.");
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại!';
      setErrors([{ msg: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-container">
      
      {/* Bên trái - Ảnh nền */}
      <div 
        className="left-panel"
        style={{
          backgroundImage: `url('/1.png')`,   // ← Đảm bảo tên file là 1.jpg hoặc 1.png
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="overlay"></div>
        <div className="welcome-content">
          <h1>WELCOME</h1>
          <p>Tham gia cộng đồng luyện thi TOEIC</p>
          <p className="lead">Hàng ngàn học viên đang học cùng bạn</p>
        </div>
      </div>

      {/* Bên phải - Form */}
      <div className="right-panel">
        <div className="form-wrapper">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary">Đăng ký tài khoản</h3>
            <p className="text-muted">Tạo tài khoản để bắt đầu hành trình chinh phục TOEIC</p>
          </div>

          {errors.map((err, index) => (
            <div key={index} className="alert alert-danger">{err.msg}</div>
          ))}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Họ và tên <span className="text-danger">*</span></label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Giới tính</label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Ngày sinh</label>
                <input type="date" name="dateOfBirth" className="form-control" value={formData.dateOfBirth} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Email <span className="text-danger">*</span></label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Mật khẩu <span className="text-danger">*</span></label>
              <div className="input-group">
                <input 
                  type="password" 
                  name="password" 
                  id="password" 
                  className="form-control" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
                <button 
                  type="button" 
                  className="btn btn-outline-secondary toggle-password" 
                  onClick={() => togglePassword('password')}
                >
                  <i className="bi bi-eye"></i>
                </button>
              </div>
              {passwordStrength && <small className="text-muted mt-1 d-block">{passwordStrength}</small>}
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Xác nhận mật khẩu <span className="text-danger">*</span></label>
              <div className="input-group">
                <input 
                  type="password" 
                  name="confirmPassword" 
                  id="confirmPassword" 
                  className="form-control" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                />
                <button 
                  type="button" 
                  className="btn btn-outline-secondary toggle-password" 
                  onClick={() => togglePassword('confirmPassword')}
                >
                  <i className="bi bi-eye"></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-3 fw-bold" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
            </button>
          </form>

          <div className="text-center mt-4">
            <p>Đã có tài khoản? 
              <a href="/login" className="text-primary fw-bold ms-1">Đăng nhập ngay</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;