import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockExam, mockExamQuestions } from "../data/learningMockData";

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
  const [timeLeft, setTimeLeft] = useState(mockExam.duration);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentAudioUrl, setCurrentAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExam({ ...mockExam, _id: examId || mockExam._id });
      setQuestions([...mockExamQuestions].sort((a, b) => a.questionNumber - b.questionNumber));

      const savedAnswers = localStorage.getItem(`exam_${examId}_answers`);
      const savedBookmarks = localStorage.getItem(`exam_${examId}_bookmarks`);

      if (savedAnswers) setUserAnswers(JSON.parse(savedAnswers));
      if (savedBookmarks) setBookmarked(new Set(JSON.parse(savedBookmarks)));

      setLoading(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [examId]);

  useEffect(() => {
    if (loading || isSubmitting) return undefined;
    if (timeLeft <= 0) {
      handleSubmitExam(true);
      return undefined;
    }

    const timer = window.setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => window.clearInterval(timer);
  }, [timeLeft, loading, isSubmitting]);

  useEffect(() => {
    localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(userAnswers));
  }, [examId, userAnswers]);

  useEffect(() => {
    localStorage.setItem(`exam_${examId}_bookmarks`, JSON.stringify([...bookmarked]));
  }, [bookmarked, examId]);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const partGroups = useMemo(() => groupByPart(questions), [questions]);

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

  const handleSubmitExam = (autoSubmit = false) => {
    if (!autoSubmit && !window.confirm("Bạn có chắc chắn muốn nộp bài?")) return;

    setIsSubmitting(true);
    const attempt = {
      exam,
      answers: userAnswers,
      bookmarked: [...bookmarked],
      timeSpent: mockExam.duration - timeLeft,
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem("mock_latest_attempt", JSON.stringify(attempt));
    localStorage.removeItem(`exam_${examId}_answers`);
    localStorage.removeItem(`exam_${examId}_bookmarks`);

    window.setTimeout(() => {
      navigate("/exam/result/mock_attempt_id_123");
    }, 650);
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

  if (!currentQuestion) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <h1 className="learning-title">Không tìm thấy câu hỏi</h1>
          <button className="learning-btn primary" onClick={() => navigate("/exams")}>
            Quay lại kho đề
          </button>
        </div>
      </div>
    );
  }

  const questionAudio = currentQuestion.audioUrl || currentQuestion.audio_url;
  const questionImage = currentQuestion.imageUrl || currentQuestion.image_url;

  return (
    <div className="exam-page">
      <header className="exam-topbar">
        <div className="exam-topbar-inner">
          <div>
            <button className="learning-btn ghost" onClick={() => navigate("/exams")} title="Thoát bài thi">
              <i className="bi bi-x-lg" />
              Thoát
            </button>
          </div>
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
            <button className="learning-btn primary" onClick={() => handleSubmitExam()} disabled={isSubmitting}>
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
              <i className={`bi ${bookmarked.has(currentQuestion.questionNumber) ? "bi-bookmark-fill" : "bi-bookmark"}`} />
              {bookmarked.has(currentQuestion.questionNumber) ? "Đã lưu câu khó" : "Lưu câu khó"}
            </button>
          </div>

          {questionAudio && currentQuestion.part <= 4 && (
            <div className="exam-audio">
              <div className="learning-actions">
                <span className="exam-icon violet">
                  <i className="bi bi-headphones" />
                </span>
                <div>
                  <strong>Audio câu hỏi</strong>
                  <p className="vocab-muted">Nghe kỹ trước khi chọn đáp án.</p>
                </div>
              </div>
              <button className="learning-btn primary" onClick={() => playAudio(questionAudio)}>
                <i className={`bi ${isPlaying && currentAudioUrl === questionAudio ? "bi-pause-fill" : "bi-play-fill"}`} />
                {isPlaying && currentAudioUrl === questionAudio ? "Tạm dừng" : "Phát audio"}
              </button>
            </div>
          )}

          {(currentQuestion.passage || currentQuestion.readingPassage) && (
            <div className="exam-passage">{currentQuestion.passage || currentQuestion.readingPassage}</div>
          )}

          {questionImage && (
            <div className="exam-media">
              <img src={questionImage} alt={`Minh họa câu ${currentQuestion.questionNumber}`} />
            </div>
          )}

          <p className="exam-question-text">{currentQuestion.questionText}</p>

          <div className="exam-options">
            {Object.entries(currentQuestion.answers).map(([key, value]) => {
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
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
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
