import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context';
import { useState } from 'react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/">
          <span className="me-2">📘</span>
          TOEIC Luyện Thi
        </Link>

        <button 
          className="navbar-toggler" 
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item"><Link className="nav-link" to="/">Trang chủ</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/courses">Khóa học</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/practice">Luyện thi</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/blog">Blog</Link></li>

            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-light d-flex align-items-center" href="#" data-bs-toggle="dropdown">
                  👤 {user?.name || 'Học viên'}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">Hồ sơ</Link></li>
                  <li><Link className="dropdown-item" to="/dashboard">Dashboard</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}>Đăng xuất</button></li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Đăng nhập</Link></li>
                <li className="nav-item ms-2">
                  <Link className="btn btn-light fw-semibold px-4" to="/register">Đăng ký</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;