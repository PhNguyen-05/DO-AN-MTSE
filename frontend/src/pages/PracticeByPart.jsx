import React, { useMemo, useState } from "react";
import { examApi } from "../services/userApi";

// Metadata cấu trúc các Part TOEIC (không đổi)
const toeicParts = {
  Listening: [
    {
      id: 1,
      name: "Mô tả tranh",
      type: "Nghe và chọn mô tả đúng",
      qCount: 6,
      icon: "bi-image",
      tone: "",
    },
    {
      id: 2,
      name: "Hỏi & Đáp",
      type: "Nghe câu hỏi và chọn câu trả lời",
      qCount: 25,
      icon: "bi-chat-dots",
      tone: "green",
    },
    {
      id: 3,
      name: "Đoạn hội thoại",
      type: "Nghe đoạn hội thoại và trả lời",
      qCount: 39,
      icon: "bi-people",
      tone: "amber",
    },
    {
      id: 4,
      name: "Bài nói ngắn",
      type: "Nghe bài nói và trả lời câu hỏi",
      qCount: 30,
      icon: "bi-mic",
      tone: "violet",
    },
  ],
  Reading: [
    {
      id: 5,
      name: "Điền từ vào câu",
      type: "Chọn từ/cụm từ phù hợp",
      qCount: 30,
      icon: "bi-pencil-square",
      tone: "",
    },
    {
      id: 6,
      name: "Điền từ vào đoạn văn",
      type: "Điền từ/câu vào đoạn văn",
      qCount: 16,
      icon: "bi-textarea-t",
      tone: "green",
    },
    {
      id: 7,
      name: "Đọc hiểu",
      type: "Đọc văn bản và trả lời câu hỏi",
      qCount: 54,
      icon: "bi-journal-text",
      tone: "amber",
    },
  ],
};

const PracticeByPart = () => {
  const [activeSkill, setActiveSkill] = useState("Listening");
  const [activePart, setActivePart] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarked, setBookmarked] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách exam để chọn đề luyện
  const [exams, setExams] = useState([]);
  const [examsLoaded, setExamsLoaded] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [showExamPicker, setShowExamPicker] = useState(false);
  const [pendingPartId, setPendingPartId] = useState(null);

  const activePartMeta = useMemo(
    () =>
      [...toeicParts.Listening, ...toeicParts.Reading].find(
        (part) => part.id === activePart,
      ),
    [activePart],
  );

  const loadExams = async () => {
    if (examsLoaded) return;
    try {
      const data = await examApi.getExams();
      // Chỉ hiện đề có thể truy cập
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

    try {
      const allQuestions = await examApi.getQuestions(selectedExamId);

      // Lọc câu hỏi theo Part, lấy tối đa 10 câu ngẫu nhiên
      const partQuestions = allQuestions
        .filter((q) => q.part === pendingPartId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);

      if (!partQuestions.length) {
        setError(`Đề này chưa có câu hỏi Part ${pendingPartId}.`);
        setLoading(false);
        return;
      }

      setActivePart(pendingPartId);
      setQuestions(partQuestions);
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
      Object.keys(userAnswers).length > 0 &&
      !window.confirm("Thoát phiên luyện tập hiện tại?")
    )
      return;
    setActivePart(null);
    setQuestions([]);
    setError(null);
  };

  const handleAnswerSelect = (questionId, answer) => {
    if (userAnswers[questionId]) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const toggleBookmark = (questionId) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  // Loading state
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

  // Màn chọn Part
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
              <div className="learning-segmented" role="tablist" aria-label="Chọn kỹ năng">
                {["Listening", "Reading"].map((skill) => (
                  <button
                    key={skill}
                    className={activeSkill === skill ? "active" : ""}
                    onClick={() => setActiveSkill(skill)}
                  >
                    <i
                      className={`bi ${skill === "Listening" ? "bi-headphones" : "bi-journal-text"}`}
                    />{" "}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="learning-shell">
          {error && (
            <div
              className="learning-card"
              style={{
                marginBottom: 16,
                padding: "12px 16px",
                background: "#fff0f0",
                borderColor: "#ffd4d4",
                color: "#b42318",
              }}
            >
              <i className="bi bi-exclamation-circle" /> {error}
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
                  <span className="learning-badge">Part {part.id}</span>
                </div>
                <div>
                  <h2 className="exam-title" style={{ fontSize: "1.16rem" }}>
                    {part.name}
                  </h2>
                  <p className="vocab-muted">{part.type}</p>
                </div>
                <div className="practice-meta">
                  <span className="learning-badge green">{part.qCount} câu chuẩn TOEIC</span>
                  <span className="learning-badge amber">Xem giải thích ngay</span>
                </div>
                <button className="learning-btn primary" type="button">
                  Luyện ngay <i className="bi bi-arrow-right" />
                </button>
              </article>
            ))}
          </div>

          <section className="learning-card" style={{ marginTop: 20 }}>
            <div className="learning-card-head">
              <div className="learning-actions">
                <span className="learning-icon amber">
                  <i className="bi bi-lightbulb" />
                </span>
                <div>
                  <strong>Gợi ý học nhanh</strong>
                  <p className="vocab-muted">
                    Với câu trả lời sai, hệ thống hiển thị đáp án đúng và lời giải ngay để bạn
                    sửa lỗi tại chỗ.
                  </p>
                </div>
              </div>
              <span className="learning-badge">Câu hỏi lấy từ đề thật</span>
            </div>
          </section>
        </main>

        {/* Modal chọn đề thi */}
        {showExamPicker && (
          <div className="learning-modal-backdrop">
            <div className="learning-modal">
              <div className="learning-modal-head">
                <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
                  Chọn đề thi để luyện Part {pendingPartId}
                </h2>
                <button
                  className="learning-btn ghost"
                  onClick={() => setShowExamPicker(false)}
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>

              <div className="learning-form">
                {exams.length === 0 ? (
                  <p className="vocab-muted">
                    Bạn chưa có đề thi nào. Hãy mua hoặc truy cập đề miễn phí trước.
                  </p>
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
                  <button
                    className="learning-btn"
                    type="button"
                    onClick={() => setShowExamPicker(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="learning-btn primary"
                    type="button"
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

  // Màn luyện tập
  const currentQuestion = questions[currentIndex];
  const userAnswer = userAnswers[currentQuestion?._id];
  const isCorrect = userAnswer === currentQuestion?.correctAnswer;
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questions.filter(
    (q) => userAnswers[q._id] === q.correctAnswer,
  ).length;
  const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="exam-page">
      <header className="exam-topbar">
        <div className="exam-topbar-inner">
          <button className="learning-btn ghost" onClick={exitPractice}>
            <i className="bi bi-arrow-left" />
            Thoát
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="exam-title">
              Luyện Part {activePart}: {activePartMeta?.name}
            </h1>
            <p className="exam-subtitle">
              Chế độ luyện tập có phản hồi tức thì • Đã làm {answeredCount}/{questions.length}
            </p>
          </div>
          <div className="learning-actions">
            <span className="learning-badge green">{accuracy}% đúng</span>
            <span className="learning-badge amber">{bookmarked.size} câu khó</span>
          </div>
        </div>
        <div className="exam-progress-line">
          <span
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="exam-layout" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
        <section className="exam-panel">
          <div className="exam-question-head">
            <div className="learning-actions">
              <span className="learning-badge">Câu {currentQuestion.questionNumber}</span>
              {userAnswer && (
                <span className={`learning-badge ${isCorrect ? "green" : "red"}`}>
                  <i className={`bi ${isCorrect ? "bi-check-circle" : "bi-x-circle"}`} />
                  {isCorrect ? "Đúng" : "Sai"}
                </span>
              )}
            </div>
            <button
              className={`learning-btn ${bookmarked.has(currentQuestion._id) ? "danger-soft" : ""}`}
              onClick={() => toggleBookmark(currentQuestion._id)}
            >
              <i
                className={`bi ${bookmarked.has(currentQuestion._id) ? "bi-bookmark-fill" : "bi-bookmark"}`}
              />
              {bookmarked.has(currentQuestion._id) ? "Đã lưu" : "Lưu câu khó"}
            </button>
          </div>

          {currentQuestion.readingPassage && (
            <div className="exam-passage">{currentQuestion.readingPassage}</div>
          )}

          {currentQuestion.imageUrl && (
            <div className="exam-media">
              <img
                src={currentQuestion.imageUrl}
                alt={`Minh họa câu ${currentQuestion.questionNumber}`}
              />
            </div>
          )}

          {currentQuestion.questionText && (
            <p className="exam-question-text">{currentQuestion.questionText}</p>
          )}

          <div className="exam-options">
            {Object.entries(currentQuestion.answers || {}).map(([key, value]) => {
              if (!value) return null;
              const isSelected = userAnswer === key;
              const isRightAnswer = currentQuestion.correctAnswer === key;
              const resultClass = userAnswer
                ? isRightAnswer
                  ? "correct"
                  : isSelected
                    ? "wrong"
                    : ""
                : "";

              return (
                <button
                  key={key}
                  className={`exam-option ${isSelected ? "selected" : ""} ${resultClass}`}
                  onClick={() => handleAnswerSelect(currentQuestion._id, key)}
                  disabled={Boolean(userAnswer)}
                >
                  <span className="exam-option-key">{key}</span>
                  <span>{value}</span>
                </button>
              );
            })}
          </div>

          {userAnswer && currentQuestion.explanation && (
            <div className="exam-explanation">
              <strong>
                <i className="bi bi-lightbulb" /> Giải thích chi tiết
              </strong>
              <p style={{ margin: "8px 0 0" }}>{currentQuestion.explanation}</p>
            </div>
          )}

          {userAnswer && !currentQuestion.explanation && (
            <div className="exam-explanation">
              <strong>
                <i className="bi bi-check2-circle" /> Đáp án đúng: {currentQuestion.correctAnswer}
              </strong>
            </div>
          )}

          <div className="exam-footer-actions">
            <button
              className="learning-btn"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              <i className="bi bi-arrow-left" />
              Câu trước
            </button>
            <span className="vocab-muted">
              {currentIndex + 1}/{questions.length}
            </span>
            {currentIndex === questions.length - 1 && userAnswer ? (
              <button className="learning-btn success" onClick={exitPractice}>
                Hoàn thành <i className="bi bi-check2" />
              </button>
            ) : (
              <button
                className="learning-btn primary"
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                }
                disabled={!userAnswer || currentIndex === questions.length - 1}
              >
                Câu tiếp <i className="bi bi-arrow-right" />
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PracticeByPart;





// import React, { useMemo, useState } from "react";
// import { mockExamQuestions, toeicParts } from "../data/learningMockData";

// const buildPracticeQuestions = (partId) =>
//   mockExamQuestions
//     .filter((question) => question.part === partId || question.part === 5 || question.part === 7)
//     .slice(0, 5)
//     .map((question, index) => ({
//       ...question,
//       _id: `practice-${partId}-${index}`,
//       part: partId,
//       questionNumber: partId * 100 + index + 1,
//     }));

// const PracticeByPart = () => {
//   const [activeSkill, setActiveSkill] = useState("Listening");
//   const [activePart, setActivePart] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState({});
//   const [bookmarked, setBookmarked] = useState(new Set());

//   const activePartMeta = useMemo(
//     () => [...toeicParts.Listening, ...toeicParts.Reading].find((part) => part.id === activePart),
//     [activePart],
//   );

//   const startPractice = (partId) => {
//     setActivePart(partId);
//     setQuestions(buildPracticeQuestions(partId));
//     setCurrentIndex(0);
//     setUserAnswers({});
//     setBookmarked(new Set());
//   };

//   const exitPractice = () => {
//     if (Object.keys(userAnswers).length > 0 && !window.confirm("Thoát phiên luyện tập hiện tại?")) return;
//     setActivePart(null);
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
//                     <i className={`bi ${skill === "Listening" ? "bi-headphones" : "bi-journal-text"}`} /> {skill}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="learning-shell">
//           <div className="learning-grid cols-4">
//             {toeicParts[activeSkill].map((part) => (
//               <article key={part.id} className="learning-card interactive practice-part-card" onClick={() => startPractice(part.id)}>
//                 <div className="learning-card-head">
//                   <span className={`learning-icon ${part.tone}`}>
//                     <i className={`bi ${part.icon}`} />
//                   </span>
//                   <span className="learning-badge">Part {part.id}</span>
//                 </div>
//                 <div>
//                   <h2 className="exam-title" style={{ fontSize: "1.16rem" }}>
//                     {part.name}
//                   </h2>
//                   <p className="vocab-muted">{part.type}</p>
//                 </div>
//                 <div className="practice-meta">
//                   <span className="learning-badge green">{part.qCount} câu chuẩn TOEIC</span>
//                   <span className="learning-badge amber">Xem giải thích ngay</span>
//                 </div>
//                 <button className="learning-btn primary" type="button">
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
//                     Với câu trả lời sai, hệ thống hiển thị đáp án đúng và lời giải ngay để bạn sửa lỗi tại chỗ.
//                   </p>
//                 </div>
//               </div>
//               <span className="learning-badge">Dữ liệu mẫu có thể thay bằng API</span>
//             </div>
//           </section>
//         </main>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentIndex];
//   const userAnswer = userAnswers[currentQuestion?._id];
//   const isCorrect = userAnswer === currentQuestion?.correctAnswer;
//   const answeredCount = Object.keys(userAnswers).length;
//   const correctCount = questions.filter((question) => userAnswers[question._id] === question.correctAnswer).length;
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
//           <span style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
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
//               <i className={`bi ${bookmarked.has(currentQuestion._id) ? "bi-bookmark-fill" : "bi-bookmark"}`} />
//               {bookmarked.has(currentQuestion._id) ? "Đã lưu" : "Lưu câu khó"}
//             </button>
//           </div>

//           {(currentQuestion.passage || currentQuestion.readingPassage) && (
//             <div className="exam-passage">{currentQuestion.passage || currentQuestion.readingPassage}</div>
//           )}

//           <p className="exam-question-text">{currentQuestion.questionText}</p>

//           <div className="exam-options">
//             {Object.entries(currentQuestion.answers).map(([key, value]) => {
//               const isSelected = userAnswer === key;
//               const isRightAnswer = currentQuestion.correctAnswer === key;
//               const resultClass = userAnswer ? (isRightAnswer ? "correct" : isSelected ? "wrong" : "") : "";

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

//           {userAnswer && (
//             <div className="exam-explanation">
//               <strong>
//                 <i className="bi bi-lightbulb" /> Giải thích chi tiết
//               </strong>
//               <p style={{ margin: "8px 0 0" }}>{currentQuestion.explanation}</p>
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
//                 onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
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
