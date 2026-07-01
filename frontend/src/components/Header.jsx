import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Header({ onSearch, searchValue }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [localQuery, setLocalQuery] = useState(searchValue || '');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (typeof searchValue !== 'undefined') setLocalQuery(searchValue || '');
  }, [searchValue]);

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

  return (
    <header className="academic-topbar">
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
