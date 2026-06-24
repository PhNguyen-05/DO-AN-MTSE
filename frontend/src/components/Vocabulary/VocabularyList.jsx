import React from "react";

const VocabularyList = ({ vocabularies }) => {
  const learningCount = vocabularies.filter((word) => word.status === "Đang học").length;
  const masteredCount = vocabularies.filter((word) => word.status === "Đã thuộc").length;

  return (
    <section>
      <div className="learning-section-heading" style={{ marginBottom: 18 }}>
        <div>
          <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
            Sổ tay từ vựng cá nhân
          </h2>
          <p className="vocab-muted">Bạn đang có {vocabularies.length} từ trong danh sách đang xem.</p>
        </div>
        <div className="learning-actions">
          <span className="learning-badge">{learningCount} đang học</span>
          <span className="learning-badge green">{masteredCount} đã thuộc</span>
        </div>
      </div>

      {vocabularies.length === 0 ? (
        <div className="learning-card learning-empty">
          <span className="vocab-icon study">
            <i className="bi bi-journal-plus" />
          </span>
          <h3 className="exam-title" style={{ fontSize: "1.2rem", marginTop: 12 }}>
            Chưa có từ trong bộ này
          </h3>
          <p className="vocab-muted">Hãy tra từ mới rồi thêm vào sổ tay để bắt đầu ôn tập.</p>
        </div>
      ) : (
        <div className="vocab-list">
          {vocabularies.map((word) => (
            <article key={word.id} className={`learning-card vocab-card ${word.status === "Đã thuộc" ? "mastered" : ""}`}>
              <div className="vocab-card-head">
                <div>
                  <h3 className="vocab-word">{word.word}</h3>
                  <span className="vocab-phonetic">{word.phonetic}</span>
                </div>
                <span className={`learning-badge ${word.status === "Đã thuộc" ? "green" : ""}`}>{word.status}</span>
              </div>
              <p style={{ margin: "14px 0 4px", color: "#10233f", fontWeight: 750 }}>{word.meaning}</p>
              <span className="learning-badge amber">{word.type}</span>
              <p className="vocab-example">"{word.example}"</p>
              <p className="vocab-muted" style={{ marginTop: 12 }}>
                Ôn gần nhất: {new Date(word.lastReviewed).toLocaleDateString("vi-VN")}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default VocabularyList;
