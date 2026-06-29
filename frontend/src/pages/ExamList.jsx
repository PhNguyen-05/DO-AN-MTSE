// import React, { useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { mockExamCatalog } from "../data/learningMockData";

// const attemptSeed = {
//   "ets-2023-test-01": {
//     count: 4,
//     bestScore: 875,
//     lastAttempt: new Date(Date.now() - 100000000).toISOString(),
//     lastScore: 850,
//     lastAttemptId: "att_001",
//   },
//   "ets-2023-test-02": {
//     count: 1,
//     bestScore: 720,
//     lastAttempt: new Date().toISOString(),
//     lastScore: 720,
//     lastAttemptId: "att_002",
//   },
// };

// const difficultyLabels = {
//   easy: "Dễ",
//   medium: "Trung bình",
//   hard: "Khó",
// };

// const formatDate = (dateString) => {
//   if (!dateString) return "Chưa làm";
//   return new Date(dateString).toLocaleDateString("vi-VN");
// };

// const ExamList = () => {
//   const { user } = useSelector((state) => state.auth);
//   const [exams, setExams] = useState([]);
//   const [userAttempts, setUserAttempts] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [yearFilter, setYearFilter] = useState("all");
//   const [accessFilter, setAccessFilter] = useState("all");
//   const [difficultyFilter, setDifficultyFilter] = useState("all");

//   const isPremium = user?.account_type === "Premium" || true;

//   useEffect(() => {
//     const timer = window.setTimeout(() => {
//       setExams(mockExamCatalog);
//       setUserAttempts(attemptSeed);
//       setLoading(false);
//     }, 450);

//     return () => window.clearTimeout(timer);
//   }, []);

//   const years = useMemo(() => [...new Set(exams.map((exam) => exam.releaseYear))].sort((a, b) => b - a), [exams]);

//   const filteredExams = useMemo(() => {
//     const keyword = searchTerm.trim().toLowerCase();
//     return exams.filter((exam) => {
//       const matchesSearch =
//         !keyword ||
//         exam.name.toLowerCase().includes(keyword) ||
//         exam.tags.some((tag) => tag.toLowerCase().includes(keyword));
//       const matchesYear = yearFilter === "all" || exam.releaseYear === Number(yearFilter);
//       const matchesAccess = accessFilter === "all" || exam.accessType === accessFilter;
//       const matchesDifficulty = difficultyFilter === "all" || exam.difficulty === difficultyFilter;

//       return matchesSearch && matchesYear && matchesAccess && matchesDifficulty;
//     });
//   }, [accessFilter, difficultyFilter, exams, searchTerm, yearFilter]);

//   const catalogStats = useMemo(
//     () => ({
//       total: exams.length,
//       free: exams.filter((exam) => exam.accessType === "free").length,
//       premium: exams.filter((exam) => exam.accessType === "premium").length,
//       completed: Object.keys(userAttempts).length,
//     }),
//     [exams, userAttempts],
//   );

//   if (loading) {
//     return (
//       <div className="learning-page">
//         <div className="learning-shell learning-empty">
//           <span className="learning-spinner" />
//           <p className="learning-subtitle" style={{ marginTop: 14 }}>
//             Đang tải kho đề thi TOEIC...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="learning-page">
//       <header className="learning-header">
//         <div className="learning-header-inner">
//           <div className="exam-catalog-hero">
//             <div>
//               <p className="learning-kicker">TOEIC Test Library</p>
//               <h1 className="learning-title">Kho đề thi TOEIC</h1>
//               <p className="learning-subtitle">
//                 Chọn đề miễn phí 2022-2023 hoặc đề mới thuộc Premium để bắt đầu luyện full test.
//               </p>
//             </div>
//             <div className="learning-actions">
//               <Link className="learning-btn" to="/practice">
//                 <i className="bi bi-columns-gap" />
//                 Luyện theo Part
//               </Link>
//               <Link className="learning-btn primary" to="/analytics">
//                 <i className="bi bi-graph-up-arrow" />
//                 Xem tiến độ
//               </Link>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="learning-shell">
//         <section className="learning-grid cols-4" style={{ marginBottom: 18 }}>
//           <article className="learning-card">
//             <span className="learning-icon">
//               <i className="bi bi-collection" />
//             </span>
//             <strong className="learning-stat-value">{catalogStats.total}</strong>
//             <span className="learning-stat-label">Đề trong kho</span>
//           </article>
//           <article className="learning-card">
//             <span className="learning-icon green">
//               <i className="bi bi-unlock" />
//             </span>
//             <strong className="learning-stat-value">{catalogStats.free}</strong>
//             <span className="learning-stat-label">Đề miễn phí</span>
//           </article>
//           <article className="learning-card">
//             <span className="learning-icon violet">
//               <i className="bi bi-gem" />
//             </span>
//             <strong className="learning-stat-value">{catalogStats.premium}</strong>
//             <span className="learning-stat-label">Đề Premium</span>
//           </article>
//           <article className="learning-card">
//             <span className="learning-icon amber">
//               <i className="bi bi-check2-circle" />
//             </span>
//             <strong className="learning-stat-value">{catalogStats.completed}</strong>
//             <span className="learning-stat-label">Đề đã từng làm</span>
//           </article>
//         </section>

//         <section className="learning-card exam-filter-panel">
//           <div className="exam-search">
//             <i className="bi bi-search" />
//             <input
//               value={searchTerm}
//               onChange={(event) => setSearchTerm(event.target.value)}
//               placeholder="Tìm theo tên đề, năm hoặc tag..."
//               aria-label="Tìm kiếm đề thi"
//             />
//           </div>

//           <select className="learning-input" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
//             <option value="all">Tất cả năm</option>
//             {years.map((year) => (
//               <option key={year} value={year}>
//                 Năm {year}
//               </option>
//             ))}
//           </select>

//           <select className="learning-input" value={accessFilter} onChange={(event) => setAccessFilter(event.target.value)}>
//             <option value="all">Tất cả quyền truy cập</option>
//             <option value="free">Miễn phí</option>
//             <option value="premium">Premium</option>
//           </select>

//           <select className="learning-input" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>
//             <option value="all">Tất cả độ khó</option>
//             <option value="easy">Dễ</option>
//             <option value="medium">Trung bình</option>
//             <option value="hard">Khó</option>
//           </select>
//         </section>

//         {filteredExams.length === 0 ? (
//           <section className="learning-card learning-empty" style={{ marginTop: 18 }}>
//             <span className="learning-icon amber">
//               <i className="bi bi-search" />
//             </span>
//             <h2 className="exam-title" style={{ fontSize: "1.25rem", marginTop: 12 }}>
//               Không tìm thấy đề phù hợp
//             </h2>
//             <p className="learning-subtitle">Thử đổi bộ lọc hoặc xóa từ khóa tìm kiếm.</p>
//           </section>
//         ) : (
//           <section className="exam-card-grid">
//             {filteredExams.map((exam) => {
//               const attemptInfo = userAttempts[exam._id];
//               const isLocked = exam.accessType === "premium" && !isPremium;
//               const difficultyClass = exam.difficulty === "hard" ? "red" : exam.difficulty === "easy" ? "green" : "amber";

//               return (
//                 <article key={exam._id} className="learning-card exam-catalog-card">
//                   <div className="exam-card-topline" />

//                   <div className="exam-card-main">
//                     <div className="learning-card-head">
//                       <div className="exam-card-icon">
//                         <i className="bi bi-file-earmark-text" />
//                       </div>
//                       <span className={`learning-badge ${exam.accessType === "premium" ? "amber" : "green"}`}>
//                         {exam.accessType === "premium" ? "Premium" : "Miễn phí"}
//                       </span>
//                     </div>

//                     <div>
//                       <h2 className="exam-card-title">{exam.name}</h2>
//                       <p className="vocab-muted">{exam.description}</p>
//                     </div>

//                     <div className="exam-tag-row">
//                       <span className={`learning-badge ${difficultyClass}`}>{difficultyLabels[exam.difficulty]}</span>
//                       <span className="learning-badge">Năm {exam.releaseYear}</span>
//                       <span className="learning-badge">{exam.questionCount} câu</span>
//                     </div>

//                     <div className="exam-material-row">
//                       <span>
//                         <i className="bi bi-headphones" /> {exam.listeningCount} Listening
//                       </span>
//                       <span>
//                         <i className="bi bi-book" /> {exam.readingCount} Reading
//                       </span>
//                       <span>
//                         <i className="bi bi-clock" /> 120 phút
//                       </span>
//                     </div>

//                     {attemptInfo ? (
//                       <div className="exam-attempt-box">
//                         <div>
//                           <strong>{attemptInfo.count}</strong>
//                           <span>Lần làm</span>
//                         </div>
//                         <div>
//                           <strong>{attemptInfo.bestScore}</strong>
//                           <span>Điểm cao nhất</span>
//                         </div>
//                         <div>
//                           <strong>{attemptInfo.lastScore}</strong>
//                           <span>Lần gần nhất</span>
//                         </div>
//                         <div>
//                           <strong>{formatDate(attemptInfo.lastAttempt)}</strong>
//                           <span>Ngày làm</span>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="exam-empty-attempt">
//                         <i className="bi bi-stars" />
//                         Chưa có lượt làm. Bắt đầu để tạo thống kê đầu tiên.
//                       </div>
//                     )}
//                   </div>

//                   <div className="exam-card-actions">
//                     {isLocked ? (
//                       <button className="learning-btn primary" onClick={() => alert("Đề này thuộc gói Premium.")}>
//                         <i className="bi bi-lock" />
//                         Mở khóa Premium
//                       </button>
//                     ) : (
//                       <Link className="learning-btn primary" to={`/exam/${exam._id}`}>
//                         <i className="bi bi-play-circle" />
//                         {attemptInfo ? "Làm lại bài thi" : "Bắt đầu làm bài"}
//                       </Link>
//                     )}

//                     {attemptInfo && !isLocked && (
//                       <Link className="learning-btn" to={`/exam/result/${attemptInfo.lastAttemptId}`}>
//                         <i className="bi bi-clipboard-data" />
//                         Xem kết quả
//                       </Link>
//                     )}
//                   </div>
//                 </article>
//               );
//             })}
//           </section>
//         )}
//       </main>
//     </div>
//   );
// };

// export default ExamList;


import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { examApi, attemptApi } from "../services/userApi";

const difficultyLabels = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

const formatDate = (dateString) => {
  if (!dateString) return "Chưa làm";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // API /user/exams đã trả về attemptInfo gộp sẵn
        const data = await examApi.getExams();
        setExams(data);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách đề thi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const years = useMemo(
    () => [...new Set(exams.map((exam) => exam.releaseYear))].sort((a, b) => b - a),
    [exams],
  );

  const filteredExams = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return exams.filter((exam) => {
      const matchesSearch =
        !keyword ||
        exam.name.toLowerCase().includes(keyword) ||
        (exam.tags || []).some((tag) => tag.toLowerCase().includes(keyword));
      const matchesYear = yearFilter === "all" || exam.releaseYear === Number(yearFilter);
      const matchesAccess = accessFilter === "all" || exam.accessType === accessFilter;
      const matchesDifficulty = difficultyFilter === "all" || exam.difficulty === difficultyFilter;
      return matchesSearch && matchesYear && matchesAccess && matchesDifficulty;
    });
  }, [accessFilter, difficultyFilter, exams, searchTerm, yearFilter]);

  const catalogStats = useMemo(
    () => ({
      total: exams.length,
      free: exams.filter((exam) => exam.accessType === "free").length,
      premium: exams.filter((exam) => exam.accessType === "premium").length,
      completed: exams.filter((exam) => exam.attemptInfo && exam.attemptInfo.count > 0).length,
    }),
    [exams],
  );

  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <span className="learning-spinner" />
          <p className="learning-subtitle" style={{ marginTop: 14 }}>
            Đang tải kho đề thi TOEIC...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <h2 className="exam-title">Không thể tải dữ liệu</h2>
          <p className="learning-subtitle">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-page">
      <header className="learning-header">
        <div className="learning-header-inner">
          <div className="exam-catalog-hero">
            <div>
              <p className="learning-kicker">TOEIC Test Library</p>
              <h1 className="learning-title">Kho đề thi TOEIC</h1>
              <p className="learning-subtitle">
                Chọn đề miễn phí hoặc đề Premium để bắt đầu luyện full test.
              </p>
            </div>
            <div className="learning-actions">
              <Link className="learning-btn" to="/practice">
                <i className="bi bi-columns-gap" />
                Luyện theo Part
              </Link>
              <Link className="learning-btn primary" to="/analytics">
                <i className="bi bi-graph-up-arrow" />
                Xem tiến độ
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="learning-shell">
        <section className="learning-grid cols-4" style={{ marginBottom: 18 }}>
          <article className="learning-card">
            <span className="learning-icon">
              <i className="bi bi-collection" />
            </span>
            <strong className="learning-stat-value">{catalogStats.total}</strong>
            <span className="learning-stat-label">Đề trong kho</span>
          </article>
          <article className="learning-card">
            <span className="learning-icon green">
              <i className="bi bi-unlock" />
            </span>
            <strong className="learning-stat-value">{catalogStats.free}</strong>
            <span className="learning-stat-label">Đề miễn phí</span>
          </article>
          <article className="learning-card">
            <span className="learning-icon violet">
              <i className="bi bi-gem" />
            </span>
            <strong className="learning-stat-value">{catalogStats.premium}</strong>
            <span className="learning-stat-label">Đề Premium</span>
          </article>
          <article className="learning-card">
            <span className="learning-icon amber">
              <i className="bi bi-check2-circle" />
            </span>
            <strong className="learning-stat-value">{catalogStats.completed}</strong>
            <span className="learning-stat-label">Đề đã từng làm</span>
          </article>
        </section>

        <section className="learning-card exam-filter-panel">
          <div className="exam-search">
            <i className="bi bi-search" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo tên đề, năm hoặc tag..."
              aria-label="Tìm kiếm đề thi"
            />
          </div>

          <select
            className="learning-input"
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
          >
            <option value="all">Tất cả năm</option>
            {years.map((year) => (
              <option key={year} value={year}>
                Năm {year}
              </option>
            ))}
          </select>

          <select
            className="learning-input"
            value={accessFilter}
            onChange={(event) => setAccessFilter(event.target.value)}
          >
            <option value="all">Tất cả quyền truy cập</option>
            <option value="free">Miễn phí</option>
            <option value="premium">Premium</option>
          </select>

          <select
            className="learning-input"
            value={difficultyFilter}
            onChange={(event) => setDifficultyFilter(event.target.value)}
          >
            <option value="all">Tất cả độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </section>

        {filteredExams.length === 0 ? (
          <section className="learning-card learning-empty" style={{ marginTop: 18 }}>
            <span className="learning-icon amber">
              <i className="bi bi-search" />
            </span>
            <h2 className="exam-title" style={{ fontSize: "1.25rem", marginTop: 12 }}>
              Không tìm thấy đề phù hợp
            </h2>
            <p className="learning-subtitle">Thử đổi bộ lọc hoặc xóa từ khóa tìm kiếm.</p>
          </section>
        ) : (
          <section className="exam-card-grid">
            {filteredExams.map((exam) => {
              const attemptInfo = exam.attemptInfo;
              const isLocked = !exam.canAccess;
              const difficultyClass =
                exam.difficulty === "hard"
                  ? "red"
                  : exam.difficulty === "easy"
                    ? "green"
                    : "amber";

              return (
                <article key={exam._id} className="learning-card exam-catalog-card">
                  <div className="exam-card-topline" />

                  <div className="exam-card-main">
                    <div className="learning-card-head">
                      <div className="exam-card-icon">
                        <i className="bi bi-file-earmark-text" />
                      </div>
                      <span
                        className={`learning-badge ${exam.accessType === "premium" ? "amber" : "green"}`}
                      >
                        {exam.accessType === "premium" ? "Premium" : "Miễn phí"}
                      </span>
                    </div>

                    <div>
                      <h2 className="exam-card-title">{exam.name}</h2>
                      <p className="vocab-muted">
                        {exam.skill} • {exam.durationMinutes || 120} phút
                      </p>
                    </div>

                    <div className="exam-tag-row">
                      <span className={`learning-badge ${difficultyClass}`}>
                        {difficultyLabels[exam.difficulty] || exam.difficulty}
                      </span>
                      <span className="learning-badge">Năm {exam.releaseYear}</span>
                      <span className="learning-badge">{exam.questionCount || 200} câu</span>
                    </div>

                    <div className="exam-material-row">
                      <span>
                        <i className="bi bi-headphones" /> {exam.listeningCount || 100} Listening
                      </span>
                      <span>
                        <i className="bi bi-book" /> {exam.readingCount || 100} Reading
                      </span>
                      {exam.hasAudio && (
                        <span>
                          <i className="bi bi-music-note" /> Audio
                        </span>
                      )}
                      {exam.hasPdf && (
                        <span>
                          <i className="bi bi-file-pdf" /> PDF
                        </span>
                      )}
                    </div>

                    {attemptInfo ? (
                      <div className="exam-attempt-box">
                        <div>
                          <strong>{attemptInfo.count}</strong>
                          <span>Lần làm</span>
                        </div>
                        <div>
                          <strong>{attemptInfo.bestScore}</strong>
                          <span>Điểm cao nhất</span>
                        </div>
                        <div>
                          <strong>{attemptInfo.lastScore}</strong>
                          <span>Lần gần nhất</span>
                        </div>
                        <div>
                          <strong>{formatDate(attemptInfo.lastAttempt)}</strong>
                          <span>Ngày làm</span>
                        </div>
                      </div>
                    ) : (
                      <div className="exam-empty-attempt">
                        <i className="bi bi-stars" />
                        Chưa có lượt làm. Bắt đầu để tạo thống kê đầu tiên.
                      </div>
                    )}
                  </div>

                  <div className="exam-card-actions">
                    {isLocked ? (
                      <button
                        className="learning-btn primary"
                        onClick={() => alert("Đề này thuộc gói Premium. Vui lòng mua để truy cập.")}
                      >
                        <i className="bi bi-lock" />
                        Mở khóa Premium
                      </button>
                    ) : (
                      <Link className="learning-btn primary" to={`/exam/${exam._id}`}>
                        <i className="bi bi-play-circle" />
                        {attemptInfo ? "Làm lại bài thi" : "Bắt đầu làm bài"}
                      </Link>
                    )}

                    {attemptInfo && !isLocked && (
                      <Link
                        className="learning-btn"
                        to={`/exam/result/${attemptInfo.lastAttemptId}`}
                      >
                        <i className="bi bi-clipboard-data" />
                        Xem kết quả
                      </Link>
                    )}

                    {attemptInfo && !isLocked && (
                      <Link className="learning-btn" to={`/exams/${exam._id}/history`}>
                        <i className="bi bi-clock-history" />
                        Lịch sử
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};

export default ExamList;