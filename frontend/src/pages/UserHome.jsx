import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserHome = () => {
  const { user } = useSelector((s) => s.auth);

  const features = [
    { icon: 'bi-journal-text', color: 'primary', title: 'Luyện đề TOEIC', desc: 'Hàng trăm đề thi thử sát thực tế, đầy đủ Listening và Reading.' },
    { icon: 'bi-book', color: 'success', title: 'Học Từ Vựng', desc: 'Từ vựng TOEIC phân loại theo chủ đề, độ khó và Part thi.' },
    { icon: 'bi-bar-chart-line', color: 'info', title: 'Theo dõi tiến độ', desc: 'Xem lại lịch sử thi và thống kê điểm số theo thời gian.' },
  ];

  return (
    <div className="bg-light min-vh-100 pb-5">
      <div className="container py-5">
        {/* Greeting */}
        <div className="row align-items-center mb-5">
          <div className="col">
            <h2 className="fw-bold mb-1">
              Xin chào, <span className="text-primary-custom">{user?.name || 'bạn'}</span> 👋
            </h2>
            <p className="text-muted mb-0">Hôm nay bạn muốn luyện tập gì?</p>
          </div>
          <div className="col-auto">
            <Link to="/profile" className="btn btn-outline-primary">
              <i className="bi bi-person-circle me-1"></i>Hồ sơ của tôi
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="row g-4">
          {features.map((f) => (
            <div className="col-md-4" key={f.title}>
              <div className="dashboard-card h-100 text-center p-4 d-flex flex-column">
                <div className={`mx-auto rounded-circle d-flex align-items-center justify-content-center bg-${f.color} bg-opacity-10 mb-3`}
                     style={{ width: 72, height: 72 }}>
                  <i className={`bi ${f.icon} text-${f.color}`} style={{ fontSize: '2rem' }}></i>
                </div>
                <h5 className="fw-bold mb-2">{f.title}</h5>
                <p className="text-muted small flex-grow-1">{f.desc}</p>
                <button className="btn btn-outline-secondary btn-sm mt-2" disabled>
                  <i className="bi bi-clock me-1"></i>Sắp có
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserHome;
