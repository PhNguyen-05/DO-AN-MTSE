import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { resolveMediaUrl, getAvatarFallback } from '../../utils/mediaUrl';

/* ─────────────────────────────────────────────
   AdminHeader: dùng khi đã đăng nhập là Admin/Manager/Employee
   Màu tối, góc phải: Quản Lý User (chỉ Admin) + Avatar → dropdown
───────────────────────────────────────────── */
const AdminHeader = () => {
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

  const avatarSrc = resolveMediaUrl(user?.avatarUrl) || getAvatarFallback(user?.name || 'A', 40);

  const roleColors = { Admin: 'danger', Manager: 'warning', Employee: 'info' };
  const badgeColor = roleColors[user?.role] || 'secondary';

  const homePath = user?.role === 'Admin' ? '/admin/dashboard' : '/manager/dashboard';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm"
         style={{ background: 'linear-gradient(90deg,#4f46e5,#7c3aed)' }}>
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold fs-5" to={homePath}>
          <i className="bi bi-speedometer2 me-2 text-warning"></i>
          <span className="text-white">TOEIC Practice</span>
          <span className="text-warning ms-1">Workspace</span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#adminNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="adminNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to={homePath}>Trang Chủ</Link>
            </li>
          </ul>

          {/* Badge role + Quản Lý User (chỉ Admin) + Avatar + Dropdown */}
          <div className="d-flex align-items-center gap-3">
            <span className={`badge bg-${badgeColor} px-3 py-2 d-none d-md-inline`}>{user?.role}</span>

            {user?.role === 'Admin' && (
              <Link to="/admin/users" className="btn btn-warning text-dark fw-bold btn-sm shadow-sm px-3">
                <i className="bi bi-people-fill me-1"></i>Quản Lý User
              </Link>
            )}

            <div className="position-relative" ref={dropRef}>
              <button
                className="btn p-0 border-0 bg-transparent d-flex align-items-center gap-2"
                onClick={() => setOpen(!open)}
              >
                <span className="text-white fw-medium d-none d-md-inline">{user?.name || 'Admin'}</span>
                <img src={avatarSrc} alt="avatar"
                     className="rounded-circle border border-2 border-warning"
                     style={{ width: 40, height: 40, objectFit: 'cover' }} />
                <i className={`bi bi-chevron-${open ? 'up' : 'down'} text-white`}></i>
              </button>

              {open && (
                <ul className="dropdown-menu dropdown-menu-end show shadow mt-2 animate__animated animate__fadeIn"
                    style={{ minWidth: 200, right: 0, left: 'auto', position: 'absolute' }}>
                  <li className="px-3 py-2 text-muted small border-bottom">{user?.email}</li>
                  <li>
                    <Link className="dropdown-item py-2" to="/admin/profile" onClick={() => setOpen(false)}>
                      <i className="bi bi-person-circle me-2 text-primary"></i>Hồ sơ của tôi
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/admin/profile/edit" onClick={() => setOpen(false)}>
                      <i className="bi bi-pencil-square me-2 text-secondary"></i>Chỉnh sửa hồ sơ
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
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

export default AdminHeader;
