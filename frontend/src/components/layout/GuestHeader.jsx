import React from 'react';
import { Link } from 'react-router-dom';
import { TopCartLink, TopMainNav } from './MainNavLinks.jsx';

const GuestHeader = () => (
  <nav className="navbar navbar-expand-xl navbar-dark shadow-sm toeic-main-header">
    <div className="container">
      <Link className="navbar-brand fw-bold fs-4" to="/">
        <i className="bi bi-journal-bookmark-fill me-2" aria-hidden="true" />
        TOEIC Practice
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#guestNav"
        aria-controls="guestNav"
        aria-expanded="false"
        aria-label="Mở menu"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="guestNav">
        <TopMainNav />
        <div className="toeic-main-actions">
          <TopCartLink />
          <Link to="/login" className="btn btn-light text-primary fw-semibold px-4">
            <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true" />
            Đăng Nhập
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

export default GuestHeader;
