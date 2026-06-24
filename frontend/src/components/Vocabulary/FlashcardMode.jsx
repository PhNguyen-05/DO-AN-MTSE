import React, { useState } from "react";
import StudySummary from "./StudySummary";

const FlashcardMode = ({ studyList, onUpdateVocabStatus, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = studyList[currentIndex];

  const handleNextItem = (known) => {
    if (known) {
      onUpdateVocabStatus(currentWord.id, "Đã thuộc");
      setKnownCount((prev) => prev + 1);
    }

    if (currentIndex < studyList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) return <StudySummary total={studyList.length} known={knownCount} onExit={onExit} />;

  return (
    <section className="flashcard-stage">
      <div className="learning-section-heading" style={{ marginBottom: 18 }}>
        <button className="learning-btn" onClick={onExit}>
          <i className="bi bi-arrow-left" />
          Thoát
        </button>
        <div className="learning-actions">
          <span className="learning-badge">
            Từ {currentIndex + 1}/{studyList.length}
          </span>
          <span className="learning-badge green">{knownCount} đã nhớ</span>
        </div>
      </div>

      <div className="flashcard" onClick={() => setIsFlipped((prev) => !prev)}>
        <div className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}>
          <div className="flashcard-face">
            <div>
              <span className="learning-badge">{currentWord.type}</span>
              <h2 className="learning-title" style={{ fontSize: "2.6rem", marginTop: 18 }}>
                {currentWord.word}
              </h2>
              <p className="learning-subtitle" style={{ fontSize: "1.1rem" }}>
                {currentWord.phonetic}
              </p>
              <p className="vocab-muted" style={{ marginTop: 24 }}>
                Nhấp vào thẻ để lật mặt sau
              </p>
            </div>
          </div>

          <div className="flashcard-face flashcard-back">
            <div>
              <h2 className="exam-title" style={{ fontSize: "1.8rem" }}>
                {currentWord.meaning}
              </h2>
              <div className="exam-passage" style={{ background: "#f8fafc", marginTop: 18 }}>
                "{currentWord.example}"
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="learning-grid cols-2" style={{ marginTop: 18, opacity: isFlipped ? 1 : 0.45 }}>
        <button className="learning-btn danger-soft" onClick={() => handleNextItem(false)} disabled={!isFlipped}>
          <i className="bi bi-arrow-repeat" />
          Vẫn chưa thuộc
        </button>
        <button className="learning-btn success" onClick={() => handleNextItem(true)} disabled={!isFlipped}>
          <i className="bi bi-check2-circle" />
          Đã ghi nhớ
        </button>
      </div>
    </section>
  );
};

export default FlashcardMode;
