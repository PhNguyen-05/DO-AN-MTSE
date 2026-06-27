import React, { useEffect, useState } from "react";
import StudySummary from "./StudySummary";

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

const QuizMode = ({ studyList, allVocabularies, onUpdateVocabStatus, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({}); // { index: selectedOption }
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = studyList[currentIndex];
  const answered = answers[currentIndex] ?? null;
  const isCorrect = answered === currentWord?.meaning;

  // Build options whenever we move to a question that hasn't been answered
  useEffect(() => {
    if (!currentWord) return;
    const wrong = allVocabularies
      .filter((item) => item.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((item) => item.meaning);
    setQuizOptions([currentWord.meaning, ...wrong].sort(() => 0.5 - Math.random()));
    setSelectedAnswer(answers[currentIndex] ?? null);
  }, [currentIndex, currentWord]);

  const handleAnswer = (option) => {
    if (answers[currentIndex] !== undefined) return; // already answered
    const correct = option === currentWord.meaning;
    setSelectedAnswer(option);
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    if (correct) {
      setCorrectCount((prev) => prev + 1);
      onUpdateVocabStatus(currentWord.id, "Đã thuộc");
    }
  };

  const goNext = () => {
    if (currentIndex < studyList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(answers[currentIndex + 1] ?? null);
    } else {
      setIsFinished(true);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswer(answers[currentIndex - 1] ?? null);
    }
  };

  if (isFinished) return <StudySummary total={studyList.length} known={correctCount} onExit={onExit} />;

  const progress = Math.round(((currentIndex + 1) / studyList.length) * 100);
  const answeredCount = Object.keys(answers).length;
  const correctSoFar = Object.entries(answers).filter(([i, opt]) => opt === studyList[Number(i)]?.meaning).length;
  const isAnswered = answered !== null;

  const getOptionClass = (option) => {
    if (!isAnswered) return "exam-option";
    if (option === currentWord.meaning) return "exam-option correct";
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
        </div>
      </div>

      {/* Progress bar */}
      <div className="learning-progress" style={{ marginBottom: 18, height: 7 }}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {/* Word card */}
      <article className="vocab-panel" style={{ textAlign: "center", marginBottom: 14 }}>
        <span className="learning-badge">{currentWord.type || "Word"}</span>
        <h2 className="learning-title" style={{ fontSize: "2.8rem", marginTop: 12, marginBottom: 4 }}>
          {currentWord.word}
        </h2>
        {currentWord.phonetic && (
          <p className="vocab-muted" style={{ fontSize: "1rem", marginBottom: 10 }}>{currentWord.phonetic}</p>
        )}
        <button
          className="learning-btn ghost"
          style={{ margin: "0 auto" }}
          onClick={() => playWordAudio(currentWord.audioUrl, currentWord.word)}
        >
          <i className="bi bi-volume-up" /> Nghe phát âm
        </button>
      </article>

      {/* Result banner — stays visible until user navigates */}
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
            {isCorrect ? "Chính xác!" : `Chưa đúng — đáp án: ${currentWord.meaning}`}
          </div>
          {/* Show example after answering */}
          {currentWord.example && (
            <p style={{ margin: 0, fontSize: "0.88rem", opacity: .85, fontStyle: "italic" }}>
              "{currentWord.example}"
            </p>
          )}
        </div>
      )}

      {/* Options */}
      <div className="quiz-options" style={{ marginBottom: 18 }}>
        {quizOptions.map((option) => (
          <button
            key={option}
            className={getOptionClass(option)}
            onClick={() => handleAnswer(option)}
            disabled={isAnswered}
            style={{ opacity: isAnswered && option !== currentWord.meaning && option !== answered ? 0.55 : 1 }}
          >
            <span className="exam-option-key">
              {isAnswered
                ? option === currentWord.meaning
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

      {/* Navigation */}
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
