import React from "react";

const StudySelection = ({ collections, selectedCollection, onStartStudy }) => {
  const activeCollection = collections.find((collection) => collection.id === selectedCollection);

  return (
    <section>
      <div className="learning-section-heading" style={{ marginBottom: 18 }}>
        <div>
          <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
            Chọn chế độ ôn tập
          </h2>
          <p className="vocab-muted">
            {activeCollection
              ? `Đang ôn bộ ${activeCollection.title}.`
              : "Hệ thống sẽ lấy các từ có trạng thái Đang học trong danh sách hiện tại."}
          </p>
        </div>
        <span className="learning-badge green">Flashcard hoặc Quiz</span>
      </div>

      <div className="learning-grid cols-2">
        <article className="learning-card interactive" onClick={() => onStartStudy("flashcard")}>
          <div className="learning-card-head" style={{ marginBottom: 18 }}>
            <span className="vocab-icon study">
              <i className="bi bi-card-text" />
            </span>
            <span className="learning-badge">Ghi nhớ nhanh</span>
          </div>
          <h3 className="exam-title" style={{ fontSize: "1.25rem" }}>
            Flashcard
          </h3>
          <p className="vocab-muted" style={{ marginTop: 8 }}>
            Lật thẻ để xem nghĩa, ví dụ và tự đánh dấu đã ghi nhớ sau mỗi từ.
          </p>
          <button className="learning-btn primary" style={{ marginTop: 18 }} type="button">
            Bắt đầu flashcard <i className="bi bi-arrow-right" />
          </button>
        </article>

        <article className="learning-card interactive" onClick={() => onStartStudy("quiz")}>
          <div className="learning-card-head" style={{ marginBottom: 18 }}>
            <span className="vocab-icon">
              <i className="bi bi-ui-checks" />
            </span>
            <span className="learning-badge amber">Kiểm tra chủ động</span>
          </div>
          <h3 className="exam-title" style={{ fontSize: "1.25rem" }}>
            Trắc nghiệm
          </h3>
          <p className="vocab-muted" style={{ marginTop: 8 }}>
            Chọn nghĩa đúng của từ với 4 đáp án, nhận phản hồi đúng sai ngay lập tức.
          </p>
          <button className="learning-btn primary" style={{ marginTop: 18 }} type="button">
            Bắt đầu quiz <i className="bi bi-arrow-right" />
          </button>
        </article>
      </div>
    </section>
  );
};

export default StudySelection;
