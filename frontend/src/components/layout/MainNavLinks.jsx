import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { hasPremiumAccess } from '../../utils/storage.js';

const MAIN_NAV_ITEMS = [
  { key: 'home', label: 'Trang chủ', icon: 'bi-house', to: '/', end: true },
  { key: 'exams', label: 'Đề thi', icon: 'bi-journal-text', to: '/exams' },
  { key: 'vocabulary', label: 'Từ vựng', icon: 'bi-bookmark', to: '/vocabulary' },
  { key: 'promotions', label: 'Khuyến mãi', icon: 'bi-megaphone', to: '/promotions' },
  { key: 'blog', label: 'Bài viết tin tức', icon: 'bi-newspaper', to: '/blog' },
  { key: 'practice', label: 'Luyện tập', icon: 'bi-play-btn', to: '/practice' },
  { key: 'premium', label: 'Gói Premium', icon: 'bi-gem', to: '/premium', premium: true }
];

export function TopMainNav({ homeTo = '/' }) {
  const isPremium = hasPremiumAccess();

  const navItems = MAIN_NAV_ITEMS.map((item) => {
    let updated = { ...item };
    if (item.key === 'home') {
      updated.to = homeTo;
    } else if (item.key === 'premium' && isPremium) {
      updated.to = '/premium-dashboard';
    }
    return updated;
  });

  return (
    <ul className="navbar-nav toeic-main-nav me-auto">
      {navItems.map((item) => (
        <li className="nav-item" key={item.key}>
          <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) => [
              'nav-link',
              item.premium ? 'toeic-premium-link' : '',
              isActive ? 'active' : ''
            ].filter(Boolean).join(' ')}
          >
            <i className={`bi ${item.icon}`} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function TopCartLink() {
  const location = useLocation();
  const isActive = location.pathname === '/cart';

  return (
    <Link
      to="/cart"
      className={`toeic-cart-link${isActive ? ' active' : ''}`}
      aria-label="Giỏ hàng"
      title="Giỏ hàng"
    >
      <i className="bi bi-cart" aria-hidden="true" />
    </Link>
  );
}
