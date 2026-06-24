import React, { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";

export default function AcademicLayout({ children, onSearch, searchValue }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [localQuery, setLocalQuery] = useState(searchValue || "");
  const debounceRef = useRef(null);

  useEffect(() => {
    if (typeof searchValue !== 'undefined') setLocalQuery(searchValue || "");
  }, [searchValue]);

  const triggerOnSearch = (q, immediate = false) => {
    if (typeof onSearch !== 'function') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (immediate) {
      onSearch(q);
      return;
    }
    debounceRef.current = setTimeout(() => onSearch(q), 300);
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <div className="academic-shell">
      <aside className="academic-sidebar">
        <div className="academic-brand">
          <div className="academic-brand-mark"><i className="bi bi-book" /></div>
          <div>
            <h1>Academic Hub</h1>
            <p>TOEIC Preparation</p>
          </div>
        </div>

        <nav className="academic-side-nav" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}><i className="bi bi-house" /> Trang chủ</NavLink>
          <NavLink to="/exams" className={({ isActive }) => (isActive ? "active" : "")}><i className="bi bi-journal-text" /> Đề thi</NavLink>
          <NavLink to="/vocabulary" className={({ isActive }) => (isActive ? "active" : "")}><i className="bi bi-bookmark" /> Từ vựng</NavLink>
          <NavLink to="/promotions" className={({ isActive }) => (isActive ? "active" : "")}><i className="bi bi-megaphone" /> Khuyến mãi</NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? "active" : "")}><i className="bi bi-cart" /> Giỏ hàng</NavLink>
          <NavLink to="/blog" className={({ isActive }) => (isActive ? "active" : "")}><i className="bi bi-newspaper" /> Bài viết tin tức</NavLink>
        </nav>

        <div className="academic-auth-stack">
          {isAuthenticated ? (
            <div className="academic-member-chip">
              <span>Xin chào</span>
              <strong>{user?.name || 'Thành viên'}</strong>
            </div>
          ) : (
            <div style={{ height: 84 }} />
          )}
        </div>
      </aside>

      <header className="academic-topbar">
        <div className="academic-global-search" role="search">
          <i
            className="bi bi-search"
            role="button"
            tabIndex={0}
            aria-label="Thực hiện tìm kiếm"
            onClick={() => triggerOnSearch(localQuery, true)}
            onKeyDown={(e) => { if (e.key === 'Enter') triggerOnSearch(localQuery, true); }}
          />
          <input
            placeholder="Tìm kiếm tài liệu, khóa học..."
            aria-label="Tìm kiếm"
            value={localQuery}
            onChange={(e) => { setLocalQuery(e.target.value); triggerOnSearch(e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); triggerOnSearch(localQuery, true); } }}
          />
        </div>

        <div className="academic-top-actions">
          <button aria-label="Thông báo"><i className="bi bi-bell" /></button>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="academic-top-login">Đăng nhập</Link>
              <Link to="/register" className="academic-top-register">Đăng ký</Link>
            </>
          ) : (
            <div className="academic-avatar-container" ref={menuRef}>
              <div className="academic-avatar" title={user?.name || 'Tài khoản'} onClick={() => setMenuOpen((v) => !v)}>
                {user?.avatar ? <img src={user.avatar} alt={user?.name || 'avatar'} /> : (user?.name || 'U').slice(0,1)}
              </div>
              {menuOpen && (
                <div className="academic-avatar-menu" role="menu" aria-label="Menu tài khoản">
                  <div className="avatar-menu-header">
                    <div className="avatar-menu-photo">{user?.avatar ? <img src={user.avatar} alt={user?.name || 'avatar'} /> : (user?.name || 'U').slice(0,1)}</div>
                    <div className="avatar-menu-info">
                      <strong>{user?.name || 'Thành viên'}</strong>
                      <div className="avatar-menu-email">{user?.email}</div>
                    </div>
                  </div>
                  <Link to="/profile" className="avatar-menu-item" onClick={() => setMenuOpen(false)}>
                    <i className="bi bi-person-circle avatar-menu-icon" aria-hidden="true" />
                    <span> Profile</span>
                  </Link>
                  <Link to="/favorites" className="avatar-menu-item" onClick={() => setMenuOpen(false)}>
                    <i className="bi bi-heart avatar-menu-icon" aria-hidden="true" />
                    <span> Yêu thích</span>
                  </Link>
                  <button type="button" className="avatar-menu-item avatar-menu-logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right avatar-menu-icon" aria-hidden="true" />
                    <span> Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="academic-main">
        <div className="academic-content">{children}</div>
      </main>
    </div>
  );
}
