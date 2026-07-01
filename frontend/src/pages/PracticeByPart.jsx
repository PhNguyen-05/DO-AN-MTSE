import React, { useMemo, useRef, useState, useEffect } from "react";

const BASE = import.meta.env.VITE_API_URL || "";
const getToken = () => {
  const t = localStorage.getItem("token");
  if (!t) return "";
  return t.startsWith("Bearer ") ? t : `Bearer ${t}`;
};

// ── Fetch câu hỏi có correctAnswer (dùng admin endpoint hoặc practice endpoint) ──
// Backend cần trả về correctAnswer + explanation cho practice mode.
// Dùng /admin/exams/:id/questions (yêu cầu token admin)
// HOẶC thêm route /user/exams/:id/practice-questions vào backend.
// Hiện tại dùng /admin/exams/:id/questions – nếu user không phải admin,
// backend sẽ trả 403 và component sẽ hiện lỗi.
const fetchPracticeQuestions = async (examId) => {
  const res = await fetch(`${BASE}/admin/exams/${examId}/questions`, {
    headers: { Authorization: getToken() },
  });
  if (!res.ok) {
    // Fallback: thử endpoint practice riêng (nếu đã thêm vào backend)
    const res2 = await fetch(`${BASE}/user/exams/${examId}/practice-questions`, {
      headers: { Authorization: getToken() },
    });
    if (!res2.ok) {
      const data2 = await res2.json().catch(() => ({}));
      throw new Error(data2.message || `Không thể tải câu hỏi (${res2.status})`);
    }
    return res2.json();
  }
  return res.json();
};

// ── Fetch danh sách đề (có thể access) ──────────────────────────────────────────
const fetchExams = async () => {
  const res = await fetch(`${BASE}/user/exams`, {
    headers: { Authorization: getToken() },
  });
  if (!res.ok) throw new Error("Không thể tải danh sách đề thi.");
  return res.json();
};

// ── Part metadata ─────────────────────────────────────────────
const toeicParts = {
  Listening: [
    {
      id: 1, name: "Mô tả tranh", type: "Nghe và chọn mô tả đúng",
      desc: "Nghe 4 mô tả, chọn cái khớp với bức ảnh được hiển thị.",
      time: "~4 phút", diff: "Dễ", qCount: 6, icon: "bi-image", tone: "",
    },
    {
      id: 2, name: "Hỏi & Đáp", type: "Nghe câu hỏi và chọn câu trả lời",
      desc: "Nghe câu hỏi/phát biểu, chọn 1 trong 3 câu trả lời phù hợp.",
      time: "~10 phút", diff: "Trung bình", qCount: 25, icon: "bi-chat-dots", tone: "green",
    },
    {
      id: 3, name: "Đoạn hội thoại", type: "Nghe đoạn hội thoại và trả lời",
      desc: "Nghe hội thoại 2–3 người, trả lời 3 câu hỏi cho mỗi đoạn.",
      time: "~25 phút", diff: "Khó", qCount: 39, icon: "bi-people", tone: "amber",
    },
    {
      id: 4, name: "Bài nói ngắn", type: "Nghe bài nói và trả lời câu hỏi",
      desc: "Nghe monologue (thông báo, quảng cáo), trả lời 3 câu hỏi mỗi bài.",
      time: "~20 phút", diff: "Khó", qCount: 30, icon: "bi-mic", tone: "violet",
    },
  ],
  Reading: [
    {
      id: 5, name: "Điền từ vào câu", type: "Chọn từ/cụm từ phù hợp",
      desc: "Mỗi câu có 1 chỗ trống, chọn từ/cụm từ đúng ngữ pháp và ngữ nghĩa.",
      time: "~15 phút", diff: "Trung bình", qCount: 30, icon: "bi-pencil-square", tone: "",
    },
    {
      id: 6, name: "Điền từ vào đoạn văn", type: "Điền từ/câu vào đoạn văn",
      desc: "Đoạn văn 4 chỗ trống — điền từ hoặc cả câu hoàn chỉnh vào chỗ trống.",
      time: "~12 phút", diff: "Khó", qCount: 16, icon: "bi-textarea-t", tone: "green",
    },
    {
      id: 7, name: "Đọc hiểu", type: "Đọc văn bản và trả lời câu hỏi",
      desc: "Đọc email, bài báo, thông báo. Gồm single, double, triple passage.",
      time: "~55 phút", diff: "Rất khó", qCount: 54, icon: "bi-journal-text", tone: "amber",
    },
  ],
};

const diffColor = { "Dễ": "green", "Trung bình": "amber", "Khó": "red", "Rất khó": "red" };

const cleanPassage = (text = "") => {
  if (!text) return "";
  return text
    .replace(/^[-–—\s]*\d+\s+of\s+\d+\s*[-–—\s]*/gim, "")
    .replace(/^\s*page\s+\d+\s*$/gim, "")
    .replace(/^\s*\d+\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// ── OptionButton ──────────────────────────────────────────────
const OptionButton = ({ optKey, value, selected, submitted, correctAnswer, userAnswer, onClick }) => {
  const isCorrect   = optKey === correctAnswer;
  const isUserWrong = submitted && optKey === userAnswer && !isCorrect;
  const isCorrectAns = submitted && isCorrect;

  let borderColor = "#d6deeb";
  let bg = "#fff";
  let textColor = "#334155";
  let icon = null;

  if (!submitted && selected) {
    borderColor = "#0b57c5"; bg = "#e9f0ff"; textColor = "#10233f";
  } else if (submitted) {
    if (isCorrectAns) {
      borderColor = "#16a34a"; bg = "#eaf8ef"; textColor = "#087443";
      icon = <i className="bi bi-check-circle-fill" style={{ color: "#16a34a" }} />;
    } else if (isUserWrong) {
      borderColor = "#dc2626"; bg = "#fff0f0"; textColor = "#b42318";
      icon = <i className="bi bi-x-circle-fill" style={{ color: "#dc2626" }} />;
    } else {
      bg = "#f8fafc"; textColor = "#94a3b8";
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={submitted}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        width: "100%",
        padding: "14px 16px",
        border: `1.5px solid ${borderColor}`,
        borderRadius: 10,
        background: bg,
        cursor: submitted ? "default" : "pointer",
        textAlign: "left",
        transition: "all 0.15s",
        opacity: submitted && !isCorrectAns && !selected ? 0.55 : 1,
      }}
    >
      <span style={{
        display: "inline-flex",
        width: 30, height: 30,
        alignItems: "center", justifyContent: "center",
        borderRadius: "50%",
        background: (!submitted && selected)
          ? "#0b57c5"
          : (submitted && isCorrectAns) ? "#16a34a"
          : (submitted && isUserWrong) ? "#dc2626"
          : "#edf2f9",
        color: (!submitted && selected) || (submitted && (isCorrectAns || isUserWrong)) ? "#fff" : "#475569",
        fontWeight: 800,
        fontSize: "0.88rem",
        flexShrink: 0,
      }}>
        {optKey}
      </span>
      <span style={{
        flex: 1,
        color: textColor,
        fontWeight: (submitted && isCorrectAns) ? 700 : 500,
        fontSize: "0.97rem",
        lineHeight: 1.5,
        paddingTop: 3,
      }}>
        {value}
      </span>
      {icon && <span style={{ flexShrink: 0, paddingTop: 3 }}>{icon}</span>}
    </button>
  );
};

// ── PassagePanel ──────────────────────────────────────────────
const PassagePanel = ({ passage }) => {
  const cleaned = cleanPassage(passage);
  if (!cleaned) return null;
  return (
    <div style={{
      border: "1.5px solid #d6deeb",
      borderRadius: 10,
      background: "#f8fafc",
      padding: "18px 20px",
      color: "#334155",
      fontSize: "0.96rem",
      lineHeight: 1.75,
      whiteSpace: "pre-wrap",
      marginBottom: 18,
      maxHeight: 340,
      overflowY: "auto",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 12, paddingBottom: 10,
        borderBottom: "1px solid #e5ebf4",
      }}>
        <i className="bi bi-file-text" style={{ color: "#0b57c5" }} />
        <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0b57c5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Đoạn văn
        </span>
      </div>
      {cleaned}
    </div>
  );
};

// ── ScoreSummary ──────────────────────────────────────────────
const ScoreSummary = ({ questions, userAnswers, onExit }) => {
  const total    = questions.length;
  const correct  = questions.filter((q) => userAnswers[q._id] === q.correctAnswer).length;
  const accuracy = Math.round((correct / total) * 100);
  const rating   = accuracy >= 80
    ? { label: "Xuất sắc!", color: "#087443", bg: "#eaf8ef", icon: "bi-trophy-fill" }
    : accuracy >= 60
    ? { label: "Tốt lắm!", color: "#a15c00", bg: "#fff3d6", icon: "bi-star-fill" }
    : { label: "Cần luyện thêm!", color: "#b42318", bg: "#fff0f0", icon: "bi-arrow-repeat" };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 0" }}>
      <div style={{
        border: `2px solid ${rating.color}33`,
        borderRadius: 14,
        background: rating.bg,
        padding: "32px 28px",
        textAlign: "center",
        marginBottom: 20,
      }}>
        <div style={{
          display: "inline-flex", width: 64, height: 64,
          alignItems: "center", justifyContent: "center",
          borderRadius: "50%", background: rating.color,
          color: "#fff", fontSize: "1.8rem", marginBottom: 16,
        }}>
          <i className={`bi ${rating.icon}`} />
        </div>
        <h2 style={{ margin: "0 0 6px", color: rating.color, fontSize: "1.5rem", fontWeight: 800 }}>
          {rating.label}
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Bạn đã hoàn thành phiên luyện {total} câu
        </p>
        <div style={{ fontSize: "3.5rem", fontWeight: 900, color: "#10233f", margin: "16px 0 4px", lineHeight: 1 }}>
          {correct}<span style={{ fontSize: "1.5rem", color: "#64748b", fontWeight: 500 }}>/{total}</span>
        </div>
        <div style={{ fontSize: "1.1rem", color: rating.color, fontWeight: 700 }}>{accuracy}% chính xác</div>
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
        {questions.map((q, i) => {
          const ua = userAnswers[q._id];
          const ok = ua === q.correctAnswer;
          return (
            <div key={q._id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px",
              border: `1.5px solid ${ok ? "#86efac" : ua ? "#fca5a5" : "#e5ebf4"}`,
              borderRadius: 10,
              background: ok ? "#f0fdf4" : ua ? "#fff7f7" : "#f8fafc",
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: ok ? "#16a34a" : ua ? "#dc2626" : "#e5ebf4",
                color: ok || ua ? "#fff" : "#94a3b8",
                fontWeight: 800, fontSize: "0.82rem", flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: "#10233f", fontSize: "0.9rem" }}>
                  Câu {q.questionNumber}
                </span>
                {!ok && ua && (
                  <span style={{ color: "#b42318", fontSize: "0.82rem", marginLeft: 8 }}>
                    Bạn chọn {ua} • Đúng: {q.correctAnswer}
                  </span>
                )}
                {!ua && (
                  <span style={{ color: "#64748b", fontSize: "0.82rem", marginLeft: 8 }}>Bỏ trống</span>
                )}
              </div>
              <i className={`bi ${ok ? "bi-check-circle-fill" : ua ? "bi-x-circle-fill" : "bi-dash-circle"}`}
                style={{ color: ok ? "#16a34a" : ua ? "#dc2626" : "#94a3b8" }} />
            </div>
          );
        })}
      </div>

      <button className="learning-btn primary" style={{ width: "100%" }} onClick={onExit}>
        <i className="bi bi-arrow-left" /> Về màn chọn Part
      </button>
    </div>
  );
};

// ── PracticeByPart (main) ─────────────────────────────────────
const formatElapsed = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const PracticeByPart = () => {
  const [activeSkill,    setActiveSkill]    = useState("Listening");
  const [activePart,     setActivePart]     = useState(null);
  const [questions,      setQuestions]      = useState([]);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [userAnswers,    setUserAnswers]     = useState({});   // { qId: "A"|"B"|... }
  const [bookmarked,     setBookmarked]      = useState(new Set());
  const [submitted,      setSubmitted]       = useState(false); // ← KEY: chỉ reveal sau khi nộp
  const [loading,        setLoading]         = useState(false);
  const [error,          setError]           = useState(null);
  const [finished,       setFinished]        = useState(false);

  // ── Audio ──
  const audioRef        = useRef(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState("");
  const [isPlaying,     setIsPlaying]       = useState(false);
  const [examAudioUrl,  setExamAudioUrl]    = useState(null); // audio toàn đề

  // ── Stopwatch ──
  const [elapsed,       setElapsed]         = useState(0); // giây

  const [exams,          setExams]           = useState([]);
  const [examsLoaded,    setExamsLoaded]     = useState(false);
  const [selectedExamId, setSelectedExamId]  = useState("");
  const [showExamPicker, setShowExamPicker]  = useState(false);
  const [pendingPartId,  setPendingPartId]   = useState(null);

  const activePartMeta = useMemo(
    () => [...toeicParts.Listening, ...toeicParts.Reading].find((p) => p.id === activePart),
    [activePart]
  );

  // ── Stopwatch: đếm lên khi đang luyện, dừng khi submitted ──
  useEffect(() => {
    if (!activePart || submitted || finished) return;
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [activePart, submitted, finished]);

  // ── Audio player helpers ──
  const playAudio = (url) => {
    if (!url || !audioRef.current) return;
    if (currentAudioUrl === url && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    setCurrentAudioUrl(url);
    audioRef.current.src = url;
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
  };

  // Số câu đã trả lời
  const answeredCount  = Object.keys(userAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  const loadExams = async () => {
    if (examsLoaded) return;
    try {
      const data = await fetchExams();
      setExams(data.filter((e) => e.canAccess));
      setExamsLoaded(true);
    } catch {
      setExams([]);
      setExamsLoaded(true);
    }
  };

  const handleSelectPart = async (partId) => {
    await loadExams();
    setPendingPartId(partId);
    setShowExamPicker(true);
  };

  const startPractice = async () => {
    if (!selectedExamId || pendingPartId === null) return;
    setShowExamPicker(false);
    setLoading(true);
    setError(null);
    setFinished(false);
    setSubmitted(false);
    setElapsed(0);
    stopAudio();

    try {
      // Lấy thông tin đề để lấy audioUrl
      const [all, examList] = await Promise.all([
        fetchPracticeQuestions(selectedExamId),
        fetchExams(),
      ]);

      const examInfo = examList.find((e) => e._id === selectedExamId);
      // Ưu tiên audio riêng theo Part, fallback về audio tổng
      const partKey = `part${pendingPartId}`;
      const audioUrl =
        examInfo?.partAudioUrls?.[partKey] ||
        (pendingPartId <= 4 ? examInfo?.audioUrls?.[0] : null) ||
        null;
      setExamAudioUrl(audioUrl);

      const partQs = all
        .filter((q) => q.part === pendingPartId)
        .sort(() => 0.5 - Math.random());

      if (!partQs.length) {
        setError(`Đề này chưa có câu hỏi Part ${pendingPartId}.`);
        setLoading(false);
        return;
      }

      // Kiểm tra correctAnswer có tồn tại không
      const missingAnswer = partQs.filter((q) => !q.correctAnswer);
      if (missingAnswer.length > 0) {
        setError(`Câu hỏi thiếu đáp án đúng. Vui lòng kiểm tra lại dữ liệu backend.`);
        setLoading(false);
        return;
      }

      setActivePart(pendingPartId);
      setQuestions(partQs);
      setCurrentIndex(0);
      setUserAnswers({});
      setBookmarked(new Set());
    } catch (err) {
      setError(err.message || "Không thể tải câu hỏi.");
    } finally {
      setLoading(false);
    }
  };

  const exitPractice = () => {
    if (
      !finished &&
      !submitted &&
      Object.keys(userAnswers).length > 0 &&
      !window.confirm("Thoát phiên luyện tập hiện tại? Kết quả sẽ không được lưu.")
    ) return;
    stopAudio();
    setActivePart(null);
    setQuestions([]);
    setFinished(false);
    setSubmitted(false);
    setElapsed(0);
    setExamAudioUrl(null);
    setError(null);
  };

  const handleAnswer = (questionId, answer) => {
    if (submitted) return; // Đã nộp thì không cho chọn nữa
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (unansweredCount > 0) {
      const ok = window.confirm(
        `Bạn còn ${unansweredCount} câu chưa trả lời. Vẫn muốn nộp bài?`
      );
      if (!ok) return;
    }
    stopAudio();
    setSubmitted(true);

    // Persist bookmarks lên server nếu có câu được bookmark
    if (bookmarked.size > 0 && selectedExamId) {
      try {
        const token = getToken();
        // Tạo 1 attempt tạm để lưu bookmark (timeSpent = elapsed)
        await fetch(`${BASE}/user/exams/${selectedExamId}/attempts`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({
            answers: userAnswers,
            bookmarked: [...bookmarked].map((id) => {
              const q = questions.find((q) => q._id === id);
              return q?.questionNumber;
            }).filter(Boolean),
            timeSpent: elapsed,
            practiceMode: true,
            practicePart: activePart,
          }),
        });
      } catch {
        // Không block UI nếu lưu bookmark thất bại
      }
    }
  };

  const handleViewResult = () => {
    setFinished(true);
  };

  const toggleBookmark = (questionId) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return next;
    });
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((p) => p + 1);
  };

  const goPrev = () => setCurrentIndex((p) => Math.max(0, p - 1));

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <span className="learning-spinner" />
          <p className="learning-subtitle" style={{ marginTop: 14 }}>
            Đang tải câu hỏi luyện tập...
          </p>
        </div>
      </div>
    );
  }

  // ── Màn chọn Part ─────────────────────────────────────────
  if (!activePart) {
    return (
      <div className="learning-page">
        <header className="learning-header">
          <div className="learning-header-inner">
            <div className="learning-title-row">
              <div>
                <p className="learning-kicker">Practice by Part</p>
                <h1 className="learning-title">Luyện tập theo từng kỹ năng</h1>
                <p className="learning-subtitle">
                  Chọn riêng Listening hoặc Reading để tập trung xử lý phần đang yếu.
                </p>
              </div>
              <div className="learning-segmented" role="tablist">
                {["Listening", "Reading"].map((skill) => (
                  <button
                    key={skill}
                    className={activeSkill === skill ? "active" : ""}
                    onClick={() => setActiveSkill(skill)}
                  >
                    <i className={`bi ${skill === "Listening" ? "bi-headphones" : "bi-journal-text"}`} />{" "}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="learning-shell">
          {error && (
            <div style={{
              marginBottom: 16, padding: "12px 16px",
              borderRadius: 10, background: "#fff0f0",
              border: "1.5px solid #fca5a5", color: "#b42318",
            }}>
              <i className="bi bi-exclamation-circle" style={{ marginRight: 8 }} />
              {error}
            </div>
          )}

          <div className="learning-grid cols-4">
            {toeicParts[activeSkill].map((part) => (
              <article
                key={part.id}
                className="learning-card interactive practice-part-card"
                onClick={() => handleSelectPart(part.id)}
              >
                <div className="learning-card-head">
                  <span className={`learning-icon ${part.tone}`}>
                    <i className={`bi ${part.icon}`} />
                  </span>
                  <div className="learning-actions" style={{ gap: 6 }}>
                    <span className="learning-badge">Part {part.id}</span>
                    <span className={`learning-badge ${diffColor[part.diff] || ""}`}>
                      {part.diff}
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="exam-title" style={{ fontSize: "1.1rem" }}>{part.name}</h2>
                  <p className="vocab-muted" style={{ marginTop: 4, fontSize: "0.88rem" }}>{part.desc}</p>
                </div>
                <div className="practice-meta" style={{ gap: 6 }}>
                  <span className="learning-badge">
                    <i className="bi bi-hash" /> {part.qCount} câu
                  </span>
                  <span className="learning-badge">
                    <i className="bi bi-clock" /> {part.time}
                  </span>
                </div>
                <button className="learning-btn primary" type="button" style={{ width: "100%" }}>
                  Luyện ngay <i className="bi bi-arrow-right" />
                </button>
              </article>
            ))}
          </div>

          {/* Ghi chú */}
          <section className="learning-card" style={{ marginTop: 20 }}>
            <div className="learning-card-head">
              <div className="learning-actions">
                <span className="learning-icon amber">
                  <i className="bi bi-lightbulb" />
                </span>
                <div>
                  <strong>Chế độ luyện tập</strong>
                  <p className="vocab-muted">
                    Chọn tất cả đáp án rồi bấm <strong>"Nộp bài"</strong> — đáp án đúng và lời giải
                    sẽ hiển thị sau khi nộp, không lộ trước từng câu.
                  </p>
                </div>
              </div>
              <span className="learning-badge">Câu hỏi lấy từ đề thật</span>
            </div>
          </section>
        </main>

        {/* Modal chọn đề */}
        {showExamPicker && (
          <div className="learning-modal-backdrop">
            <div className="learning-modal">
              <div className="learning-modal-head">
                <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
                  Chọn đề thi để luyện Part {pendingPartId}
                </h2>
                <button className="learning-btn ghost" onClick={() => setShowExamPicker(false)}>
                  <i className="bi bi-x-lg" />
                </button>
              </div>
              <div className="learning-form">
                {exams.length === 0 ? (
                  <p className="vocab-muted">Bạn chưa có đề thi nào có thể truy cập.</p>
                ) : (
                  <div className="learning-field">
                    <label>Đề thi</label>
                    <select
                      className="learning-input"
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                    >
                      <option value="">-- Chọn đề thi --</option>
                      {exams.map((exam) => (
                        <option key={exam._id} value={exam._id}>
                          {exam.name} ({exam.releaseYear})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="learning-actions" style={{ justifyContent: "flex-end" }}>
                  <button className="learning-btn" onClick={() => setShowExamPicker(false)}>Hủy</button>
                  <button
                    className="learning-btn primary"
                    onClick={startPractice}
                    disabled={!selectedExamId}
                  >
                    Bắt đầu luyện tập
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Màn kết quả tổng ─────────────────────────────────────
  if (finished) {
    return (
      <div className="learning-page">
        <header className="learning-header">
          <div className="learning-header-inner">
            <div className="learning-title-row">
              <div>
                <p className="learning-kicker">Kết quả luyện tập</p>
                <h1 className="learning-title">Part {activePart}: {activePartMeta?.name}</h1>
              </div>
              <button className="learning-btn" onClick={exitPractice}>
                <i className="bi bi-arrow-left" /> Về chọn Part
              </button>
            </div>
          </div>
        </header>
        <main className="learning-shell">
          <ScoreSummary
            questions={questions}
            userAnswers={userAnswers}
            onExit={exitPractice}
          />
        </main>
      </div>
    );
  }

  // ── Màn luyện tập ─────────────────────────────────────────
  const currentQ   = questions[currentIndex];
  const userAnswer = userAnswers[currentQ?._id];
  const isSelected = Boolean(userAnswer);
  const isCorrect  = submitted && userAnswer === currentQ?.correctAnswer;
  const passage    = cleanPassage(currentQ?.readingPassage);
  const imageUrl   = currentQ?.imageUrl || currentQ?.image_url || null;
  const isReading  = activePart >= 5;
  const progress   = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Số câu đúng (chỉ tính sau khi submitted)
  const correctCount = submitted
    ? questions.filter((q) => userAnswers[q._id] === q.correctAnswer).length
    : 0;

  return (
    <div className="exam-page">
      {/* ── Topbar ── */}
      <header className="exam-topbar">
        <div className="exam-topbar-inner">
          <button className="learning-btn ghost" onClick={exitPractice}>
            <i className="bi bi-arrow-left" /> Thoát
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="exam-title" style={{ fontSize: "1.15rem" }}>
              Part {activePart}: {activePartMeta?.name}
            </h1>
            <p className="exam-subtitle">
              {submitted ? "Đã nộp bài — xem đáp án bên dưới" : "Chọn đáp án rồi nộp bài"}
            </p>
          </div>

          <div className="learning-actions" style={{ gap: 10 }}>
            {/* ── Stopwatch ── */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px",
              border: "1.5px solid #d6deeb",
              borderRadius: 8, background: "#fff",
              fontSize: "0.88rem", fontWeight: 700,
              color: elapsed >= 3600 ? "#b42318" : "#334155",
              fontVariantNumeric: "tabular-nums",
              minWidth: 78,
            }}>
              <i className="bi bi-stopwatch" style={{ color: "#0b57c5" }} />
              {formatElapsed(elapsed)}
            </div>

            {/* Progress */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 12px",
              border: "1.5px solid #d6deeb",
              borderRadius: 8, background: "#fff",
              fontSize: "0.88rem", fontWeight: 700, color: "#334155",
            }}>
              <i className="bi bi-list-check" style={{ color: "#0b57c5" }} />
              {answeredCount}/{questions.length} đã chọn
            </div>

            {submitted ? (
              <>
                <span className="learning-badge green">
                  <i className="bi bi-check2" /> {correctCount} đúng
                </span>
                <span className="learning-badge red">
                  <i className="bi bi-x" /> {questions.length - correctCount} sai/bỏ
                </span>
                <button className="learning-btn primary" onClick={handleViewResult}>
                  <i className="bi bi-bar-chart-line" /> Xem tổng kết
                </button>
              </>
            ) : (
              <>
                {unansweredCount > 0 && (
                  <span className="learning-badge amber">
                    <i className="bi bi-exclamation-circle" /> {unansweredCount} chưa chọn
                  </span>
                )}
                <button
                  className="learning-btn primary"
                  onClick={handleSubmit}
                  disabled={answeredCount === 0}
                >
                  <i className="bi bi-send-check" /> Nộp bài
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: "#e8edf6" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: submitted
              ? "linear-gradient(90deg, #16a34a, #0b57c5)"
              : "linear-gradient(90deg, #0b57c5, #16a34a)",
            transition: "width 0.3s",
          }} />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="exam-layout">
        <aside className="exam-panel exam-sidebar">
          <div className="learning-card" style={{ padding: "14px 16px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "0.82rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Bản đồ câu hỏi
              {!submitted && (
                <span style={{ marginLeft: 8, fontWeight: 400, textTransform: "none", fontSize: "0.78rem" }}>
                  — Chọn hết đáp án rồi bấm "Nộp bài" để xem kết quả
                </span>
              )}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {questions.map((q, i) => {
                const ua   = userAnswers[q._id];
                const ok   = submitted && ua === q.correctAnswer;
                const wrong = submitted && ua && ua !== q.correctAnswer;
                const blank = submitted && !ua;
                const cur  = i === currentIndex;
                const bm   = bookmarked.has(q._id);
                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentIndex(i)}
                    title={`Câu ${i + 1}${bm ? " ★" : ""}`}
                    style={{
                      position: "relative",
                      width: 38, height: 38,
                      borderRadius: 8,
                      border: `2px solid ${
                        cur ? "#0b57c5"
                        : ok ? "#16a34a"
                        : wrong ? "#dc2626"
                        : blank ? "#94a3b8"
                        : ua ? "#f59e0b"
                        : "#d6deeb"
                      }`,
                      background: cur ? "#e9f0ff"
                        : ok ? "#eaf8ef"
                        : wrong ? "#fff0f0"
                        : blank ? "#f1f5f9"
                        : ua ? "#fffbeb"
                        : "#f8fafc",
                      color: cur ? "#0b57c5"
                        : ok ? "#087443"
                        : wrong ? "#b42318"
                        : ua ? "#a15c00"
                        : "#475569",
                      fontWeight: 800, fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    {i + 1}
                    {bm && (
                      <span style={{
                        position: "absolute", top: -4, right: -4,
                        width: 10, height: 10, borderRadius: "50%",
                        background: "#f59e0b", border: "1.5px solid #fff",
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12, fontSize: "0.75rem", color: "#64748b" }}>
              {!submitted && (
                <>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#f59e0b", marginRight: 4 }} />Đã chọn</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#d6deeb", marginRight: 4 }} />Chưa chọn</span>
                </>
              )}
              {submitted && (
                <>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#16a34a", marginRight: 4 }} />Đúng</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#dc2626", marginRight: 4 }} />Sai</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#94a3b8", marginRight: 4 }} />Bỏ trống</span>
                </>
              )}
            </div>
          </div>
        </aside>

        <section className="exam-panel">
          <div style={{
            border: "1.5px solid #d6deeb",
            borderRadius: 14,
            background: "#fff",
            boxShadow: "0 8px 24px rgba(15,23,42,0.07)",
            overflow: "hidden",
          }}>
            {/* Card header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid #e5ebf4",
              background: "#fbfdff",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "#e9f0ff", color: "#0b57c5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "0.95rem",
                }}>
                  {currentIndex + 1}
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: "#10233f", fontSize: "0.95rem" }}>
                    Câu {currentQ.questionNumber}
                  </span>
                  <span style={{
                    marginLeft: 10, padding: "2px 8px",
                    border: "1px solid #d6deeb", borderRadius: 999,
                    fontSize: "0.78rem", color: "#64748b",
                  }}>
                    Part {currentQ.part}
                  </span>
                  {/* Trạng thái sau khi nộp */}
                  {submitted && (
                    <span style={{
                      marginLeft: 8, padding: "2px 8px",
                      borderRadius: 999, fontSize: "0.78rem", fontWeight: 700,
                      background: userAnswer === currentQ.correctAnswer ? "#eaf8ef" : userAnswer ? "#fff0f0" : "#f1f5f9",
                      color: userAnswer === currentQ.correctAnswer ? "#087443" : userAnswer ? "#b42318" : "#64748b",
                    }}>
                      {userAnswer === currentQ.correctAnswer
                        ? "✓ Đúng"
                        : userAnswer
                        ? `✗ Sai (Đáp án: ${currentQ.correctAnswer})`
                        : "— Bỏ trống"}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleBookmark(currentQ._id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 14px",
                  border: `1.5px solid ${bookmarked.has(currentQ._id) ? "#f59e0b" : "#d6deeb"}`,
                  borderRadius: 8,
                  background: bookmarked.has(currentQ._id) ? "#fffbeb" : "#fff",
                  color: bookmarked.has(currentQ._id) ? "#a15c00" : "#64748b",
                  fontWeight: 700, fontSize: "0.88rem", cursor: "pointer",
                }}
              >
                <i className={`bi ${bookmarked.has(currentQ._id) ? "bi-bookmark-fill" : "bi-bookmark"}`} />
                {bookmarked.has(currentQ._id) ? "Đã lưu" : "Lưu câu khó"}
              </button>
            </div>

            {/* Card body */}
            <div style={{ padding: "20px 20px 8px" }}>

              {/* ── Audio Player (Listening Part 1–4) ── */}
              {activePart <= 4 && examAudioUrl && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 18px", marginBottom: 18,
                  borderRadius: 10, background: "#f7f4ff",
                  border: "1.5px solid #d1c4e9",
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: isPlaying ? "#6d35c5" : "#e9e3ff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, cursor: "pointer", transition: "background 0.2s",
                  }} onClick={() => playAudio(examAudioUrl)}>
                    <i className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`}
                      style={{ color: isPlaying ? "#fff" : "#6d35c5", fontSize: "1.1rem" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", color: "#4a1d96" }}>
                      <i className="bi bi-headphones" style={{ marginRight: 6 }} />
                      Audio Listening — Part {activePart}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#6d35c5", opacity: 0.8 }}>
                      {isPlaying ? "Đang phát — nhấn để tạm dừng" : "Nhấn để nghe audio"}
                    </p>
                  </div>
                  {isPlaying && (
                    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          width: 3, borderRadius: 2,
                          background: "#6d35c5",
                          height: 8 + Math.random() * 14,
                          animation: `wave ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Hiển thị nếu không có file audio */}
              {activePart <= 4 && !examAudioUrl && !currentQ.questionText && !passage && !imageUrl && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "14px 16px", marginBottom: 16,
                  borderRadius: 10, background: "#f7f4ff",
                  border: "1.5px solid #d1c4e9", color: "#6d35c5",
                  fontSize: "0.9rem", fontWeight: 600,
                }}>
                  <i className="bi bi-headphones" style={{ fontSize: "1.1rem" }} />
                  Lắng nghe audio và chọn đáp án phù hợp
                </div>
              )}

              {/* Image */}
              {imageUrl && (
                <div style={{
                  border: "1.5px solid #b7cdf9",
                  borderRadius: 10, overflow: "hidden",
                  background: "#f0f5ff", marginBottom: 18,
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 16px", background: "#e9f0ff",
                    borderBottom: "1px solid #b7cdf9",
                  }}>
                    <i className="bi bi-image" style={{ color: "#0b57c5" }} />
                    <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0b57c5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Ảnh minh họa — Câu {currentQ.questionNumber}
                    </span>
                  </div>
                  <img src={imageUrl} alt={`Part 1 câu ${currentQ.questionNumber}`}
                    style={{ display: "block", width: "100%", maxHeight: 420, objectFit: "contain", background: "#fff", padding: 12 }}
                  />
                </div>
              )}

              {/* Passage */}
              {passage && <PassagePanel passage={passage} />}

              {currentQ.questionText && (
                <p style={{ margin: "0 0 16px", color: "#10233f", fontWeight: 750, fontSize: "1.05rem", lineHeight: 1.55 }}>
                  {currentQ.questionText}
                </p>
              )}

              {/* Options */}
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                {Object.entries(currentQ.answers || {}).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <OptionButton
                      key={key}
                      optKey={key}
                      value={value}
                      selected={userAnswer === key}
                      submitted={submitted}
                      correctAnswer={currentQ.correctAnswer}
                      userAnswer={userAnswer}
                      onClick={() => handleAnswer(currentQ._id, key)}
                    />
                  );
                })}
              </div>

              {/* Lời giải — chỉ hiện sau khi nộp */}
              {submitted && (
                <div style={{
                  marginTop: 4,
                  borderRadius: 10,
                  border: `1.5px solid ${isCorrect ? "#86efac" : userAnswer ? "#fca5a5" : "#e5ebf4"}`,
                  background: isCorrect ? "#f0fdf4" : userAnswer ? "#fff7f7" : "#f8fafc",
                  overflow: "hidden",
                  marginBottom: 8,
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px",
                    background: isCorrect ? "#dcfce7" : userAnswer ? "#fee2e2" : "#f1f5f9",
                    borderBottom: `1px solid ${isCorrect ? "#86efac" : userAnswer ? "#fca5a5" : "#e5ebf4"}`,
                  }}>
                    <i className={`bi ${isCorrect ? "bi-check-circle-fill" : userAnswer ? "bi-x-circle-fill" : "bi-dash-circle"}`}
                      style={{ color: isCorrect ? "#16a34a" : userAnswer ? "#dc2626" : "#94a3b8", fontSize: "1.1rem" }} />
                    <strong style={{ color: isCorrect ? "#15803d" : userAnswer ? "#b91c1c" : "#64748b", fontSize: "0.95rem" }}>
                      {isCorrect
                        ? "Chính xác!"
                        : userAnswer
                        ? `Chưa đúng — Đáp án là ${currentQ.correctAnswer}`
                        : `Bỏ trống — Đáp án là ${currentQ.correctAnswer}`}
                    </strong>
                  </div>
                  {currentQ.explanation && (
                    <div style={{ padding: "14px 16px" }}>
                      <p style={{ margin: 0, fontSize: "0.88rem", color: "#10233f", lineHeight: 1.65 }}>
                        <i className="bi bi-lightbulb" style={{ color: "#f59e0b", marginRight: 6 }} />
                        {currentQ.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card footer: navigation */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderTop: "1px solid #e5ebf4",
              background: "#fbfdff",
              marginTop: 8,
            }}>
              <button className="learning-btn" onClick={goPrev} disabled={currentIndex === 0}>
                <i className="bi bi-arrow-left" /> Câu trước
              </button>

              <span style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 600 }}>
                {currentIndex + 1} / {questions.length}
              </span>

              {currentIndex === questions.length - 1 ? (
                submitted ? (
                  <button className="learning-btn primary" onClick={handleViewResult}>
                    <i className="bi bi-bar-chart-line" /> Xem tổng kết
                  </button>
                ) : (
                  <button
                    className="learning-btn primary"
                    onClick={handleSubmit}
                    disabled={answeredCount === 0}
                  >
                    <i className="bi bi-send-check" /> Nộp bài
                  </button>
                )
              ) : (
                <button className="learning-btn primary" onClick={goNext}>
                  Câu tiếp <i className="bi bi-arrow-right" />
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── Hidden audio element ── */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} hidden />

      {/* ── CSS animation sóng audio ── */}
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default PracticeByPart;


// import React, { useMemo, useState } from "react";
// import { examApi } from "../services/userApi";

// // Metadata cấu trúc các Part TOEIC (không đổi)
// const toeicParts = {
//   Listening: [
//     {
//       id: 1,
//       name: "Mô tả tranh",
//       type: "Nghe và chọn mô tả đúng",
//       desc: "Nghe 4 mô tả, chọn cái khớp với bức ảnh được hiển thị.",
//       time: "~4 phút",
//       diff: "Dễ",
//       qCount: 6,
//       icon: "bi-image",
//       tone: "",
//     },
//     {
//       id: 2,
//       name: "Hỏi & Đáp",
//       type: "Nghe câu hỏi và chọn câu trả lời",
//       desc: "Nghe câu hỏi/phát biểu, chọn 1 trong 3 câu trả lời phù hợp.",
//       time: "~10 phút",
//       diff: "Trung bình",
//       qCount: 25,
//       icon: "bi-chat-dots",
//       tone: "green",
//     },
//     {
//       id: 3,
//       name: "Đoạn hội thoại",
//       type: "Nghe đoạn hội thoại và trả lời",
//       desc: "Nghe hội thoại 2–3 người, trả lời 3 câu hỏi cho mỗi đoạn.",
//       time: "~25 phút",
//       diff: "Khó",
//       qCount: 39,
//       icon: "bi-people",
//       tone: "amber",
//     },
//     {
//       id: 4,
//       name: "Bài nói ngắn",
//       type: "Nghe bài nói và trả lời câu hỏi",
//       desc: "Nghe monologue (thông báo, quảng cáo), trả lời 3 câu hỏi mỗi bài.",
//       time: "~20 phút",
//       diff: "Khó",
//       qCount: 30,
//       icon: "bi-mic",
//       tone: "violet",
//     },
//   ],
//   Reading: [
//     {
//       id: 5,
//       name: "Điền từ vào câu",
//       type: "Chọn từ/cụm từ phù hợp",
//       desc: "Mỗi câu có 1 chỗ trống, chọn từ/cụm từ đúng ngữ pháp và ngữ nghĩa.",
//       time: "~15 phút",
//       diff: "Trung bình",
//       qCount: 30,
//       icon: "bi-pencil-square",
//       tone: "",
//     },
//     {
//       id: 6,
//       name: "Điền từ vào đoạn văn",
//       type: "Điền từ/câu vào đoạn văn",
//       desc: "Đoạn văn 4 chỗ trống — điền từ hoặc cả câu hoàn chỉnh vào chỗ trống.",
//       time: "~12 phút",
//       diff: "Khó",
//       qCount: 16,
//       icon: "bi-textarea-t",
//       tone: "green",
//     },
//     {
//       id: 7,
//       name: "Đọc hiểu",
//       type: "Đọc văn bản và trả lời câu hỏi",
//       desc: "Đọc email, bài báo, thông báo. Gồm single, double, triple passage.",
//       time: "~55 phút",
//       diff: "Rất khó",
//       qCount: 54,
//       icon: "bi-journal-text",
//       tone: "amber",
//     },
//   ],
// };

// const diffColor = {
//   "Dễ": "green",
//   "Trung bình": "amber",
//   "Khó": "red",
//   "Rất khó": "red",
// };

// const PracticeByPart = () => {
//   const [activeSkill, setActiveSkill] = useState("Listening");
//   const [activePart, setActivePart] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState({});
//   const [bookmarked, setBookmarked] = useState(new Set());
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Lấy danh sách exam để chọn đề luyện
//   const [exams, setExams] = useState([]);
//   const [examsLoaded, setExamsLoaded] = useState(false);
//   const [selectedExamId, setSelectedExamId] = useState("");
//   const [showExamPicker, setShowExamPicker] = useState(false);
//   const [pendingPartId, setPendingPartId] = useState(null);

//   const activePartMeta = useMemo(
//     () =>
//       [...toeicParts.Listening, ...toeicParts.Reading].find(
//         (part) => part.id === activePart,
//       ),
//     [activePart],
//   );

//   const loadExams = async () => {
//     if (examsLoaded) return;
//     try {
//       const data = await examApi.getExams();
//       // Chỉ hiện đề có thể truy cập
//       setExams(data.filter((e) => e.canAccess));
//       setExamsLoaded(true);
//     } catch {
//       setExams([]);
//       setExamsLoaded(true);
//     }
//   };

//   const handleSelectPart = async (partId) => {
//     await loadExams();
//     setPendingPartId(partId);
//     setShowExamPicker(true);
//   };

//   const startPractice = async () => {
//     if (!selectedExamId || pendingPartId === null) return;

//     setShowExamPicker(false);
//     setLoading(true);
//     setError(null);

//     try {
//       const allQuestions = await examApi.getQuestions(selectedExamId);

//       // Lọc câu hỏi theo Part, lấy tối đa 10 câu ngẫu nhiên
//       const partQuestions = allQuestions
//         .filter((q) => q.part === pendingPartId)
//         .sort(() => 0.5 - Math.random())
//         .slice(0, 10);

//       if (!partQuestions.length) {
//         setError(`Đề này chưa có câu hỏi Part ${pendingPartId}.`);
//         setLoading(false);
//         return;
//       }

//       setActivePart(pendingPartId);
//       setQuestions(partQuestions);
//       setCurrentIndex(0);
//       setUserAnswers({});
//       setBookmarked(new Set());
//     } catch (err) {
//       setError(err.message || "Không thể tải câu hỏi.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exitPractice = () => {
//     if (
//       Object.keys(userAnswers).length > 0 &&
//       !window.confirm("Thoát phiên luyện tập hiện tại?")
//     )
//       return;
//     setActivePart(null);
//     setQuestions([]);
//     setError(null);
//   };

//   const handleAnswerSelect = (questionId, answer) => {
//     if (userAnswers[questionId]) return;
//     setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
//   };

//   const toggleBookmark = (questionId) => {
//     setBookmarked((prev) => {
//       const next = new Set(prev);
//       if (next.has(questionId)) next.delete(questionId);
//       else next.add(questionId);
//       return next;
//     });
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="learning-page">
//         <div className="learning-shell learning-empty">
//           <span className="learning-spinner" />
//           <p className="learning-subtitle" style={{ marginTop: 14 }}>
//             Đang tải câu hỏi luyện tập...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Màn chọn Part
//   if (!activePart) {
//     return (
//       <div className="learning-page">
//         <header className="learning-header">
//           <div className="learning-header-inner">
//             <div className="learning-title-row">
//               <div>
//                 <p className="learning-kicker">Practice by Part</p>
//                 <h1 className="learning-title">Luyện tập theo từng kỹ năng</h1>
//                 <p className="learning-subtitle">
//                   Chọn riêng Listening hoặc Reading để tập trung xử lý phần đang yếu.
//                 </p>
//               </div>
//               <div className="learning-segmented" role="tablist" aria-label="Chọn kỹ năng">
//                 {["Listening", "Reading"].map((skill) => (
//                   <button
//                     key={skill}
//                     className={activeSkill === skill ? "active" : ""}
//                     onClick={() => setActiveSkill(skill)}
//                   >
//                     <i
//                       className={`bi ${skill === "Listening" ? "bi-headphones" : "bi-journal-text"}`}
//                     />{" "}
//                     {skill}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="learning-shell">
//           {error && (
//             <div
//               className="learning-card"
//               style={{
//                 marginBottom: 16,
//                 padding: "12px 16px",
//                 background: "#fff0f0",
//                 borderColor: "#ffd4d4",
//                 color: "#b42318",
//               }}
//             >
//               <i className="bi bi-exclamation-circle" /> {error}
//             </div>
//           )}

//           <div className="learning-grid cols-4">
//             {toeicParts[activeSkill].map((part) => (
//               <article
//                 key={part.id}
//                 className="learning-card interactive practice-part-card"
//                 onClick={() => handleSelectPart(part.id)}
//               >
//                 <div className="learning-card-head">
//                   <span className={`learning-icon ${part.tone}`}>
//                     <i className={`bi ${part.icon}`} />
//                   </span>
//                   <div className="learning-actions" style={{ gap: 6 }}>
//                     <span className="learning-badge">Part {part.id}</span>
//                     <span className={`learning-badge ${diffColor[part.diff] || ""}`}>
//                       {part.diff}
//                     </span>
//                   </div>
//                 </div>

//                 <div>
//                   <h2 className="exam-title" style={{ fontSize: "1.1rem" }}>{part.name}</h2>
//                   <p className="vocab-muted" style={{ marginTop: 4, fontSize: "0.88rem" }}>{part.desc}</p>
//                 </div>

//                 <div className="practice-meta" style={{ gap: 6 }}>
//                   <span className="learning-badge">
//                     <i className="bi bi-hash" /> {part.qCount} câu chuẩn
//                   </span>
//                   <span className="learning-badge">
//                     <i className="bi bi-clock" /> {part.time}
//                   </span>
//                   <span className="learning-badge amber">
//                     <i className="bi bi-map" /> Câu {/* thêm range vào toeicParts nếu muốn */}
//                   </span>
//                 </div>

//                 <button className="learning-btn primary" type="button" style={{ width: "100%" }}>
//                   Luyện ngay <i className="bi bi-arrow-right" />
//                 </button>
//               </article>
//             ))}
//           </div>

//           <section className="learning-card" style={{ marginTop: 20 }}>
//             <div className="learning-card-head">
//               <div className="learning-actions">
//                 <span className="learning-icon amber">
//                   <i className="bi bi-lightbulb" />
//                 </span>
//                 <div>
//                   <strong>Gợi ý học nhanh</strong>
//                   <p className="vocab-muted">
//                     Với câu trả lời sai, hệ thống hiển thị đáp án đúng và lời giải ngay để bạn
//                     sửa lỗi tại chỗ.
//                   </p>
//                 </div>
//               </div>
//               <span className="learning-badge">Câu hỏi lấy từ đề thật</span>
//             </div>
//           </section>
//         </main>

//         {/* Modal chọn đề thi */}
//         {showExamPicker && (
//           <div className="learning-modal-backdrop">
//             <div className="learning-modal">
//               <div className="learning-modal-head">
//                 <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
//                   Chọn đề thi để luyện Part {pendingPartId}
//                 </h2>
//                 <button
//                   className="learning-btn ghost"
//                   onClick={() => setShowExamPicker(false)}
//                 >
//                   <i className="bi bi-x-lg" />
//                 </button>
//               </div>

//               <div className="learning-form">
//                 {exams.length === 0 ? (
//                   <p className="vocab-muted">
//                     Bạn chưa có đề thi nào. Hãy mua hoặc truy cập đề miễn phí trước.
//                   </p>
//                 ) : (
//                   <div className="learning-field">
//                     <label>Đề thi</label>
//                     <select
//                       className="learning-input"
//                       value={selectedExamId}
//                       onChange={(e) => setSelectedExamId(e.target.value)}
//                     >
//                       <option value="">-- Chọn đề thi --</option>
//                       {exams.map((exam) => (
//                         <option key={exam._id} value={exam._id}>
//                           {exam.name} ({exam.releaseYear})
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//                 <div className="learning-actions" style={{ justifyContent: "flex-end" }}>
//                   <button
//                     className="learning-btn"
//                     type="button"
//                     onClick={() => setShowExamPicker(false)}
//                   >
//                     Hủy
//                   </button>
//                   <button
//                     className="learning-btn primary"
//                     type="button"
//                     onClick={startPractice}
//                     disabled={!selectedExamId}
//                   >
//                     Bắt đầu luyện tập
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // Màn luyện tập
//   const currentQuestion = questions[currentIndex];
//   const userAnswer = userAnswers[currentQuestion?._id];
//   const isCorrect = userAnswer === currentQuestion?.correctAnswer;
//   const answeredCount = Object.keys(userAnswers).length;
//   const correctCount = questions.filter(
//     (q) => userAnswers[q._id] === q.correctAnswer,
//   ).length;
//   const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

//   return (
//     <div className="exam-page">
//       <header className="exam-topbar">
//         <div className="exam-topbar-inner">
//           <button className="learning-btn ghost" onClick={exitPractice}>
//             <i className="bi bi-arrow-left" />
//             Thoát
//           </button>
//           <div style={{ minWidth: 0, flex: 1 }}>
//             <h1 className="exam-title">
//               Luyện Part {activePart}: {activePartMeta?.name}
//             </h1>
//             <p className="exam-subtitle">
//               Chế độ luyện tập có phản hồi tức thì • Đã làm {answeredCount}/{questions.length}
//             </p>
//           </div>
//           <div className="learning-actions">
//             <span className="learning-badge green">{accuracy}% đúng</span>
//             <span className="learning-badge amber">{bookmarked.size} câu khó</span>
//           </div>
//         </div>
//         <div className="exam-progress-line">
//           <span
//             style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
//           />
//         </div>
//       </header>

//       <main className="exam-layout" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
//         <section className="exam-panel">
//           <div className="exam-question-head">
//             <div className="learning-actions">
//               <span className="learning-badge">Câu {currentQuestion.questionNumber}</span>
//               {userAnswer && (
//                 <span className={`learning-badge ${isCorrect ? "green" : "red"}`}>
//                   <i className={`bi ${isCorrect ? "bi-check-circle" : "bi-x-circle"}`} />
//                   {isCorrect ? "Đúng" : "Sai"}
//                 </span>
//               )}
//             </div>
//             <button
//               className={`learning-btn ${bookmarked.has(currentQuestion._id) ? "danger-soft" : ""}`}
//               onClick={() => toggleBookmark(currentQuestion._id)}
//             >
//               <i
//                 className={`bi ${bookmarked.has(currentQuestion._id) ? "bi-bookmark-fill" : "bi-bookmark"}`}
//               />
//               {bookmarked.has(currentQuestion._id) ? "Đã lưu" : "Lưu câu khó"}
//             </button>
//           </div>

//           {currentQuestion.readingPassage && (
//             <div className="exam-passage">{currentQuestion.readingPassage}</div>
//           )}

//           {currentQuestion.imageUrl && (
//             <div className="exam-media">
//               <img
//                 src={currentQuestion.imageUrl}
//                 alt={`Minh họa câu ${currentQuestion.questionNumber}`}
//               />
//             </div>
//           )}

//           {currentQuestion.questionText && (
//             <p className="exam-question-text">{currentQuestion.questionText}</p>
//           )}

//           <div className="exam-options">
//             {Object.entries(currentQuestion.answers || {}).map(([key, value]) => {
//               if (!value) return null;
//               const isSelected = userAnswer === key;
//               const isRightAnswer = currentQuestion.correctAnswer === key;
//               const resultClass = userAnswer
//                 ? isRightAnswer
//                   ? "correct"
//                   : isSelected
//                     ? "wrong"
//                     : ""
//                 : "";

//               return (
//                 <button
//                   key={key}
//                   className={`exam-option ${isSelected ? "selected" : ""} ${resultClass}`}
//                   onClick={() => handleAnswerSelect(currentQuestion._id, key)}
//                   disabled={Boolean(userAnswer)}
//                 >
//                   <span className="exam-option-key">{key}</span>
//                   <span>{value}</span>
//                 </button>
//               );
//             })}
//           </div>

//           {userAnswer && currentQuestion.explanation && (
//             <div className="exam-explanation">
//               <strong>
//                 <i className="bi bi-lightbulb" /> Giải thích chi tiết
//               </strong>
//               <p style={{ margin: "8px 0 0" }}>{currentQuestion.explanation}</p>
//             </div>
//           )}

//           {userAnswer && !currentQuestion.explanation && (
//             <div className="exam-explanation">
//               <strong>
//                 <i className="bi bi-check2-circle" /> Đáp án đúng: {currentQuestion.correctAnswer}
//               </strong>
//             </div>
//           )}

//           <div className="exam-footer-actions">
//             <button
//               className="learning-btn"
//               onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
//               disabled={currentIndex === 0}
//             >
//               <i className="bi bi-arrow-left" />
//               Câu trước
//             </button>
//             <span className="vocab-muted">
//               {currentIndex + 1}/{questions.length}
//             </span>
//             {currentIndex === questions.length - 1 && userAnswer ? (
//               <button className="learning-btn success" onClick={exitPractice}>
//                 Hoàn thành <i className="bi bi-check2" />
//               </button>
//             ) : (
//               <button
//                 className="learning-btn primary"
//                 onClick={() =>
//                   setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
//                 }
//                 disabled={!userAnswer || currentIndex === questions.length - 1}
//               >
//                 Câu tiếp <i className="bi bi-arrow-right" />
//               </button>
//             )}
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default PracticeByPart;
