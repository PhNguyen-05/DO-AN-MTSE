import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { attemptApi } from "../services/userApi";

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} phút ${secs.toString().padStart(2, "0")} giây`;
};

const ExamResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await attemptApi.getResult(attemptId);
        setResult(data);
      } catch (err) {
        setError(err.message || "Không thể tải kết quả bài thi.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <span className="learning-spinner" />
          <p className="learning-subtitle" style={{ marginTop: 14 }}>
            Đang tổng hợp kết quả bài thi...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <h1 className="learning-title">Không thể tải kết quả</h1>
          <p className="learning-subtitle">{error}</p>
          <button className="learning-btn primary" onClick={() => navigate("/exams")}>
            Về kho đề
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { exam, attempt, questions, stats } = result;

  return (
    <div className="learning-page">
      <header className="learning-header">
        <div className="learning-header-inner">
          <div className="learning-title-row">
            <div>
              <p className="learning-kicker">Exam Result</p>
              <h1 className="learning-title">Kết quả bài thi</h1>
              <p className="learning-subtitle">
                {exam?.name} • Nộp lúc{" "}
                {attempt.submittedAt
                  ? new Date(attempt.submittedAt).toLocaleString("vi-VN")
                  : ""}
              </p>
            </div>
            <div className="learning-actions">
              <button
                className="learning-btn"
                onClick={() => navigate(`/exam/${exam?._id}`)}
              >
                <i className="bi bi-arrow-counterclockwise" />
                Làm lại bài
              </button>
              <Link className="learning-btn primary" to="/exams">
                <i className="bi bi-grid" />
                Về kho đề
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="learning-shell">
        {/* Tổng điểm */}
        <section
          className="learning-grid"
          style={{
            gridTemplateColumns: "minmax(280px, 0.8fr) minmax(0, 1.2fr)",
            marginBottom: 18,
          }}
        >
          <article className="learning-card" style={{ textAlign: "center" }}>
            <span className="learning-badge green">TOEIC estimated score</span>
            <strong className="learning-stat-value" style={{ fontSize: "4rem" }}>
              {stats.score}
            </strong>
            <span className="learning-stat-label">/ 990</span>
            <div className="learning-progress" style={{ marginTop: 18 }}>
              <span
                className={stats.accuracy >= 70 ? "green" : "amber"}
                style={{ width: `${stats.accuracy}%` }}
              />
            </div>
            <p className="vocab-muted" style={{ marginTop: 10 }}>
              Accuracy {stats.accuracy}%
            </p>
          </article>

          <div className="learning-grid cols-4">
            <article className="learning-card">
              <span className="learning-icon green">
                <i className="bi bi-check2-circle" />
              </span>
              <strong className="learning-stat-value">{stats.correctCount}</strong>
              <span className="learning-stat-label">Câu đúng</span>
            </article>
            <article className="learning-card">
              <span className="learning-icon red">
                <i className="bi bi-x-circle" />
              </span>
              <strong className="learning-stat-value">
                {stats.totalQuestions - stats.correctCount}
              </strong>
              <span className="learning-stat-label">Câu sai / bỏ trống</span>
            </article>
            <article className="learning-card">
              <span className="learning-icon amber">
                <i className="bi bi-stopwatch" />
              </span>
              <strong className="learning-stat-value">
                {Math.floor((attempt.timeSpent || 0) / 60)}
              </strong>
              <span className="learning-stat-label">Phút làm bài</span>
            </article>
            <article className="learning-card">
              <span className="learning-icon violet">
                <i className="bi bi-bookmark-check" />
              </span>
              <strong className="learning-stat-value">
                {(attempt.bookmarked || []).length}
              </strong>
              <span className="learning-stat-label">Câu đã bookmark</span>
            </article>
          </div>
        </section>

        {/* Accuracy theo Part */}
        <section className="learning-card" style={{ marginBottom: 18 }}>
          <div className="learning-section-heading" style={{ marginBottom: 14 }}>
            <div>
              <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
                Độ chính xác theo Part
              </h2>
              <p className="vocab-muted">Tính từ dữ liệu bài làm hiện tại.</p>
            </div>
            <span className="learning-badge">
              Thời gian: {formatDuration(attempt.timeSpent || 0)}
            </span>
          </div>

          <div className="analytics-bars">
            {Object.entries(stats.byPart || {}).map(([part, item]) => {
              const partAccuracy = item.total
                ? Math.round((item.correct / item.total) * 100)
                : 0;
              return (
                <div key={part} className="analytics-part-row">
                  <strong>Part {part}</strong>
                  <div>
                    <div className="learning-card-head" style={{ marginBottom: 6 }}>
                      <span className="vocab-muted">
                        {item.correct}/{item.total} câu đúng
                      </span>
                      {partAccuracy < 60 && (
                        <span className="learning-badge red">Cần ôn lại</span>
                      )}
                    </div>
                    <div className="learning-progress">
                      <span
                        className={
                          partAccuracy >= 75
                            ? "green"
                            : partAccuracy >= 60
                              ? "amber"
                              : "red"
                        }
                        style={{ width: `${partAccuracy}%` }}
                      />
                    </div>
                  </div>
                  <strong>{partAccuracy}%</strong>
                </div>
              );
            })}
          </div>
        </section>

        {/* Chi tiết từng câu */}
        <section className="bookmarks-list">
          <div className="learning-section-heading">
            <div>
              <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
                Xem chi tiết từng câu
              </h2>
              <p className="vocab-muted">
                Đối chiếu đáp án đã chọn, đáp án đúng và lời giải.
              </p>
            </div>
          </div>

          {(questions || []).map((question) => {
            // attempt.answers là Map (từ backend) hoặc object
            const answersObj =
              attempt.answers instanceof Object ? attempt.answers : {};
            const userAnswer = answersObj[question.questionNumber];
            const isCorrect = userAnswer === question.correctAnswer;
            const isBookmarked = (attempt.bookmarked || []).includes(
              question.questionNumber,
            );

            return (
              <article key={question._id} className="learning-card">
                <div className="learning-card-head" style={{ marginBottom: 16 }}>
                  <div className="learning-actions" style={{ flexWrap: "wrap" }}>
                    <span className="learning-badge">Part {question.part}</span>
                    <strong>Câu {question.questionNumber}</strong>
                    <span className={`learning-badge ${isCorrect ? "green" : "red"}`}>
                      <i
                        className={`bi ${isCorrect ? "bi-check-circle" : "bi-x-circle"}`}
                      />
                      {isCorrect ? "Đúng" : userAnswer ? "Sai" : "Bỏ trống"}
                    </span>
                    {isBookmarked && (
                      <span className="learning-badge amber">Câu khó</span>
                    )}
                  </div>
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
                    const isUserChoice = userAnswer === key;
                    const isRightAnswer = question.correctAnswer === key;
                    return (
                      <div
                        key={key}
                        className={`exam-option ${isRightAnswer ? "correct" : ""} ${isUserChoice && !isRightAnswer ? "wrong" : ""}`}
                      >
                        <span className="exam-option-key">{key}</span>
                        <span>
                          {value}
                          {isUserChoice && <strong> • Bạn chọn</strong>}
                          {isRightAnswer && <strong> • Đáp án đúng</strong>}
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
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default ExamResult;





// import React, { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { mockExam, mockExamQuestions } from "../data/learningMockData";

// const formatDuration = (seconds) => {
//   const mins = Math.floor(seconds / 60);
//   const secs = seconds % 60;
//   return `${mins} phút ${secs.toString().padStart(2, "0")} giây`;
// };

// const calculateMockScore = (correctCount, total) => {
//   if (!total) return 0;
//   return Math.min(990, Math.max(10, Math.round((correctCount / total) * 990 / 5) * 5));
// };

// const ExamResult = () => {
//   const { attemptId } = useParams();
//   const navigate = useNavigate();
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const timer = window.setTimeout(() => {
//       const savedAttempt = localStorage.getItem("mock_latest_attempt");
//       const attempt = savedAttempt
//         ? JSON.parse(savedAttempt)
//         : {
//             exam: mockExam,
//             answers: { 1: "A", 12: "A", 41: "A", 72: "D", 101: "A", 102: "B", 132: "B", 153: "A" },
//             bookmarked: [41, 153],
//             timeSpent: 3864,
//             submittedAt: new Date().toISOString(),
//           };

//       setResult({
//         attemptId,
//         exam: attempt.exam || mockExam,
//         attempt,
//         questions: mockExamQuestions,
//       });
//       setLoading(false);
//     }, 500);

//     return () => window.clearTimeout(timer);
//   }, [attemptId]);

//   const stats = useMemo(() => {
//     if (!result) return null;
//     const correctCount = result.questions.filter(
//       (question) => result.attempt.answers?.[question.questionNumber] === question.correctAnswer,
//     ).length;
//     const wrongCount = result.questions.length - correctCount;
//     const accuracy = Math.round((correctCount / result.questions.length) * 100);
//     const score = calculateMockScore(correctCount, result.questions.length);

//     const byPart = result.questions.reduce((acc, question) => {
//       acc[question.part] = acc[question.part] || { total: 0, correct: 0 };
//       acc[question.part].total += 1;
//       if (result.attempt.answers?.[question.questionNumber] === question.correctAnswer) {
//         acc[question.part].correct += 1;
//       }
//       return acc;
//     }, {});

//     return { correctCount, wrongCount, accuracy, score, byPart };
//   }, [result]);

//   if (loading) {
//     return (
//       <div className="learning-page">
//         <div className="learning-shell learning-empty">
//           <span className="learning-spinner" />
//           <p className="learning-subtitle" style={{ marginTop: 14 }}>
//             Đang tổng hợp kết quả bài thi...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const { exam, attempt, questions } = result;

//   return (
//     <div className="learning-page">
//       <header className="learning-header">
//         <div className="learning-header-inner">
//           <div className="learning-title-row">
//             <div>
//               <p className="learning-kicker">Exam Result</p>
//               <h1 className="learning-title">Kết quả bài thi</h1>
//               <p className="learning-subtitle">
//                 {exam.name} • Nộp lúc {new Date(attempt.submittedAt).toLocaleString("vi-VN")}
//               </p>
//             </div>
//             <div className="learning-actions">
//               <button className="learning-btn" onClick={() => navigate(`/exam/${exam._id || mockExam._id}`)}>
//                 <i className="bi bi-arrow-counterclockwise" />
//                 Làm lại bài
//               </button>
//               <Link className="learning-btn primary" to="/exams">
//                 <i className="bi bi-grid" />
//                 Về kho đề
//               </Link>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="learning-shell">
//         <section className="learning-grid" style={{ gridTemplateColumns: "minmax(280px, 0.8fr) minmax(0, 1.2fr)", marginBottom: 18 }}>
//           <article className="learning-card" style={{ textAlign: "center" }}>
//             <span className="learning-badge green">TOEIC estimated score</span>
//             <strong className="learning-stat-value" style={{ fontSize: "4rem" }}>
//               {stats.score}
//             </strong>
//             <span className="learning-stat-label">/ 990</span>
//             <div className="learning-progress" style={{ marginTop: 18 }}>
//               <span className={stats.accuracy >= 70 ? "green" : "amber"} style={{ width: `${stats.accuracy}%` }} />
//             </div>
//             <p className="vocab-muted" style={{ marginTop: 10 }}>
//               Accuracy {stats.accuracy}%
//             </p>
//           </article>

//           <div className="learning-grid cols-4">
//             <article className="learning-card">
//               <span className="learning-icon green">
//                 <i className="bi bi-check2-circle" />
//               </span>
//               <strong className="learning-stat-value">{stats.correctCount}</strong>
//               <span className="learning-stat-label">Câu đúng</span>
//             </article>
//             <article className="learning-card">
//               <span className="learning-icon red">
//                 <i className="bi bi-x-circle" />
//               </span>
//               <strong className="learning-stat-value">{stats.wrongCount}</strong>
//               <span className="learning-stat-label">Câu sai / bỏ trống</span>
//             </article>
//             <article className="learning-card">
//               <span className="learning-icon amber">
//                 <i className="bi bi-stopwatch" />
//               </span>
//               <strong className="learning-stat-value">{Math.floor(attempt.timeSpent / 60)}</strong>
//               <span className="learning-stat-label">Phút làm bài</span>
//             </article>
//             <article className="learning-card">
//               <span className="learning-icon violet">
//                 <i className="bi bi-bookmark-check" />
//               </span>
//               <strong className="learning-stat-value">{attempt.bookmarked?.length || 0}</strong>
//               <span className="learning-stat-label">Câu đã bookmark</span>
//             </article>
//           </div>
//         </section>

//         <section className="learning-card" style={{ marginBottom: 18 }}>
//           <div className="learning-section-heading" style={{ marginBottom: 14 }}>
//             <div>
//               <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
//                 Độ chính xác theo Part
//               </h2>
//               <p className="vocab-muted">Tính từ dữ liệu bài làm hiện tại.</p>
//             </div>
//             <span className="learning-badge">Thời gian: {formatDuration(attempt.timeSpent)}</span>
//           </div>

//           <div className="analytics-bars">
//             {Object.entries(stats.byPart).map(([part, item]) => {
//               const partAccuracy = Math.round((item.correct / item.total) * 100);
//               return (
//                 <div key={part} className="analytics-part-row">
//                   <strong>Part {part}</strong>
//                   <div>
//                     <div className="learning-card-head" style={{ marginBottom: 6 }}>
//                       <span className="vocab-muted">
//                         {item.correct}/{item.total} câu đúng
//                       </span>
//                       {partAccuracy < 60 && <span className="learning-badge red">Cần ôn lại</span>}
//                     </div>
//                     <div className="learning-progress">
//                       <span className={partAccuracy >= 75 ? "green" : partAccuracy >= 60 ? "amber" : "red"} style={{ width: `${partAccuracy}%` }} />
//                     </div>
//                   </div>
//                   <strong>{partAccuracy}%</strong>
//                 </div>
//               );
//             })}
//           </div>
//         </section>

//         <section className="bookmarks-list">
//           <div className="learning-section-heading">
//             <div>
//               <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
//                 Xem chi tiết từng câu
//               </h2>
//               <p className="vocab-muted">Đối chiếu đáp án đã chọn, đáp án đúng và lời giải.</p>
//             </div>
//           </div>

//           {questions.map((question) => {
//             const userAnswer = attempt.answers?.[question.questionNumber];
//             const isCorrect = userAnswer === question.correctAnswer;
//             const isBookmarked = attempt.bookmarked?.includes(question.questionNumber);

//             return (
//               <article key={question._id} className="learning-card">
//                 <div className="learning-card-head" style={{ marginBottom: 16 }}>
//                   <div className="learning-actions" style={{ flexWrap: "wrap" }}>
//                     <span className="learning-badge">Part {question.part}</span>
//                     <strong>Câu {question.questionNumber}</strong>
//                     <span className={`learning-badge ${isCorrect ? "green" : "red"}`}>
//                       <i className={`bi ${isCorrect ? "bi-check-circle" : "bi-x-circle"}`} />
//                       {isCorrect ? "Đúng" : userAnswer ? "Sai" : "Bỏ trống"}
//                     </span>
//                     {isBookmarked && <span className="learning-badge amber">Câu khó</span>}
//                   </div>
//                 </div>

//                 {(question.passage || question.readingPassage) && (
//                   <div className="exam-passage">{question.passage || question.readingPassage}</div>
//                 )}

//                 <p className="exam-question-text">{question.questionText}</p>

//                 <div className="bookmark-options">
//                   {Object.entries(question.answers).map(([key, value]) => {
//                     const isUserChoice = userAnswer === key;
//                     const isRightAnswer = question.correctAnswer === key;
//                     return (
//                       <div
//                         key={key}
//                         className={`exam-option ${isRightAnswer ? "correct" : ""} ${isUserChoice && !isRightAnswer ? "wrong" : ""}`}
//                       >
//                         <span className="exam-option-key">{key}</span>
//                         <span>
//                           {value}
//                           {isUserChoice && <strong> • Bạn chọn</strong>}
//                           {isRightAnswer && <strong> • Đáp án đúng</strong>}
//                         </span>
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
//             );
//           })}
//         </section>
//       </main>
//     </div>
//   );
// };

// export default ExamResult;
