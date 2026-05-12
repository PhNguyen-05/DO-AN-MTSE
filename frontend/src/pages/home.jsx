import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      
      {/* Hero Section */}
      <section 
        className="hero text-center text-white d-flex align-items-center"
        style={{ 
          background: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.75)), url("/2.jpg") center/cover no-repeat',
          minHeight: '85vh',
        }}
      >
        <div className="container">
          <h1 className="display-3 fw-bold mb-4">Chinh Phục TOEIC Cùng Chúng Tôi</h1>
          <p className="lead mb-5 fs-4 opacity-90">
            Nền tảng luyện thi TOEIC hiện đại • Hiệu quả • Khoa học
          </p>
          <div className="d-flex justify-content-center gap-4">
            <Link to="/register" className="btn btn-primary btn-lg px-5 py-3 fw-semibold">
              Bắt đầu ngay
            </Link>
            <Link to="/login" className="btn btn-outline-light btn-lg px-5 py-3 fw-semibold">
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-6">Tại sao nên chọn TOEIC Luyện Thi?</h2>
            <p className="text-muted fs-5">Hành trình chinh phục TOEIC trở nên dễ dàng hơn bao giờ hết</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="text-primary mb-4" style={{fontSize: '3rem'}}>📚</div>
                <h5 className="fw-bold">Ngân hàng đề thi phong phú</h5>
                <p className="text-muted">Hàng ngàn đề thi theo cấu trúc TOEIC mới nhất 2026</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="text-primary mb-4" style={{fontSize: '3rem'}}>📊</div>
                <h5 className="fw-bold">Theo dõi tiến độ thông minh</h5>
                <p className="text-muted">Phân tích chi tiết điểm mạnh - điểm yếu theo từng kỹ năng</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="text-primary mb-4" style={{fontSize: '3rem'}}>🎯</div>
                <h5 className="fw-bold">Lộ trình cá nhân hóa</h5>
                <p className="text-muted">AI xây dựng kế hoạch học tập phù hợp với trình độ của bạn</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5 bg-primary text-white text-center">
        <div className="container">
          <h2 className="display-6 fw-bold mb-4">Sẵn sàng đạt mục tiêu TOEIC của bạn?</h2>
          <Link to="/register" className="btn btn-light btn-lg px-5 py-3 fw-semibold">
            Đăng ký miễn phí ngay hôm nay
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;