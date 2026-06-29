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
  const [activePart, setActivePart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const questionsByPart = useMemo(() => {
    if (!result) return {};
    const map = {};
    for (let p = 1; p <= 7; p++) {
      map[p] = (result.questions || []).filter(q => q.part === p);
    }
    return map;
  }, [result]);

  const partStats = useMemo(() => {
    if (!result) return {};
    const answersObj = result.attempt?.answers || {};
    const map = {};
    for (let p = 1; p <= 7; p++) {
      const qs = questionsByPart[p] || [];
      const correct = qs.filter(q => answersObj[q.questionNumber] === q.correctAnswer).length;
      map[p] = {
        total: qs.length,
        correct,
        acc: qs.length ? Math.round((correct / qs.length) * 100) : 0,
      };
    }
    return map;
  }, [questionsByPart, result]);


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
          {/* Header + Tab chọn Part */}
        <div className="learning-section-heading" style={{ marginBottom: 14 }}>
          <div>
            <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>Xem chi tiết từng câu</h2>
            <p className="vocab-muted">Chọn Part để xem đáp án và lời giải.</p>
          </div>
        </div>

        {/* Tab row */}
        <section className="learning-card" style={{ marginBottom: 18, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5, 6, 7].map((p) => {
              const ps = partStats[p] || {};
              const accClass = ps.acc >= 75 ? "green" : ps.acc >= 55 ? "amber" : "red";
              return (
                <button
                  key={p}
                  className={`learning-btn ${activePart === p ? "primary" : ""}`}
                  style={{ flexDirection: "column", gap: 2, padding: "8px 14px", minHeight: "auto" }}
                  onClick={() => setActivePart(prev => prev === p ? null : p)}
                >
                  <span style={{ fontSize: "0.85rem" }}>Part {p}</span>
                  {ps.total > 0 && (
                    <span className={`learning-badge ${accClass}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                      {ps.acc}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Nội dung Part được chọn */}
        {activePart === null ? (
          <div className="learning-card learning-empty" style={{ padding: "36px 20px" }}>
            <span className="learning-icon amber"><i className="bi bi-hand-index" /></span>
            <p className="vocab-muted" style={{ marginTop: 12 }}>Bấm vào Part bên trên để xem chi tiết câu hỏi.</p>
          </div>
        ) : (
          <>
            {/* Header thống kê Part đang chọn */}
            <div className="learning-card" style={{ marginBottom: 14 }}>
              <div className="learning-card-head">
                <div className="learning-actions">
                  <span className="learning-badge">Part {activePart}</span>
                  <strong>{partStats[activePart]?.correct}/{partStats[activePart]?.total} câu đúng</strong>
                </div>
                <span className={`learning-badge ${partStats[activePart]?.acc >= 75 ? "green" : partStats[activePart]?.acc >= 55 ? "amber" : "red"}`}>
                  {partStats[activePart]?.acc}%
                </span>
              </div>
              <div className="learning-progress" style={{ marginTop: 10 }}>
                <span
                  className={partStats[activePart]?.acc >= 75 ? "green" : partStats[activePart]?.acc >= 55 ? "amber" : "red"}
                  style={{ width: `${partStats[activePart]?.acc}%` }}
                />
              </div>
            </div>

            {/* Danh sách câu hỏi — giữ nguyên JSX câu hỏi cũ, chỉ đổi data source */}
            {(questionsByPart[activePart] || []).map((question) => {
              const answersObj = attempt.answers instanceof Object ? attempt.answers : {};
              const userAnswer = answersObj[question.questionNumber];
              const isCorrect = userAnswer === question.correctAnswer;
              const isBookmarked = (attempt.bookmarked || []).includes(question.questionNumber);


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
          </>
        )}
      </section>
      </main>
    </div>
  );
};

export default ExamResult;


