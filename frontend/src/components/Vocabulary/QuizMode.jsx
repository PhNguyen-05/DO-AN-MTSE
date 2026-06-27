import React, { useEffect, useState } from "react";

// ──────────────────────────────────────────────────────────────
// Màn hình kết quả Quiz
// ──────────────────────────────────────────────────────────────
const QuizResultScreen = ({ studyList, answers, onExit }) => {
  const correctCount = studyList.filter(
    (w, i) => answers[i] === w.meaning
  ).length;
  const total = studyList.length;
  const accuracy = Math.round((correctCount / total) * 100);

  const wrongWords = studyList.filter((w, i) => answers[i] !== w.meaning);

  // Phân loại theo điểm
  const rating =
    accuracy >= 90 ? { label: "Xuất sắc!", icon: "bi-trophy-fill", color: "#087443", bg: "#eaf8ef" }
    : accuracy >= 70 ? { label: "Tốt lắm!", icon: "bi-star-fill", color: "#a15c00", bg: "#fff3d6" }
    : accuracy >= 50 ? { label: "Khá ổn!", icon: "bi-hand-thumbs-up-fill", color: "#0b57c5", bg: "#e9f0ff" }
    : { label: "Cần cố gắng thêm!", icon: "bi-arrow-repeat", color: "#b42318", bg: "#fff0f0" };

  const [showWrongList, setShowWrongList] = useState(false);

  return (
    <section style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Header kết quả */}
      <div
        className="learning-card"
        style={{
          textAlign: "center",
          padding: "36px 28px",
          border: `2px solid ${rating.color}22`,
          background: rating.bg,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            width: 72,
            height: 72,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: rating.color,
            color: "#fff",
            fontSize: "2rem",
            marginBottom: 16,
          }}
        >
          <i className={`bi ${rating.icon}`} />
        </div>

        <h2 className="exam-title" style={{ fontSize: "1.6rem", color: rating.color }}>
          {rating.label}
        </h2>
        <p className="vocab-muted" style={{ marginTop: 6 }}>
          Bạn vừa hoàn thành phiên trắc nghiệm với {total} từ vựng.
        </p>

        {/* Vòng tròn điểm số */}
        <div style={{ margin: "24px auto 0", width: 140, position: "relative" }}>
          <svg viewBox="0 0 120 120" style={{ width: 140, height: 140 }}>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e8edf6" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={rating.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - accuracy / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
            <text x="60" y="58" textAnchor="middle" fill="#10233f" fontSize="22" fontWeight="800">
              {accuracy}%
            </text>
            <text x="60" y="76" textAnchor="middle" fill="#64748b" fontSize="11">
              chính xác
            </text>
          </svg>
        </div>
      </div>

      {/* Thống kê chi tiết */}
      <div className="learning-grid cols-3" style={{ marginBottom: 18 }}>
        <article className="learning-card" style={{ textAlign: "center", padding: "18px 12px" }}>
          <span
            className="learning-icon green"
            style={{ margin: "0 auto 10px", display: "flex", justifyContent: "center" }}
          >
            <i className="bi bi-check-circle-fill" />
          </span>
          <strong className="learning-stat-value" style={{ fontSize: "1.8rem", color: "#087443" }}>
            {correctCount}
          </strong>
          <span className="learning-stat-label">Câu đúng</span>
        </article>

        <article className="learning-card" style={{ textAlign: "center", padding: "18px 12px" }}>
          <span
            className="learning-icon red"
            style={{ margin: "0 auto 10px", display: "flex", justifyContent: "center" }}
          >
            <i className="bi bi-x-circle-fill" />
          </span>
          <strong className="learning-stat-value" style={{ fontSize: "1.8rem", color: "#b42318" }}>
            {total - correctCount}
          </strong>
          <span className="learning-stat-label">Câu sai</span>
        </article>

        <article className="learning-card" style={{ textAlign: "center", padding: "18px 12px" }}>
          <span
            className="learning-icon violet"
            style={{ margin: "0 auto 10px", display: "flex", justifyContent: "center" }}
          >
            <i className="bi bi-collection-fill" />
          </span>
          <strong className="learning-stat-value" style={{ fontSize: "1.8rem" }}>
            {total}
          </strong>
          <span className="learning-stat-label">Tổng từ</span>
        </article>
      </div>

      {/* Danh sách từ sai — có thể mở/đóng */}
      {wrongWords.length > 0 && (
        <div className="learning-card" style={{ marginBottom: 18 }}>
          <button
            className="learning-btn ghost"
            style={{ width: "100%", justifyContent: "space-between", padding: "4px 0" }}
            onClick={() => setShowWrongList((v) => !v)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="learning-icon red" style={{ width: 32, height: 32, fontSize: "0.9rem" }}>
                <i className="bi bi-exclamation-triangle-fill" />
              </span>
              <div style={{ textAlign: "left" }}>
                <strong style={{ color: "#10233f" }}>
                  {wrongWords.length} từ trả lời sai
                </strong>
                <p className="vocab-muted" style={{ margin: 0, fontSize: "0.82rem" }}>
                  Những từ bạn trả lời sai trong lần này
                </p>
              </div>
            </div>
            <i className={`bi ${showWrongList ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ color: "#64748b" }} />
          </button>

          {showWrongList && (
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {wrongWords.map((w, i) => {
                const userAns = answers[studyList.indexOf(w)];
                return (
                  <div
                    key={w.id || i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      padding: "12px 14px",
                      border: "1px solid #ffd4d4",
                      borderRadius: 8,
                      background: "#fff8f8",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#10233f", fontSize: "1rem" }}>{w.word}</strong>
                      {w.phonetic && (
                        <span className="vocab-muted" style={{ display: "block", fontSize: "0.8rem" }}>
                          {w.phonetic}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.78rem", color: "#b42318", fontWeight: 650, marginBottom: 3 }}>
                        <i className="bi bi-x-circle" /> Bạn chọn: {userAns || "(bỏ trống)"}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#087443", fontWeight: 650 }}>
                        <i className="bi bi-check-circle" /> Đáp án: {w.meaning}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Nút hành động — chỉ còn nút về VocabularyHub */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 4 }}>
        <button className="learning-btn primary" onClick={onExit}>
          <i className="bi bi-house" />
          Về VocabularyHub
        </button>
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────
// Helper phát âm
// ──────────────────────────────────────────────────────────────
const playWordAudio = (audioUrl, word) => {
  if (audioUrl) {
    new Audio(audioUrl).play().catch(() => {});
    return;
  }
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
};

// ──────────────────────────────────────────────────────────────
// QuizMode (main)
// ──────────────────────────────────────────────────────────────
const QuizMode = ({ studyList, allVocabularies, onUpdateVocabStatus, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState([]);
  const [answers, setAnswers] = useState({}); // { index: selectedOption }
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = studyList[currentIndex];
  const answered = answers[currentIndex] ?? null;
  const isCorrect = answered === currentWord?.meaning;

  // Build options khi chuyển câu
  useEffect(() => {
    if (!currentWord) return;
    const wrong = allVocabularies
      .filter((item) => item.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((item) => item.meaning);
    setQuizOptions([currentWord.meaning, ...wrong].sort(() => 0.5 - Math.random()));
  }, [currentIndex, currentWord]);

  const handleAnswer = (option) => {
    if (answers[currentIndex] !== undefined) return;
    const correct = option === currentWord.meaning;
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    if (correct) {
      setCorrectCount((prev) => prev + 1);
      onUpdateVocabStatus(currentWord.id, "Đã thuộc");
    }
  };

  const goNext = () => {
    if (currentIndex < studyList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Màn kết quả — truyền onExit trực tiếp, không có onRestart
  if (isFinished) {
    return (
      <QuizResultScreen
        studyList={studyList}
        answers={answers}
        onExit={onExit}
      />
    );
  }

  const progress = Math.round(((currentIndex + 1) / studyList.length) * 100);
  const answeredCount = Object.keys(answers).length;
  const correctSoFar = Object.entries(answers).filter(
    ([i, opt]) => opt === studyList[Number(i)]?.meaning
  ).length;
  const isAnswered = answered !== null;

  const getOptionClass = (option) => {
    if (!isAnswered) return "exam-option";
    if (option === currentWord?.meaning) return "exam-option correct";
    if (option === answered && !isCorrect) return "exam-option wrong";
    return "exam-option";
  };

  return (
    <section>
      {/* Header */}
      <div className="learning-section-heading" style={{ marginBottom: 18 }}>
        <button className="learning-btn" onClick={onExit}>
          <i className="bi bi-arrow-left" /> Thoát
        </button>
        <div className="learning-actions">
          <span className="learning-badge green">
            <i className="bi bi-check-circle" /> {correctSoFar} đúng
          </span>
          <span className="learning-badge red">
            <i className="bi bi-x-circle" /> {answeredCount - correctSoFar} sai
          </span>
          <span className="learning-badge">
            {answeredCount}/{studyList.length} đã làm
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="learning-progress" style={{ marginBottom: 18, height: 7 }}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {/* Word card */}
      <article className="vocab-panel" style={{ textAlign: "center", marginBottom: 14 }}>
        <span className="learning-badge">{currentWord?.type || "Word"}</span>
        <h2 className="learning-title" style={{ fontSize: "2.8rem", marginTop: 12, marginBottom: 4 }}>
          {currentWord?.word}
        </h2>
        {currentWord?.phonetic && (
          <p className="vocab-muted" style={{ fontSize: "1rem", marginBottom: 10 }}>
            {currentWord.phonetic}
          </p>
        )}
        <button
          className="learning-btn ghost"
          style={{ margin: "0 auto" }}
          onClick={() => playWordAudio(currentWord?.audioUrl, currentWord?.word)}
        >
          <i className="bi bi-volume-up" /> Nghe phát âm
        </button>
      </article>

      {/* Kết quả banner sau khi trả lời */}
      {isAnswered && (
        <div
          className="exam-explanation"
          style={{
            marginBottom: 14,
            background: isCorrect ? "#eaf8ef" : "#fff0f0",
            borderLeftColor: isCorrect ? "#16a34a" : "#dc2626",
            color: isCorrect ? "#087443" : "#b42318",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 750, marginBottom: 8 }}>
            <i className={`bi ${isCorrect ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />
            {isCorrect ? "Chính xác!" : `Chưa đúng — đáp án: ${currentWord?.meaning}`}
          </div>
          {(currentWord?.exampleEn || currentWord?.example) && (
            <p style={{ margin: 0, fontSize: "0.88rem", opacity: 0.85, fontStyle: "italic" }}>
              "{currentWord.exampleEn || currentWord.example}"
            </p>
          )}
        </div>
      )}

      {/* Các đáp án */}
      <div className="quiz-options" style={{ marginBottom: 18 }}>
        {quizOptions.map((option) => (
          <button
            key={option}
            className={getOptionClass(option)}
            onClick={() => handleAnswer(option)}
            disabled={isAnswered}
            style={{ opacity: isAnswered && option !== currentWord?.meaning && option !== answered ? 0.55 : 1 }}
          >
            <span className="exam-option-key">
              {isAnswered
                ? option === currentWord?.meaning
                  ? <i className="bi bi-check2" />
                  : option === answered
                    ? <i className="bi bi-x" />
                    : "○"
                : "○"}
            </span>
            <span>{option}</span>
          </button>
        ))}
      </div>

      {/* Điều hướng */}
      <div className="exam-footer-actions">
        <button className="learning-btn" onClick={goPrev} disabled={currentIndex === 0}>
          <i className="bi bi-arrow-left" /> Câu trước
        </button>
        <span className="vocab-muted">
          {currentIndex + 1} / {studyList.length}
        </span>
        {isAnswered ? (
          <button className="learning-btn primary" onClick={goNext}>
            {currentIndex === studyList.length - 1 ? (
              <><i className="bi bi-flag-fill" /> Xem kết quả</>
            ) : (
              <>Câu sau <i className="bi bi-arrow-right" /></>
            )}
          </button>
        ) : (
          <button className="learning-btn" disabled>
            Câu sau <i className="bi bi-arrow-right" />
          </button>
        )}
      </div>
    </section>
  );
};

export default QuizMode;


// import React, { useEffect, useState } from "react";

// // ──────────────────────────────────────────────────────────────
// // Màn hình kết quả Quiz
// // ──────────────────────────────────────────────────────────────
// const QuizResultScreen = ({ studyList, answers, onRestart, onExit }) => {
//   const correctCount = studyList.filter(
//     (w, i) => answers[i] === w.meaning
//   ).length;
//   const total = studyList.length;
//   const accuracy = Math.round((correctCount / total) * 100);

//   const wrongWords = studyList.filter((w, i) => answers[i] !== w.meaning);
//   const correctWords = studyList.filter((w, i) => answers[i] === w.meaning);

//   // Phân loại theo điểm
//   const rating =
//     accuracy >= 90 ? { label: "Xuất sắc!", icon: "bi-trophy-fill", color: "#087443", bg: "#eaf8ef" }
//     : accuracy >= 70 ? { label: "Tốt lắm!", icon: "bi-star-fill", color: "#a15c00", bg: "#fff3d6" }
//     : accuracy >= 50 ? { label: "Khá ổn!", icon: "bi-hand-thumbs-up-fill", color: "#0b57c5", bg: "#e9f0ff" }
//     : { label: "Cần cố gắng thêm!", icon: "bi-arrow-repeat", color: "#b42318", bg: "#fff0f0" };

//   const [showWrongList, setShowWrongList] = useState(false);

//   return (
//     <section style={{ maxWidth: 680, margin: "0 auto" }}>
//       {/* Header kết quả */}
//       <div
//         className="learning-card"
//         style={{
//           textAlign: "center",
//           padding: "36px 28px",
//           border: `2px solid ${rating.color}22`,
//           background: rating.bg,
//           marginBottom: 18,
//         }}
//       >
//         <div
//           style={{
//             display: "inline-flex",
//             width: 72,
//             height: 72,
//             alignItems: "center",
//             justifyContent: "center",
//             borderRadius: "50%",
//             background: rating.color,
//             color: "#fff",
//             fontSize: "2rem",
//             marginBottom: 16,
//           }}
//         >
//           <i className={`bi ${rating.icon}`} />
//         </div>

//         <h2 className="exam-title" style={{ fontSize: "1.6rem", color: rating.color }}>
//           {rating.label}
//         </h2>
//         <p className="vocab-muted" style={{ marginTop: 6 }}>
//           Bạn vừa hoàn thành phiên trắc nghiệm với {total} từ vựng.
//         </p>

//         {/* Vòng tròn điểm số */}
//         <div style={{ margin: "24px auto 0", width: 140, position: "relative" }}>
//           <svg viewBox="0 0 120 120" style={{ width: 140, height: 140 }}>
//             {/* Track */}
//             <circle cx="60" cy="60" r="50" fill="none" stroke="#e8edf6" strokeWidth="10" />
//             {/* Progress */}
//             <circle
//               cx="60" cy="60" r="50"
//               fill="none"
//               stroke={rating.color}
//               strokeWidth="10"
//               strokeLinecap="round"
//               strokeDasharray={`${2 * Math.PI * 50}`}
//               strokeDashoffset={`${2 * Math.PI * 50 * (1 - accuracy / 100)}`}
//               transform="rotate(-90 60 60)"
//               style={{ transition: "stroke-dashoffset 1s ease" }}
//             />
//             <text x="60" y="58" textAnchor="middle" fill="#10233f" fontSize="22" fontWeight="800">
//               {accuracy}%
//             </text>
//             <text x="60" y="76" textAnchor="middle" fill="#64748b" fontSize="11">
//               chính xác
//             </text>
//           </svg>
//         </div>
//       </div>

//       {/* Thống kê chi tiết */}
//       <div className="learning-grid cols-3" style={{ marginBottom: 18 }}>
//         <article className="learning-card" style={{ textAlign: "center", padding: "18px 12px" }}>
//           <span
//             className="learning-icon green"
//             style={{ margin: "0 auto 10px", display: "flex", justifyContent: "center" }}
//           >
//             <i className="bi bi-check-circle-fill" />
//           </span>
//           <strong className="learning-stat-value" style={{ fontSize: "1.8rem", color: "#087443" }}>
//             {correctCount}
//           </strong>
//           <span className="learning-stat-label">Câu đúng</span>
//         </article>

//         <article className="learning-card" style={{ textAlign: "center", padding: "18px 12px" }}>
//           <span
//             className="learning-icon red"
//             style={{ margin: "0 auto 10px", display: "flex", justifyContent: "center" }}
//           >
//             <i className="bi bi-x-circle-fill" />
//           </span>
//           <strong className="learning-stat-value" style={{ fontSize: "1.8rem", color: "#b42318" }}>
//             {total - correctCount}
//           </strong>
//           <span className="learning-stat-label">Câu sai</span>
//         </article>

//         <article className="learning-card" style={{ textAlign: "center", padding: "18px 12px" }}>
//           <span
//             className="learning-icon violet"
//             style={{ margin: "0 auto 10px", display: "flex", justifyContent: "center" }}
//           >
//             <i className="bi bi-collection-fill" />
//           </span>
//           <strong className="learning-stat-value" style={{ fontSize: "1.8rem" }}>
//             {total}
//           </strong>
//           <span className="learning-stat-label">Tổng từ</span>
//         </article>
//       </div>

//       {/* Danh sách từ sai — có thể mở/đóng */}
//       {wrongWords.length > 0 && (
//         <div className="learning-card" style={{ marginBottom: 18 }}>
//           <button
//             className="learning-btn ghost"
//             style={{ width: "100%", justifyContent: "space-between", padding: "4px 0" }}
//             onClick={() => setShowWrongList((v) => !v)}
//           >
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               <span className="learning-icon red" style={{ width: 32, height: 32, fontSize: "0.9rem" }}>
//                 <i className="bi bi-exclamation-triangle-fill" />
//               </span>
//               <div style={{ textAlign: "left" }}>
//                 <strong style={{ color: "#10233f" }}>
//                   {wrongWords.length} từ cần ôn lại
//                 </strong>
//                 <p className="vocab-muted" style={{ margin: 0, fontSize: "0.82rem" }}>
//                   Những từ bạn trả lời sai trong lần này
//                 </p>
//               </div>
//             </div>
//             <i className={`bi ${showWrongList ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ color: "#64748b" }} />
//           </button>

//           {showWrongList && (
//             <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
//               {wrongWords.map((w, i) => {
//                 const userAns = answers[studyList.indexOf(w)];
//                 return (
//                   <div
//                     key={w.id || i}
//                     style={{
//                       display: "grid",
//                       gridTemplateColumns: "1fr 1fr",
//                       gap: 10,
//                       padding: "12px 14px",
//                       border: "1px solid #ffd4d4",
//                       borderRadius: 8,
//                       background: "#fff8f8",
//                     }}
//                   >
//                     <div>
//                       <strong style={{ color: "#10233f", fontSize: "1rem" }}>{w.word}</strong>
//                       {w.phonetic && (
//                         <span className="vocab-muted" style={{ display: "block", fontSize: "0.8rem" }}>
//                           {w.phonetic}
//                         </span>
//                       )}
//                     </div>
//                     <div>
//                       <div style={{ fontSize: "0.78rem", color: "#b42318", fontWeight: 650, marginBottom: 3 }}>
//                         <i className="bi bi-x-circle" /> Bạn chọn: {userAns || "(bỏ trống)"}
//                       </div>
//                       <div style={{ fontSize: "0.78rem", color: "#087443", fontWeight: 650 }}>
//                         <i className="bi bi-check-circle" /> Đáp án: {w.meaning}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Các từ đúng */}
//       {correctWords.length > 0 && (
//         <div
//           className="learning-card"
//           style={{ marginBottom: 18, padding: "14px 18px", background: "#f8fff9", borderColor: "#b7e4c7" }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <span className="learning-icon green" style={{ width: 32, height: 32, fontSize: "0.9rem" }}>
//               <i className="bi bi-check2-all" />
//             </span>
//             <div>
//               <strong style={{ color: "#087443" }}>
//                 {correctWords.length} từ đã được đánh dấu "Đã thuộc"
//               </strong>
//               <p className="vocab-muted" style={{ margin: 0, fontSize: "0.82rem" }}>
//                 Trạng thái các từ này đã được cập nhật tự động.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Nút hành động */}
//       <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 4 }}>
//         {wrongWords.length > 0 && (
//           <button className="learning-btn primary" onClick={onRestart}>
//             <i className="bi bi-arrow-repeat" />
//             Ôn lại từ sai ({wrongWords.length})
//           </button>
//         )}
//         <button className="learning-btn" onClick={onExit}>
//           <i className="bi bi-house" />
//           Về VocabularyHub
//         </button>
//       </div>
//     </section>
//   );
// };

// // ──────────────────────────────────────────────────────────────
// // Helper phát âm
// // ──────────────────────────────────────────────────────────────
// const playWordAudio = (audioUrl, word) => {
//   if (audioUrl) {
//     new Audio(audioUrl).play().catch(() => {});
//     return;
//   }
//   if ("speechSynthesis" in window) {
//     const u = new SpeechSynthesisUtterance(word);
//     u.lang = "en-US";
//     u.rate = 0.85;
//     speechSynthesis.cancel();
//     speechSynthesis.speak(u);
//   }
// };

// // ──────────────────────────────────────────────────────────────
// // QuizMode (main)
// // ──────────────────────────────────────────────────────────────
// const QuizMode = ({ studyList, allVocabularies, onUpdateVocabStatus, onExit }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [quizOptions, setQuizOptions] = useState([]);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const [answers, setAnswers] = useState({}); // { index: selectedOption }
//   const [correctCount, setCorrectCount] = useState(0);
//   const [isFinished, setIsFinished] = useState(false);

//   const currentWord = studyList[currentIndex];
//   const answered = answers[currentIndex] ?? null;
//   const isCorrect = answered === currentWord?.meaning;

//   // Build options khi chuyển câu
//   useEffect(() => {
//     if (!currentWord) return;
//     const wrong = allVocabularies
//       .filter((item) => item.id !== currentWord.id)
//       .sort(() => 0.5 - Math.random())
//       .slice(0, 3)
//       .map((item) => item.meaning);
//     setQuizOptions([currentWord.meaning, ...wrong].sort(() => 0.5 - Math.random()));
//     setSelectedAnswer(answers[currentIndex] ?? null);
//   }, [currentIndex, currentWord]);

//   const handleAnswer = (option) => {
//     if (answers[currentIndex] !== undefined) return;
//     const correct = option === currentWord.meaning;
//     setSelectedAnswer(option);
//     setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
//     if (correct) {
//       setCorrectCount((prev) => prev + 1);
//       onUpdateVocabStatus(currentWord.id, "Đã thuộc");
//     }
//   };

//   const goNext = () => {
//     if (currentIndex < studyList.length - 1) {
//       setCurrentIndex((prev) => prev + 1);
//       setSelectedAnswer(answers[currentIndex + 1] ?? null);
//     } else {
//       setIsFinished(true);
//     }
//   };

//   const goPrev = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex((prev) => prev - 1);
//       setSelectedAnswer(answers[currentIndex - 1] ?? null);
//     }
//   };

//   // Ôn lại từ sai
//   const handleRestartWrong = () => {
//     const wrongWords = studyList.filter((w, i) => answers[i] !== w.meaning);
//     if (!wrongWords.length) return;
//     // Reset với danh sách từ sai
//     setCurrentIndex(0);
//     setAnswers({});
//     setCorrectCount(0);
//     setIsFinished(false);
//     // Shuffle lại
//     wrongWords.sort(() => 0.5 - Math.random());
//     // Thay studyList (cần thông báo lên parent — ở đây dùng trick re-mount)
//     // Vì studyList là prop, ta navigate về exit để parent xử lý
//     // Cách đơn giản: reload quiz với từ sai thông qua state cục bộ
//     setLocalStudyList(wrongWords);
//   };

//   const [localStudyList, setLocalStudyList] = useState(null);
//   const activeList = localStudyList || studyList;

//   // Khi localStudyList thay đổi → reset quiz
//   useEffect(() => {
//     if (localStudyList) {
//       setCurrentIndex(0);
//       setAnswers({});
//       setCorrectCount(0);
//       setIsFinished(false);
//     }
//   }, [localStudyList]);

//   // Màn kết quả
//   if (isFinished) {
//     return (
//       <QuizResultScreen
//         studyList={activeList}
//         answers={answers}
//         onRestart={handleRestartWrong}
//         onExit={onExit}
//       />
//     );
//   }

//   // Dùng activeList cho currentWord
//   const currentWordActive = activeList[currentIndex];
//   const answeredActive = answers[currentIndex] ?? null;
//   const isCorrectActive = answeredActive === currentWordActive?.meaning;

//   const progress = Math.round(((currentIndex + 1) / activeList.length) * 100);
//   const answeredCount = Object.keys(answers).length;
//   const correctSoFar = Object.entries(answers).filter(
//     ([i, opt]) => opt === activeList[Number(i)]?.meaning
//   ).length;
//   const isAnswered = answeredActive !== null;

//   // Nếu đang dùng localStudyList cần rebuild options
//   const activeOptions = quizOptions;

//   const getOptionClass = (option) => {
//     if (!isAnswered) return "exam-option";
//     if (option === currentWordActive?.meaning) return "exam-option correct";
//     if (option === answeredActive && !isCorrectActive) return "exam-option wrong";
//     return "exam-option";
//   };

//   return (
//     <section>
//       {/* Header */}
//       <div className="learning-section-heading" style={{ marginBottom: 18 }}>
//         <button className="learning-btn" onClick={onExit}>
//           <i className="bi bi-arrow-left" /> Thoát
//         </button>
//         <div className="learning-actions">
//           <span className="learning-badge green">
//             <i className="bi bi-check-circle" /> {correctSoFar} đúng
//           </span>
//           <span className="learning-badge red">
//             <i className="bi bi-x-circle" /> {answeredCount - correctSoFar} sai
//           </span>
//           <span className="learning-badge">
//             {answeredCount}/{activeList.length} đã làm
//           </span>
//         </div>
//       </div>

//       {/* Progress bar */}
//       <div className="learning-progress" style={{ marginBottom: 18, height: 7 }}>
//         <span style={{ width: `${progress}%` }} />
//       </div>

//       {/* Word card */}
//       <article className="vocab-panel" style={{ textAlign: "center", marginBottom: 14 }}>
//         <span className="learning-badge">{currentWordActive?.type || "Word"}</span>
//         <h2 className="learning-title" style={{ fontSize: "2.8rem", marginTop: 12, marginBottom: 4 }}>
//           {currentWordActive?.word}
//         </h2>
//         {currentWordActive?.phonetic && (
//           <p className="vocab-muted" style={{ fontSize: "1rem", marginBottom: 10 }}>
//             {currentWordActive.phonetic}
//           </p>
//         )}
//         <button
//           className="learning-btn ghost"
//           style={{ margin: "0 auto" }}
//           onClick={() => playWordAudio(currentWordActive?.audioUrl, currentWordActive?.word)}
//         >
//           <i className="bi bi-volume-up" /> Nghe phát âm
//         </button>
//       </article>

//       {/* Kết quả banner sau khi trả lời */}
//       {isAnswered && (
//         <div
//           className="exam-explanation"
//           style={{
//             marginBottom: 14,
//             background: isCorrectActive ? "#eaf8ef" : "#fff0f0",
//             borderLeftColor: isCorrectActive ? "#16a34a" : "#dc2626",
//             color: isCorrectActive ? "#087443" : "#b42318",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 750, marginBottom: 8 }}>
//             <i className={`bi ${isCorrectActive ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />
//             {isCorrectActive ? "Chính xác!" : `Chưa đúng — đáp án: ${currentWordActive?.meaning}`}
//           </div>
//           {/* Ví dụ tiếng Anh sau khi trả lời */}
//           {(currentWordActive?.exampleEn || currentWordActive?.example) && (
//             <p style={{ margin: 0, fontSize: "0.88rem", opacity: 0.85, fontStyle: "italic" }}>
//               "{currentWordActive.exampleEn || currentWordActive.example}"
//             </p>
//           )}
//         </div>
//       )}

//       {/* Các đáp án */}
//       <div className="quiz-options" style={{ marginBottom: 18 }}>
//         {activeOptions.map((option) => (
//           <button
//             key={option}
//             className={getOptionClass(option)}
//             onClick={() => handleAnswer(option)}
//             disabled={isAnswered}
//             style={{ opacity: isAnswered && option !== currentWordActive?.meaning && option !== answeredActive ? 0.55 : 1 }}
//           >
//             <span className="exam-option-key">
//               {isAnswered
//                 ? option === currentWordActive?.meaning
//                   ? <i className="bi bi-check2" />
//                   : option === answeredActive
//                     ? <i className="bi bi-x" />
//                     : "○"
//                 : "○"}
//             </span>
//             <span>{option}</span>
//           </button>
//         ))}
//       </div>

//       {/* Điều hướng */}
//       <div className="exam-footer-actions">
//         <button className="learning-btn" onClick={goPrev} disabled={currentIndex === 0}>
//           <i className="bi bi-arrow-left" /> Câu trước
//         </button>
//         <span className="vocab-muted">
//           {currentIndex + 1} / {activeList.length}
//         </span>
//         {isAnswered ? (
//           <button className="learning-btn primary" onClick={goNext}>
//             {currentIndex === activeList.length - 1 ? (
//               <><i className="bi bi-flag-fill" /> Xem kết quả</>
//             ) : (
//               <>Câu sau <i className="bi bi-arrow-right" /></>
//             )}
//           </button>
//         ) : (
//           <button className="learning-btn" disabled>
//             Câu sau <i className="bi bi-arrow-right" />
//           </button>
//         )}
//       </div>
//     </section>
//   );
// };

// export default QuizMode;



// import React, { useEffect, useState } from "react";
// import StudySummary from "./StudySummary";

// const playWordAudio = (audioUrl, word) => {
//   if (audioUrl) {
//     new Audio(audioUrl).play().catch(() => {});
//     return;
//   }
//   if ("speechSynthesis" in window) {
//     const u = new SpeechSynthesisUtterance(word);
//     u.lang = "en-US";
//     u.rate = 0.85;
//     speechSynthesis.cancel();
//     speechSynthesis.speak(u);
//   }
// };

// const QuizMode = ({ studyList, allVocabularies, onUpdateVocabStatus, onExit }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [quizOptions, setQuizOptions] = useState([]);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const [answers, setAnswers] = useState({}); // { index: selectedOption }
//   const [correctCount, setCorrectCount] = useState(0);
//   const [isFinished, setIsFinished] = useState(false);

//   const currentWord = studyList[currentIndex];
//   const answered = answers[currentIndex] ?? null;
//   const isCorrect = answered === currentWord?.meaning;

//   // Build options whenever we move to a question that hasn't been answered
//   useEffect(() => {
//     if (!currentWord) return;
//     const wrong = allVocabularies
//       .filter((item) => item.id !== currentWord.id)
//       .sort(() => 0.5 - Math.random())
//       .slice(0, 3)
//       .map((item) => item.meaning);
//     setQuizOptions([currentWord.meaning, ...wrong].sort(() => 0.5 - Math.random()));
//     setSelectedAnswer(answers[currentIndex] ?? null);
//   }, [currentIndex, currentWord]);

//   const handleAnswer = (option) => {
//     if (answers[currentIndex] !== undefined) return; // already answered
//     const correct = option === currentWord.meaning;
//     setSelectedAnswer(option);
//     setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
//     if (correct) {
//       setCorrectCount((prev) => prev + 1);
//       onUpdateVocabStatus(currentWord.id, "Đã thuộc");
//     }
//   };

//   const goNext = () => {
//     if (currentIndex < studyList.length - 1) {
//       setCurrentIndex((prev) => prev + 1);
//       setSelectedAnswer(answers[currentIndex + 1] ?? null);
//     } else {
//       setIsFinished(true);
//     }
//   };

//   const goPrev = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex((prev) => prev - 1);
//       setSelectedAnswer(answers[currentIndex - 1] ?? null);
//     }
//   };

//   if (isFinished) return <StudySummary total={studyList.length} known={correctCount} onExit={onExit} />;

//   const progress = Math.round(((currentIndex + 1) / studyList.length) * 100);
//   const answeredCount = Object.keys(answers).length;
//   const correctSoFar = Object.entries(answers).filter(([i, opt]) => opt === studyList[Number(i)]?.meaning).length;
//   const isAnswered = answered !== null;

//   const getOptionClass = (option) => {
//     if (!isAnswered) return "exam-option";
//     if (option === currentWord.meaning) return "exam-option correct";
//     if (option === answered && !isCorrect) return "exam-option wrong";
//     return "exam-option";
//   };

//   return (
//     <section>
//       {/* Header */}
//       <div className="learning-section-heading" style={{ marginBottom: 18 }}>
//         <button className="learning-btn" onClick={onExit}>
//           <i className="bi bi-arrow-left" /> Thoát
//         </button>
//         <div className="learning-actions">
//           <span className="learning-badge green">
//             <i className="bi bi-check-circle" /> {correctSoFar} đúng
//           </span>
//           <span className="learning-badge red">
//             <i className="bi bi-x-circle" /> {answeredCount - correctSoFar} sai
//           </span>
//         </div>
//       </div>

//       {/* Progress bar */}
//       <div className="learning-progress" style={{ marginBottom: 18, height: 7 }}>
//         <span style={{ width: `${progress}%` }} />
//       </div>

//       {/* Word card */}
//       <article className="vocab-panel" style={{ textAlign: "center", marginBottom: 14 }}>
//         <span className="learning-badge">{currentWord.type || "Word"}</span>
//         <h2 className="learning-title" style={{ fontSize: "2.8rem", marginTop: 12, marginBottom: 4 }}>
//           {currentWord.word}
//         </h2>
//         {currentWord.phonetic && (
//           <p className="vocab-muted" style={{ fontSize: "1rem", marginBottom: 10 }}>{currentWord.phonetic}</p>
//         )}
//         <button
//           className="learning-btn ghost"
//           style={{ margin: "0 auto" }}
//           onClick={() => playWordAudio(currentWord.audioUrl, currentWord.word)}
//         >
//           <i className="bi bi-volume-up" /> Nghe phát âm
//         </button>
//       </article>

//       {/* Result banner — stays visible until user navigates */}
//       {isAnswered && (
//         <div
//           className="exam-explanation"
//           style={{
//             marginBottom: 14,
//             background: isCorrect ? "#eaf8ef" : "#fff0f0",
//             borderLeftColor: isCorrect ? "#16a34a" : "#dc2626",
//             color: isCorrect ? "#087443" : "#b42318",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 750, marginBottom: 8 }}>
//             <i className={`bi ${isCorrect ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />
//             {isCorrect ? "Chính xác!" : `Chưa đúng — đáp án: ${currentWord.meaning}`}
//           </div>
//           {/* Show example after answering */}
//           {currentWord.example && (
//             <p style={{ margin: 0, fontSize: "0.88rem", opacity: .85, fontStyle: "italic" }}>
//               "{currentWord.example}"
//             </p>
//           )}
//         </div>
//       )}

//       {/* Options */}
//       <div className="quiz-options" style={{ marginBottom: 18 }}>
//         {quizOptions.map((option) => (
//           <button
//             key={option}
//             className={getOptionClass(option)}
//             onClick={() => handleAnswer(option)}
//             disabled={isAnswered}
//             style={{ opacity: isAnswered && option !== currentWord.meaning && option !== answered ? 0.55 : 1 }}
//           >
//             <span className="exam-option-key">
//               {isAnswered
//                 ? option === currentWord.meaning
//                   ? <i className="bi bi-check2" />
//                   : option === answered
//                     ? <i className="bi bi-x" />
//                     : "○"
//                 : "○"}
//             </span>
//             <span>{option}</span>
//           </button>
//         ))}
//       </div>

//       {/* Navigation */}
//       <div className="exam-footer-actions">
//         <button className="learning-btn" onClick={goPrev} disabled={currentIndex === 0}>
//           <i className="bi bi-arrow-left" /> Câu trước
//         </button>
//         <span className="vocab-muted">
//           {currentIndex + 1} / {studyList.length}
//         </span>
//         {isAnswered ? (
//           <button className="learning-btn primary" onClick={goNext}>
//             {currentIndex === studyList.length - 1 ? (
//               <><i className="bi bi-flag-fill" /> Xem kết quả</>
//             ) : (
//               <>Câu sau <i className="bi bi-arrow-right" /></>
//             )}
//           </button>
//         ) : (
//           <button className="learning-btn" disabled>
//             Câu sau <i className="bi bi-arrow-right" />
//           </button>
//         )}
//       </div>
//     </section>
//   );
// };

// export default QuizMode;


// import React, { useEffect, useState } from "react";
// import StudySummary from "./StudySummary";

// const QuizMode = ({ studyList, allVocabularies, onUpdateVocabStatus, onExit }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [quizOptions, setQuizOptions] = useState([]);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const [correctCount, setCorrectCount] = useState(0);
//   const [isFinished, setIsFinished] = useState(false);

//   const currentWord = studyList[currentIndex];

//   useEffect(() => {
//     if (!currentWord) return;
//     const wrongOptions = allVocabularies
//       .filter((item) => item.id !== currentWord.id)
//       .sort(() => 0.5 - Math.random())
//       .slice(0, 3)
//       .map((item) => item.meaning);

//     setQuizOptions([currentWord.meaning, ...wrongOptions].sort(() => 0.5 - Math.random()));
//     setSelectedAnswer(null);
//   }, [allVocabularies, currentIndex, currentWord]);

//   const handleAnswer = (option) => {
//     if (selectedAnswer) return;
//     setSelectedAnswer(option);

//     const isCorrect = option === currentWord.meaning;
//     if (isCorrect) {
//       setCorrectCount((prev) => prev + 1);
//       onUpdateVocabStatus(currentWord.id, "Đã thuộc");
//     }

//     window.setTimeout(() => {
//       if (currentIndex < studyList.length - 1) {
//         setCurrentIndex((prev) => prev + 1);
//       } else {
//         setIsFinished(true);
//       }
//     }, 900);
//   };

//   if (isFinished) return <StudySummary total={studyList.length} known={correctCount} onExit={onExit} />;

//   return (
//     <section>
//       <div className="learning-section-heading" style={{ marginBottom: 18 }}>
//         <button className="learning-btn" onClick={onExit}>
//           <i className="bi bi-arrow-left" />
//           Thoát
//         </button>
//         <div className="learning-actions">
//           <div className="learning-progress" style={{ width: 220 }}>
//             <span style={{ width: `${((currentIndex + 1) / studyList.length) * 100}%` }} />
//           </div>
//           <span className="learning-badge">
//             {currentIndex + 1}/{studyList.length}
//           </span>
//         </div>
//       </div>

//       <article className="vocab-panel" style={{ textAlign: "center", marginBottom: 18 }}>
//         <span className="learning-badge">Chọn nghĩa đúng</span>
//         <h2 className="learning-title" style={{ fontSize: "2.7rem", marginTop: 12 }}>
//           {currentWord.word}
//         </h2>
//         <p className="learning-subtitle">{currentWord.phonetic}</p>
//       </article>

//       <div className="quiz-options">
//         {quizOptions.map((option) => {
//           const isSelected = selectedAnswer === option;
//           const isCorrect = option === currentWord.meaning;
//           const stateClass = selectedAnswer ? (isCorrect ? "correct" : isSelected ? "wrong" : "") : "";

//           return (
//             <button
//               key={option}
//               className={`exam-option ${stateClass}`}
//               onClick={() => handleAnswer(option)}
//               disabled={Boolean(selectedAnswer)}
//             >
//               <span className="exam-option-key">
//                 <i className="bi bi-check2" />
//               </span>
//               <span>{option}</span>
//             </button>
//           );
//         })}
//       </div>
//     </section>
//   );
// };

// export default QuizMode;
