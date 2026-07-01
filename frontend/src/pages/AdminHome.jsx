import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const AdminHome = () => {
  const { user } = useSelector((s) => s.auth);

  // Statistics cards data
  const stats = [
    { title: 'Tổng Số Học Viên', count: '1,248', icon: 'bi-people-fill', color: 'primary', desc: 'Tài khoản hoạt động' },
    { title: 'Tổng Đề Thi', count: '120', icon: 'bi-journal-text', color: 'success', desc: 'Đề thi đã xuất bản' },
    { title: 'Tỉ Lệ Hoàn Thành', count: '87%', icon: 'bi-check2-circle', color: 'info', desc: 'Trung bình học viên' },
    { title: 'Doanh Thu Tháng', count: '15,400,000 đ', icon: 'bi-cash-stack', color: 'warning', desc: 'Thanh toán qua ví điện tử' },
  ];

  return (
    <div className="bg-light min-vh-100 pb-5 pt-4">
      <div className="container-fluid px-4">
        {/* Welcome Section */}
        <div className="row align-items-center mb-5">
          <div className="col">
            <h2 className="fw-bold mb-1">Chào mừng trở lại, {user?.name || 'Admin'}! ⚡</h2>
            <p className="text-muted mb-0">Hệ thống quản trị và vận hành TOEIC Practice</p>
          </div>
          <div className="col-auto">
            <Link to="/admin/users" className="btn btn-primary px-4">
              <i className="bi bi-people me-2"></i>Quản lý tài khoản
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="row g-4 mb-5">
          {stats.map((s, idx) => (
            <div className="col-xl-3 col-md-6" key={idx}>
              <div className="dashboard-card border-0 shadow-sm p-4 h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <span className="text-muted small fw-semibold uppercase">{s.title}</span>
                    <h3 className="fw-bold mb-0 mt-1">{s.count}</h3>
                  </div>
                  <div className={`rounded-circle bg-${s.color} bg-opacity-10 p-3 d-flex align-items-center justify-content-center`} style={{ width: 56, height: 56 }}>
                    <i className={`bi ${s.icon} text-${s.color}`} style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </div>
                <div className="text-muted small mt-2">
                  <i className="bi bi-arrow-up-right text-success me-1"></i>
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="dashboard-card p-4 h-100">
              <h5 className="fw-bold mb-4 border-bottom pb-3">Phím Tắt Quản Trị</h5>
              <div className="list-group list-group-flush">
                <Link to="/admin/users" className="list-group-item list-group-item-action border-0 px-0 d-flex align-items-center justify-content-between py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 text-primary rounded p-2"><i className="bi bi-shield-lock"></i></div>
                    <div>
                      <h6 className="mb-0 fw-bold">Phân Quyền & Bổ Nhiệm</h6>
                      <small className="text-muted">Điều chỉnh vai trò sang Manager hoặc Employee</small>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </Link>
                <Link to="/admin/users" className="list-group-item list-group-item-action border-0 px-0 d-flex align-items-center justify-content-between py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-danger bg-opacity-10 text-danger rounded p-2"><i className="bi bi-lock"></i></div>
                    <div>
                      <h6 className="mb-0 fw-bold">Khóa / Mở Khóa Tài Khoản</h6>
                      <small className="text-muted">Chặn tài khoản vi phạm và hủy phiên đăng nhập</small>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="dashboard-card p-4 h-100">
              <h5 className="fw-bold mb-4 border-bottom pb-3">Lịch Sử Hệ Thống Gần Đây</h5>
              <div className="d-flex flex-column gap-3">
                {[
                  { user: 'Nguyễn Văn A', action: 'đã làm đề thi TOEIC 2024 Test 1', time: '5 phút trước', icon: 'bi-journal-check', color: 'success' },
                  { user: 'Học viên Premium', action: 'đăng ký gói học Premium thành công', time: '12 phút trước', icon: 'bi-credit-card-2-front', color: 'warning' },
                  { user: 'Hệ thống', action: 'tự động gửi mail OTP kích hoạt tài khoản mới', time: '20 phút trước', icon: 'bi-envelope-check', color: 'info' }
                ].map((item, idx) => (
                  <div className="d-flex gap-3 align-items-start" key={idx}>
                    <div className={`bg-${item.color} bg-opacity-10 text-${item.color} rounded-circle p-2 d-flex align-items-center justify-content-center`} style={{ width: 40, height: 40 }}>
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <div>
                      <p className="mb-0 small"><strong>{item.user}</strong> {item.action}</p>
                      <small className="text-muted text-xs">{item.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminHome;
