import React from "react";

const StudySummary = ({ total, known = 0, onExit }) => (
  <section className="learning-card learning-empty" style={{ width: "min(100%, 560px)", margin: "0 auto" }}>
    <span className="vocab-icon mastered" style={{ marginBottom: 14 }}>
      <i className="bi bi-check2-circle" />
    </span>
    <h2 className="exam-title" style={{ fontSize: "1.45rem" }}>
      Hoàn thành phiên ôn tập
    </h2>
    <p className="learning-subtitle" style={{ marginTop: 8 }}>
      Bạn vừa ôn {total} từ vựng, trong đó {known} từ đã được đánh dấu ghi nhớ.
    </p>
    <button className="learning-btn primary" onClick={onExit} style={{ marginTop: 22 }}>
      Quay lại VocabularyHub
    </button>
  </section>
);

export default StudySummary;
