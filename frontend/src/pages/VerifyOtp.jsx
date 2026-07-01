import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyOTP } from '../redux/authSlice.js';

const OTP_LENGTH = 6;

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const emailFromState = location.state?.email;
  const emailFromQuery = searchParams.get('email');
  const email = emailFromState || emailFromQuery || '';

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  // Auto-focus ô đầu tiên
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Đếm ngược resend
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const otp = digits.join('');

  const handleChange = (index, value) => {
    // Chỉ chấp nhận số
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError('');

    // Tự động focus ô tiếp theo
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // Xoá ký tự hiện tại
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        // Focus ô trước
        inputRefs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Xử lý paste toàn bộ OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setError('Vui lòng nhập đủ 6 chữ số.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await dispatch(verifyOTP({ email, otp }));
      if (result.meta?.requestStatus === 'fulfilled') {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.payload || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
        // Xoá các ô và focus lại ô đầu
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Mã OTP không hợp lệ hoặc đã hết hạn!');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'register' })
      });
      if (res.ok) {
        setCountdown(60);
        setCanResend(false);
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        const data = await res.json();
        setError(data.message || 'Không thể gửi lại OTP.');
      }
    } catch {
      setError('Không thể gửi lại OTP. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="glass-card text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 className="fw-bold text-success mb-2">Xác thực thành công!</h2>
          <p className="text-muted mb-4">Tài khoản đã được kích hoạt. Đang chuyển hướng...</p>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="glass-card">
        {/* Header */}
        <div className="text-center mb-4">
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 15px rgba(79,70,229,0.35)'
          }}>
            <i className="bi bi-shield-lock-fill text-white fs-4"></i>
          </div>
          <h2 className="fw-bold mb-1" style={{ color: '#1f2937' }}>Xác thực OTP</h2>
          <p className="text-muted small mb-1">Mã OTP đã được gửi đến</p>
          <p className="fw-semibold mb-0" style={{ color: '#4f46e5' }}>{email}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger py-2 small mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-semibold d-block text-center mb-3">
              Nhập mã OTP (6 chữ số)
            </label>

            {/* 6 ô OTP riêng biệt */}
            <div className="d-flex justify-content-center gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  style={{
                    width: 52,
                    height: 60,
                    textAlign: 'center',
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    borderRadius: 12,
                    border: digit
                      ? '2px solid #4f46e5'
                      : '2px solid #d1d5db',
                    outline: 'none',
                    background: digit ? '#eef2ff' : '#fff',
                    color: '#4f46e5',
                    transition: 'all 0.15s ease',
                    boxShadow: digit ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                    caretColor: 'transparent'
                  }}
                />
              ))}
            </div>

            <div className="text-center mt-3">
              <small className="text-muted">
                Mã OTP có hiệu lực trong <strong>5 phút</strong>
              </small>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading || otp.length !== OTP_LENGTH}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xác thực...</>
            ) : 'Xác thực OTP'}
          </button>
        </form>

        {/* Resend */}
        <div className="text-center mb-3">
          <small className="text-muted">Không nhận được mã? </small>
          {canResend ? (
            <button
              type="button"
              className="btn btn-link btn-sm p-0 fw-semibold text-decoration-none"
              style={{ color: '#4f46e5' }}
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Đang gửi...</>
              ) : 'Gửi lại OTP'}
            </button>
          ) : (
            <small className="text-muted">
              Gửi lại sau <span className="fw-semibold" style={{ color: '#4f46e5' }}>{countdown}s</span>
            </small>
          )}
        </div>

        <p className="text-center mb-0">
          <Link to="/register" className="text-decoration-none fw-semibold small" style={{ color: '#4f46e5' }}>
            <i className="bi bi-arrow-left me-1"></i>Quay lại đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;