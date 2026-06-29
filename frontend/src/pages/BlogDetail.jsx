import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AcademicLayout from '../components/AcademicLayout.jsx';
import { api, getApiMessage } from '../services/api.js';
import { getCurrentStoredUser, getGlobalLocalStorage, setGlobalLocalStorage } from '../utils/storage.js';
import { applyStoredLikeState, toggleCommentLikeState } from '../utils/commentLikes.js';

const initialComments = [];

export default function BlogDetail() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(initialComments);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(getCurrentStoredUser());

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/api/blog/${encodeURIComponent(articleId)}`);
        setArticle(response.data.article || null);
      } catch (err) {
        setError(getApiMessage(err, 'Không thể tải bài viết.'));
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelated = async () => {
      try {
        const response = await api.get('/api/blog', { params: { limit: 6 } });
        const allArticles = response.data.articles || [];
        setRelatedArticles(allArticles.filter((item) => item.id !== articleId).slice(0, 3));
      } catch (err) {
        setRelatedArticles([]);
      }
    };

    fetchArticle();
    fetchRelated();
  }, [articleId]);

  useEffect(() => {
    try {
      const stored = getGlobalLocalStorage('blogComments', {});
      const articlesComments = stored && typeof stored === 'object' ? stored : {};
      let articleComments = Array.isArray(articlesComments[articleId]) ? articlesComments[articleId] : [];
      articleComments = articleComments.filter((c) => c.id !== 'c1');
      articleComments = applyStoredLikeState(articleComments, articleId);
      setComments(articleComments.length > 0 ? articleComments : initialComments);
    } catch (e) {
      setComments(initialComments);
    }
  }, [articleId]);

  const saveCommentsToStorage = (updatedComments) => {
    try {
      const stored = getGlobalLocalStorage('blogComments', {});
      const articlesComments = stored && typeof stored === 'object' ? stored : {};
      articlesComments[articleId] = updatedComments;
      setGlobalLocalStorage('blogComments', articlesComments);
    } catch (e) {
      // ignore storage errors
    }
  };

  if (loading) {
    return (
      <AcademicLayout>
        <div className="article-loading">
          <h2>Đang tải bài viết...</h2>
          <p>Vui lòng đợi trong giây lát.</p>
        </div>
      </AcademicLayout>
    );
  }

  if (error || !article) {
    return (
      <AcademicLayout>
        <div className="article-missing">
          <h2>{error ? 'Có lỗi xảy ra' : 'Không tìm thấy bài viết'}</h2>
          <p>{error || 'Bài viết bạn yêu cầu không tồn tại hoặc đã bị xóa.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/blog')}>Quay lại danh sách</button>
        </div>
      </AcademicLayout>
    );
  }

  const getCurrentUserName = () => {
    const name = currentUser?.name || currentUser?.fullName || currentUser?.email || 'Bạn';
    return String(name).trim() || 'Bạn';
  };

  const isCurrentUserAuthor = (author, authorId) => {
    if (authorId != null && currentUser?.id != null) {
      return String(authorId) === String(currentUser.id);
    }
    const normalizedAuthor = String(author || '').trim();
    const currentName = getCurrentUserName();
    return normalizedAuthor && normalizedAuthor === currentName;
  };

  const resolveAuthorName = (author, authorId) => {
    if (isCurrentUserAuthor(author, authorId)) return 'Bạn';
    if (!author) return 'Người dùng';
    return String(author).trim();
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    const newComments = [
      {
        id: `c-${Date.now()}`,
        author: getCurrentUserName(),
        authorId: currentUser?.id ?? null,
        date: new Date().toISOString(),
        text: commentText.trim(),
        likes: 0,
        replies: [],
      },
      ...comments,
    ];
    setComments(newComments);
    saveCommentsToStorage(newComments);
    setCommentText('');
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  const handleLike = (commentId) => {
    const updated = comments.map((c) => (
      c.id === commentId ? toggleCommentLikeState(c, articleId, commentId) : c
    ));
    setComments(updated);
    saveCommentsToStorage(updated);
  };

  const handleReplyLike = (commentId, replyId) => {
    const updated = comments.map((c) => {
      if (c.id !== commentId) return c;
      return {
        ...c,
        replies: c.replies.map((r) => (
          r.id === replyId ? toggleCommentLikeState(r, articleId, commentId, replyId) : r
        )),
      };
    });
    setComments(updated);
    saveCommentsToStorage(updated);
  };

  const handleSendReply = (commentId) => {
    if (!replyText.trim()) return;
    const currentUserName = getCurrentUserName();
    const updated = comments.map((comment) => {
      if (comment.id !== commentId) return comment;
      return {
        ...comment,
        replies: [
          ...comment.replies,
          {
            id: `r-${Date.now()}`,
            author: currentUserName,            authorId: currentUser?.id ?? null,            date: new Date().toISOString(),
            text: replyText.trim(),
            likes: 0,
            verified: true,
          },
        ],
      };
    });
    setComments(updated);
    saveCommentsToStorage(updated);
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
              <div className="sidebar-card sidebar-related">
                <div className="sidebar-card-label">Bài viết liên quan</div>
                <ul className="related-list">
                  {relatedArticles.map((item) => (
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
              {(Array.isArray(article.content) ? article.content : [String(article.content || '')]).map((paragraph, index) => (
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
                  rows={4}
                  style={{ minHeight: 120 }}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                />
                <button className="btn btn-primary article-comment-button" onClick={handleSendComment}>Gửi bình luận</button>
              </div>
              <ul className="comment-list">
                {comments.map((c) => {
                  const authorName = resolveAuthorName(c.author, c.authorId);
                  return (
                    <li key={c.id} className="comment-item">
                      <div className="comment-avatar">{authorName.slice(0, 1)}</div>
                      <div className="comment-body">
                        <div className="comment-head">
                          <div className="comment-author-title">
                            <strong>{authorName}</strong>
                          </div>
                          <span className="comment-date">{new Date(c.date).toLocaleString('vi-VN')}</span>
                        </div>

                        <p className="comment-text">{c.text}</p>

                        <div className="comment-actions">
                          <div className="comment-action-left">
                            <button className={`btn btn-link-like ${c.liked ? 'liked' : ''}`} onClick={() => handleLike(c.id)}>👍 {c.likes || 0}</button>
                            <button className="btn btn-link-reply" onClick={() => handleReplyClick(c.id)}>↩ Trả lời</button>
                          </div>
                        </div>

                        {replyingTo === c.id && (
                          <div className="reply-form-inline">
                            <textarea
                              rows={3}
                              style={{ minHeight: 90 }}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Viết trả lời..."
                            />
                            <button className="btn btn-primary" onClick={() => handleSendReply(c.id)}>Gửi trả lời</button>
                          </div>
                        )}

                        {c.replies && c.replies.map((r) => (
                          <div key={r.id} className="comment-reply">
                            <div className="reply-avatar">{resolveAuthorName(r.author, r.authorId).slice(0, 1)}</div>
                            <div className="reply-body">
                              <div className="reply-head">
                                <strong>{resolveAuthorName(r.author, r.authorId)} {r.verified ? <span className="verified-badge">✓</span> : null}</strong>
                                <span className="comment-date">{new Date(r.date).toLocaleString('vi-VN')}</span>
                              </div>
                              <div className="reply-bubble">{r.text}</div>
                              <div className="reply-actions">
                                <div className="reply-action-left">
                                  <button className={`btn btn-link-like ${r.liked ? 'liked' : ''}`} onClick={() => handleReplyLike(c.id, r.id)}>👍 {r.likes || 0}</button>
                                  <button className="btn btn-link-reply" onClick={() => handleReplyClick(c.id)}>↩ Trả lời</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </AcademicLayout>
  );
}
