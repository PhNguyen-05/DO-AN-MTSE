import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { resolveMediaUrl, getAvatarFallback } from '../../utils/mediaUrl';
import { TopCartLink, TopMainNav } from './MainNavLinks.jsx';

const UserHeader = () => {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const avatarSrc = resolveMediaUrl(user?.avatarUrl) || getAvatarFallback(user?.name || 'U', 40);

  return (
    <nav className="navbar navbar-expand-xl navbar-dark shadow-sm toeic-main-header">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/user/home">
          <i className="bi bi-journal-bookmark-fill me-2" aria-hidden="true" />
          TOEIC Practice
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#userNav"
          aria-controls="userNav"
          aria-expanded="false"
          aria-label="Mở menu"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="userNav">
          <TopMainNav homeTo="/user/home" />
          <div className="toeic-main-actions">
            <TopCartLink />
            <div className="position-relative" ref={dropRef}>
              <button
                type="button"
                className="btn p-0 border-0 bg-transparent d-flex align-items-center gap-2"
                onClick={() => setOpen(!open)}
              >
                <span className="text-white fw-medium d-none d-md-inline">{user?.name || 'User'}</span>
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="rounded-circle border border-2 border-white"
                  style={{ width: 40, height: 40, objectFit: 'cover' }}
                />
                <i className={`bi bi-chevron-${open ? 'up' : 'down'} text-white`} aria-hidden="true" />
              </button>

              {open && (
                <ul
                  className="dropdown-menu dropdown-menu-end show shadow mt-2 animate__animated animate__fadeIn"
                  style={{ minWidth: 200, right: 0, left: 'auto', position: 'absolute' }}
                >
                  <li className="px-3 py-2 text-muted small border-bottom">{user?.email}</li>
                  <li>
                    <Link className="dropdown-item py-2" to="/orders" onClick={() => setOpen(false)}>
                      <i className="bi bi-receipt me-2 text-success" aria-hidden="true" />
                      Lịch sử mua hàng
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/favorites" onClick={() => setOpen(false)}>
                      <i className="bi bi-heart me-2 text-danger" aria-hidden="true" />
                      Yêu thích
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/profile" onClick={() => setOpen(false)}>
                      <i className="bi bi-person-circle me-2 text-primary" aria-hidden="true" />
                      Hồ sơ của tôi
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/profile/edit" onClick={() => setOpen(false)}>
                      <i className="bi bi-pencil-square me-2 text-secondary" aria-hidden="true" />
                      Chỉnh sửa hồ sơ
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger" type="button" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserHeader;
