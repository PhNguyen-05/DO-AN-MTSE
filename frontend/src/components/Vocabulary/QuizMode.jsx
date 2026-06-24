import React, { useEffect, useState } from "react";
import StudySummary from "./StudySummary";

const QuizMode = ({ studyList, allVocabularies, onUpdateVocabStatus, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = studyList[currentIndex];

  useEffect(() => {
    if (!currentWord) return;
    const wrongOptions = allVocabularies
      .filter((item) => item.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((item) => item.meaning);

    setQuizOptions([currentWord.meaning, ...wrongOptions].sort(() => 0.5 - Math.random()));
    setSelectedAnswer(null);
  }, [allVocabularies, currentIndex, currentWord]);

  const handleAnswer = (option) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);

    const isCorrect = option === currentWord.meaning;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      onUpdateVocabStatus(currentWord.id, "Đã thuộc");
    }

    window.setTimeout(() => {
      if (currentIndex < studyList.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 900);
  };

  if (isFinished) return <StudySummary total={studyList.length} known={correctCount} onExit={onExit} />;

  return (
    <section>
      <div className="learning-section-heading" style={{ marginBottom: 18 }}>
        <button className="learning-btn" onClick={onExit}>
          <i className="bi bi-arrow-left" />
          Thoát
        </button>
        <div className="learning-actions">
          <div className="learning-progress" style={{ width: 220 }}>
            <span style={{ width: `${((currentIndex + 1) / studyList.length) * 100}%` }} />
          </div>
          <span className="learning-badge">
            {currentIndex + 1}/{studyList.length}
          </span>
        </div>
      </div>

      <article className="vocab-panel" style={{ textAlign: "center", marginBottom: 18 }}>
        <span className="learning-badge">Chọn nghĩa đúng</span>
        <h2 className="learning-title" style={{ fontSize: "2.7rem", marginTop: 12 }}>
          {currentWord.word}
        </h2>
        <p className="learning-subtitle">{currentWord.phonetic}</p>
      </article>

      <div className="quiz-options">
        {quizOptions.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentWord.meaning;
          const stateClass = selectedAnswer ? (isCorrect ? "correct" : isSelected ? "wrong" : "") : "";

          return (
            <button
              key={option}
              className={`exam-option ${stateClass}`}
              onClick={() => handleAnswer(option)}
              disabled={Boolean(selectedAnswer)}
            >
              <span className="exam-option-key">
                <i className="bi bi-check2" />
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default QuizMode;
