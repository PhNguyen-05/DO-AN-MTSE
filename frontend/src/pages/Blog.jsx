import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AcademicLayout from '../components/AcademicLayout.jsx';

const article = {
  title: 'Chiến lược chinh phục Reading TOEIC 900+ trong 30 ngày',
  subtitle: 'Giải pháp luyện đọc bài thi hiệu quả, tối ưu thời gian và nâng cao điểm Reading TOEIC.',
  author: 'Thầy Minh TOEIC',
  date: '2026-05-15T08:00:00.000Z',
  readMinutes: 10,
  category: 'Kinh nghiệm học',
  tags: ['TOEIC Reading', 'Từ vựng TOEIC', 'Chiến lược', 'Mục tiêu 900'],
};

const initialComments = [
  {
    id: 'c1',
    author: 'Nguyễn Văn A',
    date: '2026-06-24T10:12:00.000Z',
    text: 'Bài viết rất hữu ích ạ. Thầy cho em hỏi phần Part 7 em hay bị rối khi đọc double passage, có cách nào để cải thiện không?',
  },
  {
    id: 'c2',
    author: 'Thầy Minh TOEIC',
    date: '2026-06-24T11:00:00.000Z',
    text: 'Chào em, với double passage, em nên đọc lượt đoạn văn thứ nhất trước để nắm chủ đề, sau đó đọc kỹ đoạn văn thứ hai trước khi trả lời câu hỏi nhé.',
  }
];

const relatedArticles = [
  { title: 'Top 500 từ vựng TOEIC thường gặp nhất', date: '12/05/2024' },
  { title: 'Các lỗi nghe TOEIC Part 3, 4 không nên mắc', date: '23/05/2024' },
  { title: 'Lịch thi TOEIC IIG cập nhật mới nhất', date: '05/05/2024' },
];

export default function Blog() {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(initialComments);

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    setComments((current) => [
      {
        id: `c-${Date.now()}`,
        author: 'Bạn',
        date: new Date().toISOString(),
        text: commentText.trim(),
      },
      ...current,
    ]);
    setCommentText('');
  };

  return (
    <AcademicLayout>
      <div className="article-page">
        <div className="article-card">
          <div className="article-top">
            <div className="article-main">
              <div className="article-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <span>•</span>
                <Link to="/blog">Bài viết tin tức</Link>
                <span>•</span>
                <span>Chi tiết</span>
              </div>

              <div className="article-label">{article.category}</div>
              <h1 className="article-title">{article.title}</h1>
              <p className="article-subtitle">{article.subtitle}</p>

              <div className="article-meta-row">
                <div className="article-meta-left">
                  <div className="article-author-line">
                    <div className="author-badge">{article.author.slice(0, 1)}</div>
                    <div>
                      <strong>{article.author}</strong>
                      <p>{new Date(article.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
                <div className="article-readtime">{article.readMinutes} phút đọc</div>
              </div>

              <div className="article-tags">
                {article.tags.map((tag) => <span key={tag} className="tag-pill">#{tag}</span>)}
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
                  {relatedArticles.map((item) => (
                    <li key={item.title}>
                      <Link to="/blog">
                        <strong>{item.title}</strong>
                        <span>{item.date}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          <div className="article-body">
            <div className="article-hero-image" />

            <article className="article-content">
              <p>Phần thi Reading trong TOEIC (Part 5, 6, 7) luôn là thử thách lớn với nhiều thí sinh bởi khối lượng từ vựng đồ sộ và áp lực thời gian. Tuy nhiên, với chiến lược luyện tập hợp lý, mức điểm 450+ Reading hoàn toàn nằm trong tầm tay.</p>

              <h2>1. Quản lý thời gian - Yếu tố cốt lõi (Time Management)</h2>
              <p>Với 75 phút cho 100 câu hỏi, bạn có chưa tới 1 phút cho mỗi câu. Đừng mắc kẹt quá lâu ở bất kỳ câu nào. Khuyến nghị phân bổ thời gian như sau:</p>
              <ul>
                <li><strong>Part 5</strong> (30 câu): Tối đa 10-12 phút (Khoảng 20s/câu). Cần phân tích nhanh với các câu gợi ý.</li>
                <li><strong>Part 6</strong> (16 câu): Tối đa 8-10 phút. Đọc hiểu ngữ cảnh xung quanh câu trống.</li>
                <li><strong>Part 7</strong> (54 câu): 50-55 phút. Đây là phần cần nhiều thời gian nhất, đặc biệt là các đoạn văn kép/bộ.</li>
              </ul>

              <h2>2. Chiến thuật làm bài Part 7 - Skimming & Scanning</h2>
              <p>Đừng cố gắng đọc từng chữ trong bài Part 7. Hãy áp dụng kỹ năng đọc lướt (Skimming) để nắm ý chính và đọc quét (Scanning) để tìm thông tin chi tiết.</p>
              <blockquote>Tip từ thầy Minh: Luôn đọc câu hỏi trước khi đọc đoạn văn. Việc này giúp bạn xác định được mục tiêu tìm kiếm (tên riêng, con số, địa điểm...) thay vì đọc mơ hồ từ đầu đến cuối.</blockquote>

              <h2>3. Xây dựng nền tảng Từ vựng (Vocabulary Building)</h2>
              <p>Không có mẹo (trick) nào có thể cứu vãn một vốn từ vựng quá nghèo nàn. Hãy tập trung học các chủ đề dễ xuất hiện trong đề TOEIC như:</p>
              <ol>
                <li>Vốn phòng (Office, Personnel, Purchasing)</li>
                <li>Tài chính & Ngân hàng (Banking, Accounting)</li>
                <li>Du lịch & Khách sạn (Travel, Hotel, Restaurant)</li>
                <li>Marketing & Bán hàng (Marketing, Sales)</li>
              </ol>

              <p>Kết hợp luyện tập thường xuyên với bộ đề đúng định dạng sẽ giúp bạn giữ nhịp và tăng phản xạ khi gặp từ mới.</p>
            </article>

            <section className="comment-section">
              <div className="section-header">
                <h3>Bình luận</h3>
                <span>{comments.length} bình luận</span>
              </div>
              <div className="comment-area">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Chia sẻ suy nghĩ của bạn về bài viết..."
                />
                <button className="btn btn-primary article-comment-button" onClick={handleSendComment}>Gửi bình luận</button>
              </div>
              <ul className="comment-list">
                {comments.map((c) => (
                  <li key={c.id} className="comment-item">
                    <div className="comment-avatar">{c.author.slice(0, 1)}</div>
                    <div className="comment-body">
                      <div className="comment-head">
                        <strong>{c.author}</strong>
                        <span className="comment-date">{new Date(c.date).toLocaleString('vi-VN')}</span>
                      </div>
                      <p className="comment-text">{c.text}</p>
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
