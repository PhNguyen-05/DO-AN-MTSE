import React from 'react';
import { Link } from 'react-router-dom';

/* Trang chủ khách - đơn giản, bên dưới để trống */
const Home = () => (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#e0e7ff 0%,#ede9fe 100%)' }}>
    <div className="container py-5">
      <div className="row align-items-center pt-5 mt-4">
        {/* Left */}
        <div className="col-lg-6 text-center text-lg-start mb-5 mb-lg-0">
          <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2 mb-3">
            🎓 Nền tảng luyện thi TOEIC #1 Việt Nam
          </span>
          <h1 className="display-5 fw-bold mb-4" style={{ lineHeight: 1.2 }}>
            Chinh phục <span className="text-primary-custom">TOEIC</span><br />
            dễ dàng hơn bao giờ hết
          </h1>
          <p className="lead text-muted mb-4">
            Hàng ngàn đề thi thử sát thực tế, hệ thống từ vựng thông minh và phân tích điểm mạnh giúp bạn tiến bộ nhanh chóng.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
            <Link to="/register" className="btn btn-primary btn-lg px-5 shadow">
              <i className="bi bi-rocket-takeoff me-2"></i>Bắt đầu miễn phí
            </Link>
            <Link to="/login" className="btn btn-outline-primary btn-lg px-5">
              Đăng nhập
            </Link>
          </div>

          <div className="d-flex gap-4 mt-4 justify-content-center justify-content-lg-start">
            {[['10K+', 'Học viên'], ['500+', 'Đề thi thử'], ['95%', 'Hài lòng']].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="fw-bold fs-5 text-primary">{n}</div>
                <div className="text-muted small">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - illustration placeholder */}
        <div className="col-lg-6 text-center">
          <div className="p-5 rounded-4 bg-white shadow-lg d-inline-block"
               style={{ maxWidth: 420, width: '100%' }}>
            <i className="bi bi-mortarboard text-primary" style={{ fontSize: '6rem', opacity: .7 }}></i>
            <h4 className="fw-bold mt-3 mb-2">Học tập thông minh</h4>
            <p className="text-muted small mb-0">
              Hệ thống phân tích điểm mạnh, điểm yếu giúp bạn tối ưu hóa thời gian ôn luyện.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Home;
