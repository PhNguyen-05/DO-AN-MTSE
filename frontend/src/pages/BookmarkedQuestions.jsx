import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { attemptApi } from "../services/userApi";

const BookmarkedQuestions = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPart, setFilterPart] = useState("All");

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);

        // Lấy summary để tìm các attempt gần nhất
        const summary = await attemptApi.getSummary();

        // Lấy chi tiết attempt gần nhất của mỗi đề để thu thập bookmarks
        const attemptIds = Object.values(summary)
          .filter((item) => item.lastAttemptId)
          .map((item) => item.lastAttemptId);

        if (!attemptIds.length) {
          setBookmarks([]);
          setLoading(false);
          return;
        }

        // Lấy tất cả attempt results song song
        const results = await Promise.all(
          attemptIds.map((id) => attemptApi.getResult(id).catch(() => null)),
        );

        // Thu thập câu hỏi đã bookmark từ tất cả attempts
        const allBookmarks = [];
        for (const result of results) {
          if (!result) continue;

          const { exam, attempt, questions } = result;
          const bookmarkedNums = new Set(attempt.bookmarked || []);

          if (!bookmarkedNums.size) continue;

          const answersObj = attempt.answers || {};

          for (const question of questions) {
            if (!bookmarkedNums.has(question.questionNumber)) continue;

            allBookmarks.push({
              ...question,
              _id: `${result.attemptId}-${question._id}`,
              examName: exam?.name || "Đề thi",
              attemptId: result.attemptId,
              userAnswer: answersObj[question.questionNumber] || null,
              bookmarkedAt: attempt.submittedAt,
            });
          }
        }

        // Sắp xếp mới nhất lên đầu
        allBookmarks.sort(
          (a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt),
        );

        setBookmarks(allBookmarks);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách câu hỏi đã lưu.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const filteredBookmarks = useMemo(() => {
    if (filterPart === "All") return bookmarks;
    return bookmarks.filter((question) => question.part === Number(filterPart));
  }, [bookmarks, filterPart]);

  const removeBookmark = (id) => {
    if (!window.confirm("Bỏ lưu câu hỏi này khỏi danh sách ôn tập?")) return;
    setBookmarks((prev) => prev.filter((item) => item._id !== id));
  };

  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <span className="learning-spinner" />
          <p className="learning-subtitle" style={{ marginTop: 14 }}>
            Đang tải danh sách câu hỏi khó...
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
          <Link className="learning-btn primary" to="/exams" style={{ marginTop: 16 }}>
            Về kho đề
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-page">
      <header className="learning-header">
        <div className="learning-header-inner">
          <div className="learning-title-row">
            <div>
              <p className="learning-kicker">Review Notebook</p>
              <h1 className="learning-title">Ôn tập câu hỏi khó</h1>
              <p className="learning-subtitle">
                Xem lại đáp án đúng, câu đã chọn và lời giải cho các câu bạn đã đánh dấu.
              </p>
            </div>
            <Link className="learning-btn" to="/exams">
              <i className="bi bi-arrow-left" />
              Về kho đề
            </Link>
          </div>
        </div>
      </header>

      <main className="learning-shell">
        <section className="learning-card" style={{ marginBottom: 18 }}>
          <div className="learning-section-heading">
            <div className="learning-actions" style={{ flexWrap: "wrap" }}>
              <strong>Lọc theo Part</strong>
              <div className="learning-segmented">
                {["All", "1", "2", "3", "4", "5", "6", "7"].map((part) => (
                  <button
                    key={part}
                    className={filterPart === part ? "active" : ""}
                    onClick={() => setFilterPart(part)}
                  >
                    {part === "All" ? "Tất cả" : `Part ${part}`}
                  </button>
                ))}
              </div>
            </div>
            <span className="learning-badge amber">{filteredBookmarks.length} câu</span>
          </div>
        </section>

        {filteredBookmarks.length === 0 ? (
          <section className="learning-card learning-empty">
            <span className="learning-icon amber" style={{ marginBottom: 14 }}>
              <i className="bi bi-bookmark" />
            </span>
            <h2 className="exam-title" style={{ fontSize: "1.3rem" }}>
              {bookmarks.length === 0
                ? "Chưa có câu hỏi nào được lưu"
                : "Không có câu nào ở Part này"}
            </h2>
            <p className="learning-subtitle">
              {bookmarks.length === 0
                ? "Khi làm bài, bấm biểu tượng bookmark để lưu câu khó vào danh sách ôn tập."
                : "Thử chọn Part khác hoặc xem tất cả."}
            </p>
          </section>
        ) : (
          <section className="bookmarks-list">
            {filteredBookmarks.map((question) => {
              const isCorrect = question.userAnswer === question.correctAnswer;

              return (
                <article key={question._id} className="learning-card">
                  <div className="learning-card-head" style={{ marginBottom: 16 }}>
                    <div className="learning-actions" style={{ flexWrap: "wrap" }}>
                      <span className="learning-badge">Part {question.part}</span>
                      <strong>Câu {question.questionNumber}</strong>
                      <span className="vocab-muted">{question.examName}</span>
                      {question.userAnswer && (
                        <span className={`learning-badge ${isCorrect ? "green" : "red"}`}>
                          <i
                            className={`bi ${isCorrect ? "bi-check-circle" : "bi-x-circle"}`}
                          />
                          {isCorrect ? "Đã trả lời đúng" : "Đã trả lời sai"}
                        </span>
                      )}
                    </div>
                    <button
                      className="learning-btn danger-soft"
                      onClick={() => removeBookmark(question._id)}
                    >
                      <i className="bi bi-bookmark-x" />
                      Bỏ lưu
                    </button>
                  </div>

                  {question.readingPassage && (
                    <div className="exam-passage">{question.readingPassage}</div>
                  )}

                  {question.imageUrl && (
                    <div className="exam-media">
                      <img
                        src={question.imageUrl}
                        alt={`Minh họa câu ${question.questionNumber}`}
                      />
                    </div>
                  )}

                  {question.questionText && (
                    <p className="exam-question-text">{question.questionText}</p>
                  )}

                  <div className="bookmark-options">
                    {Object.entries(question.answers || {}).map(([key, value]) => {
                      if (!value) return null;
                      const isCorrectAnswer = key === question.correctAnswer;
                      const isUserChoice = key === question.userAnswer;
                      return (
                        <div
                          key={key}
                          className={`exam-option ${isCorrectAnswer ? "correct" : ""} ${isUserChoice && !isCorrectAnswer ? "wrong" : ""}`}
                        >
                          <span className="exam-option-key">{key}</span>
                          <span>
                            {value}
                            {isUserChoice && !isCorrectAnswer && (
                              <strong> • Bạn đã chọn</strong>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {question.explanation && (
                    <div className="exam-explanation">
                      <strong>
                        <i className="bi bi-lightbulb" /> Lời giải chi tiết
                      </strong>
                      <p style={{ margin: "8px 0 0" }}>{question.explanation}</p>
                    </div>
                  )}

                  <div style={{ marginTop: 14 }}>
                    <Link
                      className="learning-btn"
                      to={`/exam/result/${question.attemptId}`}
                      style={{ fontSize: "0.85rem" }}
                    >
                      <i className="bi bi-clipboard-data" />
                      Xem toàn bộ kết quả lần thi này
                    </Link>
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

export default BookmarkedQuestions;





// import React, { useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { mockExamQuestions } from "../data/learningMockData";

// const buildBookmarks = () =>
//   mockExamQuestions
//     .filter((question) => [2, 5, 7].includes(question.part))
//     .map((question, index) => ({
//       ...question,
//       _id: `bookmark-${question._id}`,
//       examName: index === 0 ? "ETS TOEIC 2023 - Test 01" : "ETS TOEIC 2022 - Test 03",
//       bookmarkedAt: new Date(Date.now() - index * 86400000).toISOString(),
//     }));

// const BookmarkedQuestions = () => {
//   const [bookmarks, setBookmarks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filterPart, setFilterPart] = useState("All");

//   useEffect(() => {
//     const timer = window.setTimeout(() => {
//       setBookmarks(buildBookmarks());
//       setLoading(false);
//     }, 450);

//     return () => window.clearTimeout(timer);
//   }, []);

//   const filteredBookmarks = useMemo(() => {
//     if (filterPart === "All") return bookmarks;
//     return bookmarks.filter((question) => question.part === Number(filterPart));
//   }, [bookmarks, filterPart]);

//   const removeBookmark = (id) => {
//     if (!window.confirm("Bỏ lưu câu hỏi này khỏi danh sách ôn tập?")) return;
//     setBookmarks((prev) => prev.filter((item) => item._id !== id));
//   };

//   if (loading) {
//     return (
//       <div className="learning-page">
//         <div className="learning-shell learning-empty">
//           <span className="learning-spinner" />
//           <p className="learning-subtitle" style={{ marginTop: 14 }}>
//             Đang tải danh sách câu hỏi khó...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="learning-page">
//       <header className="learning-header">
//         <div className="learning-header-inner">
//           <div className="learning-title-row">
//             <div>
//               <p className="learning-kicker">Review Notebook</p>
//               <h1 className="learning-title">Ôn tập câu hỏi khó</h1>
//               <p className="learning-subtitle">
//                 Xem lại đáp án đúng, câu đã chọn và lời giải cho các câu bạn đã đánh dấu.
//               </p>
//             </div>
//             <Link className="learning-btn" to="/exams">
//               <i className="bi bi-arrow-left" />
//               Về kho đề
//             </Link>
//           </div>
//         </div>
//       </header>

//       <main className="learning-shell">
//         <section className="learning-card" style={{ marginBottom: 18 }}>
//           <div className="learning-section-heading">
//             <div className="learning-actions" style={{ flexWrap: "wrap" }}>
//               <strong>Lọc theo Part</strong>
//               <div className="learning-segmented">
//                 {["All", "1", "2", "3", "4", "5", "6", "7"].map((part) => (
//                   <button key={part} className={filterPart === part ? "active" : ""} onClick={() => setFilterPart(part)}>
//                     {part === "All" ? "Tất cả" : `Part ${part}`}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <span className="learning-badge amber">{filteredBookmarks.length} câu</span>
//           </div>
//         </section>

//         {filteredBookmarks.length === 0 ? (
//           <section className="learning-card learning-empty">
//             <span className="learning-icon amber" style={{ marginBottom: 14 }}>
//               <i className="bi bi-bookmark" />
//             </span>
//             <h2 className="exam-title" style={{ fontSize: "1.3rem" }}>
//               Chưa có câu hỏi nào
//             </h2>
//             <p className="learning-subtitle">
//               Khi làm bài, bấm biểu tượng bookmark để lưu câu khó vào danh sách ôn tập.
//             </p>
//           </section>
//         ) : (
//           <section className="bookmarks-list">
//             {filteredBookmarks.map((question) => (
//               <article key={question._id} className="learning-card">
//                 <div className="learning-card-head" style={{ marginBottom: 16 }}>
//                   <div className="learning-actions" style={{ flexWrap: "wrap" }}>
//                     <span className="learning-badge">Part {question.part}</span>
//                     <strong>Câu {question.questionNumber}</strong>
//                     <span className="vocab-muted">{question.examName}</span>
//                   </div>
//                   <button className="learning-btn danger-soft" onClick={() => removeBookmark(question._id)}>
//                     <i className="bi bi-bookmark-x" />
//                     Bỏ lưu
//                   </button>
//                 </div>

//                 {(question.passage || question.readingPassage) && (
//                   <div className="exam-passage">{question.passage || question.readingPassage}</div>
//                 )}

//                 <p className="exam-question-text">{question.questionText}</p>

//                 <div className="bookmark-options">
//                   {Object.entries(question.answers).map(([key, value]) => {
//                     const isCorrect = key === question.correctAnswer;
//                     return (
//                       <div key={key} className={`exam-option ${isCorrect ? "correct" : ""}`}>
//                         <span className="exam-option-key">{key}</span>
//                         <span>{value}</span>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 <div className="exam-explanation">
//                   <strong>
//                     <i className="bi bi-lightbulb" /> Lời giải chi tiết
//                   </strong>
//                   <p style={{ margin: "8px 0 0" }}>{question.explanation}</p>
//                 </div>
//               </article>
//             ))}
//           </section>
//         )}
//       </main>
//     </div>
//   );
// };

// export default BookmarkedQuestions;
