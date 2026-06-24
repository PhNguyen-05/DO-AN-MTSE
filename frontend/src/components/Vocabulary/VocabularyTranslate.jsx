import React, { useState } from "react";

const dictionarySamples = {
  negotiate: {
    word: "Negotiate",
    phonetic: "/nɪˈɡoʊ.ʃi.eɪt/",
    type: "Verb",
    meaning: "Đàm phán, thương lượng",
    example: "The supplier agreed to negotiate a better delivery schedule.",
  },
  invoice: {
    word: "Invoice",
    phonetic: "/ˈɪn.vɔɪs/",
    type: "Noun",
    meaning: "Hóa đơn",
    example: "Please send the invoice to the accounting department.",
  },
  expand: {
    word: "Expand",
    phonetic: "/ɪkˈspænd/",
    type: "Verb",
    meaning: "Mở rộng, phát triển",
    example: "The company plans to expand into overseas markets.",
  },
};

const VocabularyTranslate = ({ onSaveToNotebook }) => {
  const [searchWord, setSearchWord] = useState("");
  const [translatedResult, setTranslatedResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = (event) => {
    event.preventDefault();
    const word = searchWord.trim();
    if (!word) return;

    setIsTranslating(true);
    window.setTimeout(() => {
      const result = dictionarySamples[word.toLowerCase()] || {
        word,
        phonetic: `/${word.toLowerCase().slice(0, 3)}.../`,
        type: "Noun/Verb",
        meaning: `Nghĩa mẫu của từ "${word}"`,
        example: `This is a TOEIC-style example sentence for ${word}.`,
      };
      setTranslatedResult(result);
      setIsTranslating(false);
    }, 650);
  };

  return (
    <section className="vocab-translate-layout">
      <article className="vocab-panel">
        <div className="learning-card-head" style={{ marginBottom: 18 }}>
          <div>
            <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
              Phiên dịch từ vựng
            </h2>
            <p className="vocab-muted">Tra nghĩa, loại từ, phiên âm và ví dụ trước khi lưu vào sổ tay.</p>
          </div>
          <span className="vocab-icon">
            <i className="bi bi-translate" />
          </span>
        </div>

        <form className="vocab-search-form" onSubmit={handleTranslate}>
          <input
            className="learning-input"
            type="text"
            value={searchWord}
            onChange={(event) => setSearchWord(event.target.value)}
            placeholder="Nhập từ tiếng Anh cần tra..."
            required
          />
          <button className="learning-btn primary" type="submit" disabled={isTranslating}>
            <i className="bi bi-search" />
            {isTranslating ? "Đang tra" : "Tra từ"}
          </button>
        </form>

        <div className="exam-explanation">
          <strong>Gợi ý thử nhanh</strong>
          <p style={{ margin: "8px 0 0" }}>Nhập negotiate, invoice hoặc expand để xem dữ liệu mẫu có cấu trúc đẹp.</p>
        </div>
      </article>

      <article className="vocab-panel">
        {!translatedResult ? (
          <div className="learning-empty">
            <span className="vocab-icon study">
              <i className="bi bi-search-heart" />
            </span>
            <h3 className="exam-title" style={{ fontSize: "1.2rem", marginTop: 12 }}>
              Kết quả tra từ sẽ hiển thị ở đây
            </h3>
            <p className="vocab-muted">Bạn có thể thêm từ đã tra vào bộ sưu tập cá nhân.</p>
          </div>
        ) : (
          <div className="vocab-result">
            <div className="learning-card-head">
              <div>
                <h3 className="learning-title" style={{ fontSize: "2rem" }}>
                  {translatedResult.word}
                </h3>
                <p className="vocab-muted">{translatedResult.phonetic}</p>
              </div>
              <button className="learning-btn ghost" onClick={() => setTranslatedResult(null)} title="Xóa kết quả">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <span className="learning-badge">{translatedResult.type}</span>
              <h4 style={{ margin: "12px 0 4px", color: "#10233f" }}>Nghĩa tiếng Việt</h4>
              <p style={{ fontSize: "1.2rem", fontWeight: 800 }}>{translatedResult.meaning}</p>
            </div>

            <div className="exam-passage" style={{ background: "#fff" }}>
              <strong>Ví dụ</strong>
              <p style={{ margin: "6px 0 0" }}>"{translatedResult.example}"</p>
            </div>

            <button
              className="learning-btn success"
              style={{ width: "100%" }}
              onClick={() => {
                onSaveToNotebook(translatedResult);
                setTranslatedResult(null);
                setSearchWord("");
              }}
            >
              <i className="bi bi-plus-circle" />
              Thêm từ vào sổ tay cá nhân
            </button>
          </div>
        )}
      </article>
    </section>
  );
};

export default VocabularyTranslate;
