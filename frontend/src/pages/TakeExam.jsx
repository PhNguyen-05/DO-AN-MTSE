import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { examApi } from "../services/userApi";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const groupByPart = (questions) =>
  questions.reduce((groups, question) => {
    groups[question.part] = groups[question.part] || [];
    groups[question.part].push(question);
    return groups;
  }, {});

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarked, setBookmarked] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(7200); // default 120 phút
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [listeningStarted, setListeningStarted] = useState(false);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);

        const [examData, questionsData] = await Promise.all([
          examApi.getExam(examId),
          examApi.getQuestions(examId),
        ]);

        setExam(examData);

        const duration = (examData.durationMinutes || 120) * 60;
        const savedTime = localStorage.getItem(`exam_${examId}_timeLeft`);
        setTimeLeft(savedTime ? Number(savedTime) : duration);

        const sorted = [...questionsData].sort((a, b) => a.questionNumber - b.questionNumber);
        setQuestions(sorted);

        const savedAnswers = localStorage.getItem(`exam_${examId}_answers`);
        const savedBookmarks = localStorage.getItem(`exam_${examId}_bookmarks`);
        if (savedAnswers) setUserAnswers(JSON.parse(savedAnswers));
        if (savedBookmarks) setBookmarked(new Set(JSON.parse(savedBookmarks)));
      } catch (err) {
        if (err.status === 403) {
          setError("Bạn chưa mua đề thi này.");
        } else if (err.status === 404) {
          setError("Không tìm thấy đề thi.");
        } else {
          setError(err.message || "Không thể tải đề thi.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const partGroups = useMemo(() => groupByPart(questions), [questions]);

  const handleSubmitExam = async (autoSubmit = false) => {
    if (!exam) return;
    if (!autoSubmit && !window.confirm("Bạn có chắc chắn muốn nộp bài?")) return;

    setIsSubmitting(true);

    try {
      const duration = (exam.durationMinutes || 120) * 60;
      const timeSpent = duration - timeLeft;

      const result = await examApi.submitAttempt(examId, {
        answers: userAnswers,
        bookmarked: [...bookmarked],
        timeSpent,
      });

      // Xóa dữ liệu tạm
      localStorage.removeItem(`exam_${examId}_answers`);
      localStorage.removeItem(`exam_${examId}_bookmarks`);
      localStorage.removeItem(`exam_${examId}_timeLeft`);

      navigate(`/exam/result/${result._id}`);
    } catch (err) {
      alert(err.message || "Nộp bài thất bại. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  // Đếm ngược thời gian
  useEffect(() => {
    if (loading || isSubmitting) return undefined;
    if (timeLeft <= 0) {
      handleSubmitExam(true);
      return undefined;
    }

    const timer = window.setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => window.clearInterval(timer);
  }, [timeLeft, loading, isSubmitting]);

  // Lưu trạng thái vào localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(userAnswers));
    }
  }, [examId, userAnswers, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(`exam_${examId}_bookmarks`, JSON.stringify([...bookmarked]));
    }
  }, [bookmarked, examId, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(`exam_${examId}_timeLeft`, String(timeLeft));
    }
  }, [examId, loading, timeLeft]);

  const selectAnswer = (questionNumber, answer) => {
    setUserAnswers((prev) => ({ ...prev, [questionNumber]: answer }));
  };

  const toggleBookmark = (questionNumber) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(questionNumber)) next.delete(questionNumber);
      else next.add(questionNumber);
      return next;
    });
  };

  const playAudio = (audioUrl) => {
    if (!audioUrl || !audioRef.current) return;

    if (currentAudioUrl === audioUrl && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setCurrentAudioUrl(audioUrl);
    audioRef.current.src = audioUrl;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <span className="learning-spinner" />
          <p className="learning-subtitle" style={{ marginTop: 14 }}>
            Đang tải cấu trúc đề thi và khôi phục bài làm...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <h1 className="learning-title">{error}</h1>
          <button className="learning-btn primary" onClick={() => navigate("/practice")}>
            Quay lại kho đề
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion || !exam) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <h1 className="learning-title">Đề thi chưa có câu hỏi</h1>
          <button className="learning-btn primary" onClick={() => navigate("/practice")}>
            Quay lại kho đề
          </button>
        </div>
      </div>
    );
  }

  // Audio cho Part hiện tại: ưu tiên audio riêng theo part, fallback về audio tổng
  const partKey = `part${currentQuestion.part}`;
  const listeningAudioUrl =
    (exam.partAudioUrls?.[partKey]) ||
    (currentQuestion.part <= 4 ? exam.audioUrls?.[0] : null) ||
    null;
  const questionImage = currentQuestion.imageUrl || currentQuestion.image_url || null;

  return (
    <div className="exam-page">
      <header className="exam-topbar">
        <div className="exam-topbar-inner">
          <button
            className="learning-btn ghost"
            onClick={() => navigate("/practice")}
            title="Thoát bài thi"
          >
            <i className="bi bi-x-lg" />
            Thoát
          </button>

          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="exam-title">{exam.name}</h1>
            <p className="exam-subtitle">
              {exam.skill} • {questions.length} câu • đã làm {answeredCount}/{questions.length}
            </p>
          </div>

          <div className="learning-actions">
            <div className={`exam-timer ${timeLeft < 300 ? "danger" : ""}`}>
              <i className="bi bi-clock" />
              {formatTime(timeLeft)}
            </div>
            <button
              className="learning-btn primary"
              onClick={() => handleSubmitExam()}
              disabled={isSubmitting}
            >
              <i className="bi bi-send-check" />
              {isSubmitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          </div>
        </div>
        <div className="exam-progress-line">
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="exam-layout">
        <aside className="exam-panel exam-sidebar">
          <div className="learning-card-head" style={{ marginBottom: 14 }}>
            <div>
              <strong>Bảng câu hỏi</strong>
              <p className="vocab-muted">Đi nhanh tới từng Part</p>
            </div>
            <span className="learning-badge green">{progress}%</span>
          </div>

          {Object.entries(partGroups).map(([part, partQuestions]) => (
            <section key={part} style={{ marginTop: 16 }}>
              <div className="learning-section-heading" style={{ marginBottom: 8 }}>
                <span className="learning-badge">Part {part}</span>
                <small className="vocab-muted">{partQuestions.length} câu</small>
              </div>
              <div className="exam-question-grid">
                {partQuestions.map((question) => {
                  const index = questions.findIndex((item) => item._id === question._id);
                  const isAnswered = Boolean(userAnswers[question.questionNumber]);
                  const isBookmarked = bookmarked.has(question.questionNumber);
                  return (
                    <button
                      key={question._id}
                      className={[
                        "exam-question-button",
                        index === currentQuestionIndex ? "active" : "",
                        isAnswered ? "answered" : "",
                        isBookmarked ? "bookmarked" : "",
                      ].join(" ")}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {question.questionNumber}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </aside>

        <section className="exam-panel">
          <div className="exam-question-head">
            <div className="learning-actions">
              <span className="learning-badge">Part {currentQuestion.part}</span>
              <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
                Câu {currentQuestion.questionNumber}
              </h2>
            </div>
            <button
              className={`learning-btn ${bookmarked.has(currentQuestion.questionNumber) ? "danger-soft" : ""}`}
              onClick={() => toggleBookmark(currentQuestion.questionNumber)}
            >
              <i
                className={`bi ${bookmarked.has(currentQuestion.questionNumber) ? "bi-bookmark-fill" : "bi-bookmark"}`}
              />
              {bookmarked.has(currentQuestion.questionNumber) ? "Đã lưu câu khó" : "Lưu câu khó"}
            </button>
          </div>

          {/* 
            This section renders the audio player (acting as an "audio strip") for listening parts (Part 1-4).
            It uses the `listeningAudioUrl` which is derived from `exam.audioUrls`.
            The functionality includes play/pause and displays "Bắt đầu nghe" (Start listening)
            or "Tạm dừng/Tiếp tục" (Pause/Continue) buttons.
            Ensure `exam.audioUrls` is correctly populated from the backend for the audio to be available.
          */}
          {listeningAudioUrl && currentQuestion.part <= 4 && (
            <div
              className="exam-audio"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                marginBottom: 18,
              }}
            >
              <div className="learning-actions">
                <span className="exam-icon violet">
                  <i className="bi bi-headphones" />
                </span>
                <div>
                  <strong>Audio Listening</strong>
                  <p className="vocab-muted" style={{ fontSize: "0.82rem" }}>
                    {currentQuestion.part <= 4
                      ? "Phần nghe — phát 1 lần, không tua lại trong thi thật"
                      : ""}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {!listeningStarted ? (
                  <button
                    className="learning-btn primary"
                    onClick={() => {
                      setListeningStarted(true);
                      playAudio(listeningAudioUrl);
                    }}
                  >
                    <i className="bi bi-play-fill" />
                    Bắt đầu nghe
                  </button>
                ) : (
                  <button
                    className="learning-btn"
                    onClick={() => playAudio(listeningAudioUrl)}
                  >
                    <i
                      className={`bi ${
                        isPlaying && currentAudioUrl === listeningAudioUrl
                          ? "bi-pause-fill"
                          : "bi-play-fill"
                      }`}
                    />
                    {isPlaying && currentAudioUrl === listeningAudioUrl
                      ? "Tạm dừng"
                      : "Tiếp tục"}
                  </button>
                )}
                <span className="learning-badge">
                  Part {currentQuestion.part}
                </span>
              </div>
            </div>
          )}

          {currentQuestion.readingPassage && (
            <div className="exam-passage">{currentQuestion.readingPassage}</div>
          )}

          {/* 
            This block handles the display of images for Part 1 questions.
            It assumes that each Part 1 question (up to 5 as per common TOEIC structure)
            will have a unique image URL provided by the backend via `currentQuestion.imageUrl`
            or `currentQuestion.image_url`. The current rendering logic is set up
            to display one such image per question when the `part` is 1.
          */}
          {questionImage && currentQuestion.part === 1 && (
            <div
              className="exam-media"
              style={{
                border: "2px solid #b7cdf9",
                borderRadius: 10,
                overflow: "hidden",
                background: "#f0f5ff",
                padding: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderBottom: "1px solid #d6deeb",
                  background: "#e9f0ff",
                }}
              >
                <i className="bi bi-image" style={{ color: "#0b57c5" }} />
                <strong style={{ color: "#0b57c5", fontSize: "0.88rem" }}>
                  Ảnh minh họa — Câu {currentQuestion.questionNumber}
                </strong>
              </div>
              <img
                src={questionImage}
                alt={`Ảnh Part 1 câu ${currentQuestion.questionNumber}`}
                style={{
                  display: "block",
                  width: "100%",
                  maxHeight: 500,
                  objectFit: "contain",
                  background: "#fff",
                  padding: 12,
                }}
              />
            </div>
          )}

          {/* Part khác vẫn hiện ảnh bình thường nếu có */}
          {questionImage && currentQuestion.part !== 1 && (
            <div className="exam-media">
              <img
                src={questionImage}
                alt={`Minh họa câu ${currentQuestion.questionNumber}`}
              />
            </div>
          )}

          {/* Part 2, 3, 4 không có questionText riêng — câu hỏi nằm trong audio */}
          {currentQuestion.questionText && (
            <p className="exam-question-text">{currentQuestion.questionText}</p>
          )}

          <div className="exam-options">
            {Object.entries(currentQuestion.answers || {}).map(([key, value]) => {
              if (!value) return null;
              const isSelected = userAnswers[currentQuestion.questionNumber] === key;
              return (
                <button
                  key={key}
                  className={`exam-option ${isSelected ? "selected" : ""}`}
                  onClick={() => selectAnswer(currentQuestion.questionNumber, key)}
                >
                  <span className="exam-option-key">{key}</span>
                  <span>{value}</span>
                </button>
              );
            })}
          </div>

          <div className="exam-footer-actions">
            <button
              className="learning-btn"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <i className="bi bi-arrow-left" />
              Câu trước
            </button>
            <span className="vocab-muted">
              Câu {currentQuestionIndex + 1}/{questions.length}
            </span>
            <button
              className="learning-btn primary"
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
              }
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Câu tiếp
              <i className="bi bi-arrow-right" />
            </button>
          </div>
        </section>
      </main>

      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} hidden />
    </div>
  );
};

export default TakeExam;


