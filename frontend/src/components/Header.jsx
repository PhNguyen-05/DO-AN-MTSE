import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { hasPremiumAccess } from '../utils/storage.js';

export default function Header({ onSearch, searchValue }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [localQuery, setLocalQuery] = useState(searchValue || '');
  const debounceRef = useRef(null);
  const isPremiumUser = useMemo(() => typeof window !== 'undefined' && hasPremiumAccess(), []);

  useEffect(() => {
    if (typeof searchValue !== 'undefined') setLocalQuery(searchValue || '');
  }, [searchValue]);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const triggerOnSearch = (q, immediate = false) => {
    const query = String(q || '').trim();
    if (typeof onSearch === 'function') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (immediate) {
        onSearch(query);
      } else {
        debounceRef.current = setTimeout(() => onSearch(query), 300);
      }
    }

    if (immediate && query && !isHomePage) {
      navigate(`/?keyword=${encodeURIComponent(query)}#products`);
      return;
    }

    if (immediate && query && isHomePage) {
      window.location.hash = 'products';
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="academic-topbar">
      <div className="academic-topbar-row">
        <div className="academic-brand">
          <div className="academic-brand-mark"><i className="bi bi-book" /></div>
          <div>
            <h1>Academic Hub</h1>
            <p>TOEIC Preparation</p>
          </div>
        </div>

        <nav className="academic-side-nav academic-top-nav" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}><i className="bi bi-house" /> Trang chủ</NavLink>
          <NavLink to="/exams" className={({ isActive }) => (isActive ? 'active' : '')}><i className="bi bi-journal-text" /> Đề thi</NavLink>
          <NavLink to="/vocabulary" className={({ isActive }) => (isActive ? 'active' : '')}><i className="bi bi-bookmark" /> Từ vựng</NavLink>
          <NavLink to="/promotions" className={({ isActive }) => (isActive ? 'active' : '')}><i className="bi bi-megaphone" /> Khuyến mãi</NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'active' : '')}><i className="bi bi-cart" /> Giỏ hàng</NavLink>
          <NavLink to="/blog" className={({ isActive }) => (isActive ? 'active' : '')}><i className="bi bi-newspaper" /> Bài viết tin tức</NavLink>
          <NavLink to="/practice" className={({ isActive }) => (isActive ? 'active' : '')}><i className="bi bi-play-btn" /> Luyện tập</NavLink>
          <NavLink to="/premium" className={({ isActive }) => (isActive ? 'active' : '')}><i className="bi bi-stars" /> Gói Premium</NavLink>
        </nav>

        <div className="academic-top-actions">
          <button aria-label="Thông báo"><i className="bi bi-bell" /></button>
          {isAuthenticated && (
            <div className="academic-member-chip">
              <span>Xin chào</span>
              <strong>{(user?.name || 'Thành viên') + (isPremiumUser ? ' (premium)' : '')}</strong>
            </div>
          )}

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="academic-top-login">Đăng nhập</Link>
              <Link to="/register" className="academic-top-register">Đăng ký</Link>
            </>
          ) : (
            <div className="academic-avatar-container" ref={menuRef}>
              <div className="academic-avatar" title={user?.name || 'Tài khoản'} onClick={() => setMenuOpen((v) => !v)}>
                {user?.avatar ? <img src={user.avatar} alt={user?.name || 'avatar'} /> : (user?.name || 'U').slice(0, 1)}
              </div>
              {menuOpen && (
                <div className="academic-avatar-menu" role="menu" aria-label="Menu tài khoản">
                  <div className="avatar-menu-header">
                    <div className="avatar-menu-photo">{user?.avatar ? <img src={user.avatar} alt={user?.name || 'avatar'} /> : (user?.name || 'U').slice(0, 1)}</div>
                    <div className="avatar-menu-info">
                      <strong>{(user?.name || 'Thành viên') + (isPremiumUser ? ' (premium)' : '')}</strong>
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
      </div>

      <div className="academic-topbar-search">
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
            placeholder="Tìm kiếm đề thi, bài viết, tin tức..."
            aria-label="Tìm kiếm"
            value={localQuery}
            onChange={(e) => { setLocalQuery(e.target.value); triggerOnSearch(e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); triggerOnSearch(localQuery, true); } }}
          />
        </div>
      </div>
    </header>
  );
}
