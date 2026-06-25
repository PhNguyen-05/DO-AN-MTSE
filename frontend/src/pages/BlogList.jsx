import React from 'react';
import { Link } from 'react-router-dom';
import AcademicLayout from '../components/AcademicLayout.jsx';
import { articles } from '../data/articles.js';

export default function BlogList() {
  const featured = articles[0];
  const list = articles.slice(1);

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
            <button className="btn btn-outline active">Tất cả</button>
            <button className="btn btn-outline">Bài viết</button>
            <button className="btn btn-outline">Tin tức</button>
          </div>
        </div>

        <article className="hero-news-card" style={{ backgroundImage: `url(${featured.image})` }}>
          <Link to={`/blog/${featured.id}`} className="hero-news-link hero-news-full-link">
            <div className="hero-news-overlay" />
            <div className="hero-news-body">
              <div className="hero-news-labels">
                <span className="hero-news-tag">Bài viết</span>
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

        <div className="blog-grid">
          {list.map((article) => (
            <article key={article.id} className="news-card">
              <Link to={`/blog/${article.id}`} className="news-card-link">
                <div className="news-card-image" style={{ backgroundImage: `url(${article.image})` }}>
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
          <button className="btn btn-outline active">1</button>
          <button className="btn btn-outline">2</button>
          <button className="btn btn-outline">3</button>
          <span className="pagination-ellipsis">...</span>
          <button className="btn btn-outline">12</button>
        </div>
      </div>
    </AcademicLayout>
  );
}
