import React from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────
   GuestHeader: chỉ hiển thị khi CHƯA đăng nhập
   Góc phải: nút DĂng nhập duy nhất
───────────────────────────────────────────── */
const GuestHeader = () => (
  <nav className="navbar navbar-expand-lg navbar-dark shadow-sm"
       style={{ background: 'linear-gradient(90deg,#4f46e5,#7c3aed)' }}>
    <div className="container">
      <Link className="navbar-brand fw-bold fs-4" to="/">
        <i className="bi bi-journal-bookmark-fill me-2"></i>TOEIC Practice
      </Link>

      <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
              data-bs-target="#guestNav" aria-controls="guestNav" aria-expanded="false">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="guestNav">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">Trang Chủ</Link>
          </li>
        </ul>
        {/* Chỉ 1 nút duy nhất: Đăng nhập */}
        <Link to="/login" className="btn btn-light text-primary fw-semibold px-4">
          <i className="bi bi-box-arrow-in-right me-1"></i>Đăng Nhập
        </Link>
      </div>
    </div>
  </nav>
);

export default GuestHeader;
