import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email;

  const [email] = useState(emailFromState || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.verifyOTP({ email, otp });
      
      setMessage('✅ Xác thực tài khoản thành công!');
      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center align-items-center min-vh-100 py-5">
      <div className="col-md-6 col-lg-5">
        <div className="otp-card">
          <div className="otp-header text-center">
            <h4 className="mb-1">Xác thực OTP</h4>
            <p className="mb-0 opacity-90">Kiểm tra email của bạn</p>
          </div>

          <div className="otp-body p-4">
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!success && (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label text-center d-block fw-semibold mb-3">
                    Nhập mã OTP (6 số)
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    className="otp-input form-control text-center fs-3 fw-bold"
                    placeholder="123456"
                    required
                    autoFocus
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-success w-100 py-3 fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                </button>
              </form>
            )}

            {success && (
              <div className="text-center py-5">
                <div className="success-icon mb-4">🎉</div>
                <h4 className="text-success mb-3">Xác thực tài khoản thành công!</h4>
                <a href="/login" className="btn btn-primary w-100 py-3 fw-bold">
                  Đăng nhập ngay
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;