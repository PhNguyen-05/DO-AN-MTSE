import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AcademicLayout from '../components/AcademicLayout.jsx';
import { api, getApiMessage } from '../services/api.js';
import { resolveMediaUrl } from '../utils/mediaUrl.js';

const getArticleImageUrl = (article = {}) => resolveMediaUrl(
  article.image ||
  article.thumbnailUrl ||
  article.imageUrl ||
  article.coverImage ||
  article.thumbnail ||
  article.thumb
);

const getArticleImageStyle = (article) => {
  const imageUrl = getArticleImageUrl(article);
  return imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined;
};

export default function BlogList() {
  const [filterType, setFilterType] = useState('Tất cả'); // 'Tất cả' | 'Bài viết' | 'Tin tức'
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pageSize = 6;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError('');
        const params = {};
        if (filterType && filterType !== 'Tất cả') params.type = filterType;
        const response = await api.get('/api/blog', { params });
        setArticles(response.data.articles || []);
      } catch (err) {
        setError(getApiMessage(err, 'Không thể tải bài viết.'));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [filterType]);

  const filtered = useMemo(() => {
    if (!filterType || filterType === 'Tất cả') return articles.slice();
    return articles.filter((a) => a.type === filterType);
  }, [filterType, articles]);

  const featured = filtered.length > 0 ? filtered[0] : null;
  const list = filtered.slice(1);

  const totalItems = list.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageIndex = Math.min(Math.max(1, currentPage), totalPages);
  const pageItems = list.slice((pageIndex - 1) * pageSize, (pageIndex - 1) * pageSize + pageSize);

  const setFilterAndReset = (type) => { setFilterType(type); setCurrentPage(1); };

  return (
    <AcademicLayout>
      <div className="blog-list-page">
        <div className="blog-list-header">
          <div>
            <p className="section-label">Bài viết & Tin tức</p>
            <h1>Góc chia sẻ thông tin mới nhất về TOEIC</h1>
            <p className="section-description">Cập nhật thông tin mới nhất về kỳ thi TOEIC và chia sẻ kinh nghiệm học tập hiệu quả.</p>
          </div>
          <div className="blog-filter-pill">
            <button className={`btn btn-outline ${filterType === 'Tất cả' ? 'active' : ''}`} onClick={() => setFilterAndReset('Tất cả')}>Tất cả</button>
            <button className={`btn btn-outline ${filterType === 'Bài viết' ? 'active' : ''}`} onClick={() => setFilterAndReset('Bài viết')}>Bài viết</button>
            <button className={`btn btn-outline ${filterType === 'Tin tức' ? 'active' : ''}`} onClick={() => setFilterAndReset('Tin tức')}>Tin tức</button>
          </div>
        </div>

        {error && <div className="academic-alert">{error}</div>}
        {loading && <div className="academic-alert">Đang tải bài viết...</div>}

        {featured ? (
          <article className="hero-news-card" style={getArticleImageStyle(featured)}>
            <Link to={`/blog/${featured.id}`} className="hero-news-link hero-news-full-link">
              <div className="hero-news-overlay" />
              <div className="hero-news-body">
                <div className="hero-news-labels">
                  <span className="hero-news-tag">{featured.type}</span>
                </div>
                <div className="news-card-meta hero-news-meta">
                  <span>{new Date(featured.date).toLocaleDateString('vi-VN')}</span>
                  <span>{featured.readMinutes} phút đọc</span>
                </div>
                <h2>{featured.title}</h2>
                <p className="hero-news-excerpt">{featured.excerpt}</p>
                <div className="news-card-footer">
                  <span>{featured.views}</span>
                  <span>Đọc tiếp →</span>
                </div>
              </div>
            </Link>
          </article>
        ) : null}

        <div className="blog-grid">
          {pageItems.map((article) => (
            <article key={article.id} className="news-card">
              <Link to={`/blog/${article.id}`} className="news-card-link">
                <div className="news-card-image" style={getArticleImageStyle(article)}>
                  <span className="news-card-tag">{article.category}</span>
                  <span className="news-card-type">{article.type}</span>
                </div>
                <div className="news-card-body">
                  <div className="news-card-meta">
                    <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
                    <span>{article.readMinutes} phút đọc</span>
                  </div>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>
                  <div className="news-card-footer">
                    <span>{article.views}</span>
                    <span>Đọc tiếp →</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="blog-pagination">
          {(() => {
            const buttons = [];
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) buttons.push(i);
            } else if (pageIndex <= 4) {
              buttons.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (pageIndex >= totalPages - 3) {
              buttons.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
              buttons.push(1, '...', pageIndex - 1, pageIndex, pageIndex + 1, '...', totalPages);
            }

            return buttons.map((b, idx) => (
              typeof b === 'number' ? (
                <button key={`pg-${b}-${idx}`} className={`btn btn-outline ${b === pageIndex ? 'active' : ''}`} onClick={() => setCurrentPage(b)}>{b}</button>
              ) : (
                <span key={`pg-ell-${idx}`} className="pagination-ellipsis">{b}</span>
              )
            ));
          })()}
        </div>
      </div>
    </AcademicLayout>
  );
}
