import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AcademicLayout from '../components/AcademicLayout.jsx';
import { articles } from '../data/articles.js';

const initialComments = [
  {
    id: 'c1',
    author: 'Nguyễn Văn A',
    date: '2026-06-24T10:12:00.000Z',
    text: 'Bài viết rất hữu ích ạ. Thầy cho em hỏi phần Part 7 em hay bị rối khi đọc double passage, có cách nào để cải thiện không?',
    likes: 15,
    replies: [
      {
        id: 'r1',
        author: 'Thầy Minh TOEIC',
        date: '2026-06-24T11:00:00.000Z',
        text: 'Chào em, với double passage, em nên đọc lượt đoạn văn thứ nhất trước để nắm chủ đề, sau đó đọc kỹ đoạn văn thứ hai trước khi trả lời câu hỏi nhé.',
        likes: 5,
        verified: true,
      },
    ],
  },
];

export default function BlogDetail() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const article = useMemo(() => articles.find((item) => item.id === articleId), [articleId]);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(initialComments);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  if (!article) {
    return (
      <AcademicLayout>
        <div className="article-missing">
          <h2>Không tìm thấy bài viết</h2>
          <p>Bài viết bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
          <button className="btn btn-primary" onClick={() => navigate('/blog')}>Quay lại danh sách</button>
        </div>
      </AcademicLayout>
    );
  }

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    setComments((current) => [
      {
        id: `c-${Date.now()}`,
        author: 'Bạn',
        date: new Date().toISOString(),
        text: commentText.trim(),
        likes: 0,
        replies: [],
      },
      ...current,
    ]);
    setCommentText('');
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  const handleSendReply = (commentId) => {
    if (!replyText.trim()) return;
    setComments((current) => current.map((comment) => {
      if (comment.id !== commentId) return comment;
      return {
        ...comment,
        replies: [
          ...comment.replies,
          {
            id: `r-${Date.now()}`,
            author: 'Thầy Minh TOEIC',
            date: new Date().toISOString(),
            text: replyText.trim(),
            likes: 0,
            verified: true,
          },
        ],
      };
    }));
    setReplyText('');
    setReplyingTo(null);
  };

  return (
    <AcademicLayout>
      <div className="article-page article-detail-page">
        <div className="article-card article-detail-card">
          <div className="article-top article-detail-top">
            <div className="article-main">
              <div className="article-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <span>•</span>
                <Link to="/blog">Bài viết tin tức</Link>
                <span>•</span>
                <span>{article.title}</span>
              </div>

              <div className="article-label">{article.category}</div>
              <h1 className="article-title">{article.title}</h1>
              <p className="article-subtitle">{article.excerpt}</p>

              <div className="article-meta-row">
                <div className="article-meta-left">
                  <div className="article-author-line">
                    <div className="author-badge">T</div>
                    <div>
                      <strong>Academic Hub</strong>
                      <p>{new Date(article.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
                <div className="article-readtime">{article.readMinutes} phút đọc</div>
              </div>

              <div className="article-tags">
                <span className="tag-pill">#{article.type}</span>
                <span className="tag-pill">{article.views}</span>
              </div>
            </div>

            <aside className="article-sidebar">
              <div className="sidebar-card sidebar-promo">
                <div className="sidebar-card-label">Khóa học HOT</div>
                <h4>Khóa luyện thi TOEIC 600+</h4>
                <p>Đăng ký ngay hôm nay để nhận ưu đãi giảm 30% học phí.</p>
                <button className="btn btn-primary">Đăng ký ngay</button>
              </div>

              <div className="sidebar-card sidebar-related">
                <div className="sidebar-card-label">Bài viết liên quan</div>
                <ul className="related-list">
                  {articles.filter((item) => item.id !== article.id).slice(0, 3).map((item) => (
                    <li key={item.id}>
                      <Link to={`/blog/${item.id}`}>
                        <strong>{item.title}</strong>
                        <span>{new Date(item.date).toLocaleDateString('vi-VN')}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          <div className="article-body">
            <div className="article-hero-image article-detail-image" style={{ backgroundImage: `url(${article.image})` }} />

            <article className="article-content">
              {article.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </article>

            <section className="comment-section">
              <div className="section-header">
                <h3>Bình luận</h3>
                <span>{comments.length} bình luận</span>
              </div>
              <div className="comment-area comment-area-inline">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                />
                <button className="btn btn-primary article-comment-button" onClick={handleSendComment}>Gửi bình luận</button>
              </div>
              <ul className="comment-list">
                {comments.map((c) => (
                  <li key={c.id} className="comment-item">
                    <div className="comment-avatar">{c.author.slice(0, 1)}</div>
                    <div className="comment-body">
                      <div className="comment-head">
                        <div className="comment-author-title">
                          <strong>{c.author}</strong>
                        </div>
                        <span className="comment-date">{new Date(c.date).toLocaleString('vi-VN')}</span>
                      </div>

                      <p className="comment-text">{c.text}</p>

                      <div className="comment-actions">
                        <div className="comment-action-left">
                          <button className="btn btn-link-like">👍 {c.likes || 0}</button>
                          <button className="btn btn-link-reply" onClick={() => handleReplyClick(c.id)}>↩ Trả lời</button>
                        </div>
                      </div>

                      {replyingTo === c.id && (
                        <div className="reply-form-inline">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Viết trả lời..."
                          />
                          <button className="btn btn-primary" onClick={() => handleSendReply(c.id)}>Gửi trả lời</button>
                        </div>
                      )}

                      {c.replies && c.replies.map((r) => (
                        <div key={r.id} className="comment-reply">
                          <div className="reply-avatar">{r.author.slice(0,1)}</div>
                          <div className="reply-body">
                            <div className="reply-head">
                              <strong>{r.author} {r.verified ? <span className="verified-badge">✓</span> : null}</strong>
                              <span className="comment-date">{new Date(r.date).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="reply-bubble">{r.text}</div>
                            <div className="reply-actions">
                              <div className="reply-action-left">
                                <button className="btn btn-link-like">👍 {r.likes || 0}</button>
                                <button className="btn btn-link-reply" onClick={() => handleReplyClick(c.id)}>↩ Trả lời</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </AcademicLayout>
  );
}
