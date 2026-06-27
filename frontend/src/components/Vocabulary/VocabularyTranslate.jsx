import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

const callAPI = async (method, path, body) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.message || "Lỗi server" };
  return data;
};

const dictionarySamples = {
  negotiate: {
    word: "Negotiate", phonetic: "/nɪˈɡoʊ.ʃi.eɪt/", type: "Verb",
    meaning: "Đàm phán, thương lượng",
    example: "The supplier agreed to negotiate a better delivery schedule.", found: true,
  },
  invoice: {
    word: "Invoice", phonetic: "/ˈɪn.vɔɪs/", type: "Noun",
    meaning: "Hóa đơn",
    example: "Please send the invoice to the accounting department.", found: true,
  },
  expand: {
    word: "Expand", phonetic: "/ɪkˈspænd/", type: "Verb",
    meaning: "Mở rộng, phát triển",
    example: "The company plans to expand into overseas markets.", found: true,
  },
  significant: {
    word: "Significant", phonetic: "/sɪɡˈnɪf.ɪ.kənt/", type: "Adjective",
    meaning: "Quan trọng, đáng kể",
    example: "There was a significant improvement in sales this quarter.", found: true,
  },
  implement: {
    word: "Implement", phonetic: "/ˈɪm.plə.ment/", type: "Verb",
    meaning: "Thực hiện, thi hành",
    example: "We need to implement the new policy this quarter.", found: true,
  },
};

const QUICK_WORDS = ["negotiate", "invoice", "expand", "significant", "implement"];

// ──────────────────────────────────────────────────────────────
// Modal chọn bộ từ khi lưu
// ──────────────────────────────────────────────────────────────
const SaveToCollectionModal = ({ word, userCollections, onConfirm, onClose }) => {
  const [selectedId, setSelectedId] = useState("");

  return (
    <div className="learning-modal-backdrop">
      <div className="learning-modal">
        <div className="learning-modal-head">
          <div>
            <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
              Lưu từ vào bộ nào?
            </h2>
            <p className="vocab-muted">
              Chọn bộ từ cá nhân để lưu <strong>"{word}"</strong>
            </p>
          </div>
          <button className="learning-btn ghost" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="learning-form">
          {userCollections.length === 0 ? (
            <div className="learning-empty" style={{ padding: "20px 0" }}>
              <span className="learning-icon amber">
                <i className="bi bi-folder-x" />
              </span>
              <p className="vocab-muted" style={{ marginTop: 10 }}>
                Bạn chưa có bộ từ cá nhân nào. Vào tab <strong>"Bộ từ của tôi"</strong> để tạo bộ trước.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {/* Lưu không phân bộ */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  border: `2px solid ${selectedId === "" ? "#0b57c5" : "#d6deeb"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  background: selectedId === "" ? "#e9f0ff" : "#fff",
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="radio"
                  name="collection"
                  value=""
                  checked={selectedId === ""}
                  onChange={() => setSelectedId("")}
                  style={{ accentColor: "#0b57c5" }}
                />
                <span className="learning-icon" style={{ width: 32, height: 32, fontSize: "1rem" }}>
                  <i className="bi bi-journal-bookmark" />
                </span>
                <div>
                  <strong style={{ color: "#10233f" }}>Sổ tay chung</strong>
                  <p className="vocab-muted" style={{ fontSize: "0.82rem", margin: 0 }}>
                    Lưu vào danh sách không phân bộ
                  </p>
                </div>
              </label>

              {/* Các bộ user tạo */}
              {userCollections.map((col) => (
                <label
                  key={col.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    border: `2px solid ${selectedId === col.id ? "#0b57c5" : "#d6deeb"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    background: selectedId === col.id ? "#e9f0ff" : "#fff",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="collection"
                    value={col.id}
                    checked={selectedId === col.id}
                    onChange={() => setSelectedId(col.id)}
                    style={{ accentColor: "#0b57c5" }}
                  />
                  <span className="learning-icon violet" style={{ width: 32, height: 32, fontSize: "1rem" }}>
                    <i className="bi bi-folder2-open" />
                  </span>
                  <div>
                    <strong style={{ color: "#10233f" }}>{col.title}</strong>
                    {col.description && (
                      <p className="vocab-muted" style={{ fontSize: "0.82rem", margin: 0 }}>
                        {col.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="learning-actions" style={{ justifyContent: "flex-end", marginTop: 8 }}>
            <button className="learning-btn" type="button" onClick={onClose}>
              Hủy
            </button>
            <button
              className="learning-btn primary"
              type="button"
              onClick={() => onConfirm(selectedId || null)}
            >
              <i className="bi bi-plus-circle" />
              Lưu vào đây
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// VocabularyTranslate
// ──────────────────────────────────────────────────────────────
const VocabularyTranslate = ({ onSaveToNotebook, userCollections = [] }) => {
  const [searchWord, setSearchWord] = useState("");
  const [translatedResult, setTranslatedResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const handleTranslate = async (event) => {
    event.preventDefault();
    const word = searchWord.trim();
    if (!word) return;

    setIsTranslating(true);
    setTranslatedResult(null);
    setSaveMessage("");

    try {
      const data = await callAPI("POST", "/api/vocabulary/translate", { word });
      setTranslatedResult(data);
    } catch {
      const sample = dictionarySamples[word.toLowerCase()];
      if (sample) {
        setTranslatedResult(sample);
      } else {
        setTranslatedResult({
          found: false, word,
          phonetic: `/${word.toLowerCase()}/`,
          type: "Unknown",
          meaning: `Không tìm thấy định nghĩa cho "${word}". Hãy kiểm tra lại chính tả.`,
          example: "",
        });
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Mở modal chọn bộ
  const handleOpenSaveModal = () => {
    if (!translatedResult || translatedResult.found === false) return;
    setShowCollectionModal(true);
  };

  // Xác nhận lưu vào bộ đã chọn
  const handleConfirmSave = async (targetCollectionId) => {
    setShowCollectionModal(false);
    setIsSaving(true);
    setSaveMessage("");

    try {
      await callAPI("POST", "/api/vocabulary/notebook", {
        word: translatedResult.word,
        phonetic: translatedResult.phonetic,
        type: translatedResult.type,
        meaning: translatedResult.meaning,
        example: translatedResult.example,
        audioUrl: translatedResult.audioUrl || "",
      });
    } catch (err) {
      if (err.status === 409) {
        setSaveMessage(`⚠️ ${err.message}`);
        setIsSaving(false);
        return;
      }
      // Lỗi khác (chưa đăng nhập) → vẫn lưu local
    }

    onSaveToNotebook(translatedResult, targetCollectionId);
    setTranslatedResult(null);
    setSearchWord("");
    setSaveMessage("");
    setIsSaving(false);
  };

  const handleClear = () => {
    setTranslatedResult(null);
    setSaveMessage("");
  };

  const playAudio = (audioUrl) => {
    if (audioUrl) {
      new Audio(audioUrl).play().catch(() => {});
    }
  };

  return (
    <section className="vocab-translate-layout">
      {/* ── Panel trái: Form tra từ ── */}
      <article className="vocab-panel">
        <div className="learning-card-head" style={{ marginBottom: 18 }}>
          <div>
            <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
              Phiên dịch từ vựng
            </h2>
            <p className="vocab-muted">
              Tra nghĩa, loại từ, phiên âm và ví dụ trước khi lưu vào sổ tay.
            </p>
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
            onChange={(e) => { setSearchWord(e.target.value); setSaveMessage(""); }}
            placeholder="Nhập từ tiếng Anh cần tra..."
            required
            autoComplete="off"
          />
          <button
            className="learning-btn primary"
            type="submit"
            disabled={isTranslating || !searchWord.trim()}
          >
            {isTranslating ? (
              <>
                <span className="learning-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Đang tra...
              </>
            ) : (
              <>
                <i className="bi bi-search" />
                Tra từ
              </>
            )}
          </button>
        </form>

        {/* Gợi ý nhanh */}
        <div style={{ marginTop: 16 }}>
          <p className="vocab-muted" style={{ marginBottom: 10, fontSize: "0.85rem" }}>
            <i className="bi bi-lightbulb" /> Gợi ý thử nhanh:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {QUICK_WORDS.map((w) => (
              <button
                key={w}
                className="learning-btn"
                style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                type="button"
                onClick={() => { setSearchWord(w); setSaveMessage(""); }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="exam-explanation" style={{ marginTop: 20 }}>
          <strong>
            <i className="bi bi-info-circle" /> Cách hoạt động
          </strong>
          <p style={{ margin: "8px 0 0", fontSize: "0.88rem" }}>
            Tra từ qua từ điển tiếng Anh tự động. Sau khi có kết quả, nhấn{" "}
            <strong>"Thêm vào sổ tay"</strong> để chọn bộ từ và lưu lại.
          </p>
        </div>
      </article>

      {/* ── Panel phải: Kết quả ── */}
      <article className="vocab-panel">
        {!translatedResult && (
          <div className="learning-empty">
            <span className="vocab-icon study">
              <i className="bi bi-search-heart" />
            </span>
            <h3 className="exam-title" style={{ fontSize: "1.2rem", marginTop: 12 }}>
              Kết quả tra từ sẽ hiển thị ở đây
            </h3>
            <p className="vocab-muted">
              Nhập một từ tiếng Anh và nhấn <strong>Tra từ</strong> để xem định nghĩa, phiên âm và ví dụ.
            </p>
          </div>
        )}

        {translatedResult && translatedResult.found === false && (
          <div className="learning-empty">
            <span className="vocab-icon" style={{ background: "#fff0f0", color: "#b42318" }}>
              <i className="bi bi-exclamation-circle" />
            </span>
            <h3 className="exam-title" style={{ fontSize: "1.2rem", marginTop: 12, color: "#b42318" }}>
              Không tìm thấy "{translatedResult.word}"
            </h3>
            <p className="vocab-muted" style={{ marginTop: 8 }}>{translatedResult.meaning}</p>
            <button className="learning-btn" style={{ marginTop: 16 }} onClick={handleClear}>
              <i className="bi bi-arrow-left" /> Thử từ khác
            </button>
          </div>
        )}

        {translatedResult && translatedResult.found !== false && (
          <div className="vocab-result">
            {/* Header */}
            <div className="learning-card-head">
              <div>
                <h3 className="learning-title" style={{ fontSize: "2rem", color: "#10233f" }}>
                  {translatedResult.word}
                </h3>
                <p className="vocab-muted">{translatedResult.phonetic}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {translatedResult.audioUrl && (
                  <button
                    className="learning-btn ghost"
                    onClick={() => playAudio(translatedResult.audioUrl)}
                    title="Nghe phát âm"
                    style={{ padding: "6px 10px" }}
                  >
                    <i className="bi bi-volume-up-fill" style={{ fontSize: "1.2rem", color: "#0b57c5" }} />
                  </button>
                )}
                <button className="learning-btn ghost" onClick={handleClear} title="Xóa kết quả">
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            </div>

            {/* Loại từ + Nghĩa */}
            <div style={{ marginTop: 18 }}>
              <span className="learning-badge">{translatedResult.type}</span>
              <p style={{ fontSize: "1.15rem", fontWeight: 800, color: "#10233f", marginTop: 10 }}>
                {translatedResult.meaning}
              </p>
            </div>

            {/* Ví dụ */}
            {translatedResult.example && (
              <div className="exam-passage" style={{ background: "#fff", marginTop: 16 }}>
                <strong style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
                  Ví dụ
                </strong>
                <p style={{ margin: "6px 0 0", fontStyle: "italic" }}>
                  "{translatedResult.example}"
                </p>
              </div>
            )}

            {/* Thông báo lỗi trùng */}
            {saveMessage && (
              <div style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 8,
                background: "#fff3d6", color: "#a15c00", fontSize: "0.88rem", fontWeight: 650,
              }}>
                {saveMessage}
              </div>
            )}

            {/* Nút lưu */}
            <button
              className="learning-btn primary"
              style={{ width: "100%", marginTop: 20 }}
              onClick={handleOpenSaveModal}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="learning-spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: "#fff" }} />
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle" />
                  Thêm từ vào sổ tay
                </>
              )}
            </button>
          </div>
        )}
      </article>

      {/* Modal chọn bộ */}
      {showCollectionModal && translatedResult && (
        <SaveToCollectionModal
          word={translatedResult.word}
          userCollections={userCollections}
          onConfirm={handleConfirmSave}
          onClose={() => setShowCollectionModal(false)}
        />
      )}
    </section>
  );
};

export default VocabularyTranslate;




// import React, { useState } from "react";

// const API_BASE = import.meta.env.VITE_API_URL || "";

// const getToken = () => {
//   const token = localStorage.getItem("token");
//   if (!token) return "";
//   return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
// };

// const callAPI = async (method, path, body) => {
//   const res = await fetch(`${API_BASE}${path}`, {
//     method,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: getToken(),
//     },
//     body: body ? JSON.stringify(body) : undefined,
//   });

//   const data = await res.json();
//   if (!res.ok) throw { status: res.status, message: data.message || "Lỗi server" };
//   return data;
// };

// const dictionarySamples = {
//   negotiate: {
//     word: "Negotiate",
//     phonetic: "/nɪˈɡoʊ.ʃi.eɪt/",
//     audioUrl: "",
//     type: "Verb",
//     meaning: "Đàm phán, thương lượng",
//     example: "The supplier agreed to negotiate a better delivery schedule.",
//     found: true,
//   },
//   invoice: {
//     word: "Invoice",
//     phonetic: "/ˈɪn.vɔɪs/",
//     audioUrl: "",
//     type: "Noun",
//     meaning: "Hóa đơn",
//     example: "Please send the invoice to the accounting department.",
//     found: true,
//   },
//   expand: {
//     word: "Expand",
//     phonetic: "/ɪkˈspænd/",
//     audioUrl: "",
//     type: "Verb",
//     meaning: "Mở rộng, phát triển",
//     example: "The company plans to expand into overseas markets.",
//     found: true,
//   },
//   significant: {
//     word: "Significant",
//     phonetic: "/sɪɡˈnɪf.ɪ.kənt/",
//     audioUrl: "",
//     type: "Adjective",
//     meaning: "Quan trọng, đáng kể",
//     example: "There was a significant improvement in sales this quarter.",
//     found: true,
//   },
//   implement: {
//     word: "Implement",
//     phonetic: "/ˈɪm.plə.ment/",
//     audioUrl: "",
//     type: "Verb",
//     meaning: "Thực hiện, thi hành",
//     example: "We need to implement the new policy this quarter.",
//     found: true,
//   },
// };

// const QUICK_WORDS = ["negotiate", "invoice", "expand", "significant", "implement"];

// const VocabularyTranslate = ({ onSaveToNotebook }) => {
//   const [searchWord, setSearchWord] = useState("");
//   const [translatedResult, setTranslatedResult] = useState(null);
//   const [isTranslating, setIsTranslating] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState("");

//   const handleTranslate = async (event) => {
//     event.preventDefault();
//     const word = searchWord.trim();
//     if (!word) return;

//     setIsTranslating(true);
//     setTranslatedResult(null);
//     setSaveMessage("");

//     try {
//       const data = await callAPI("POST", "/api/vocabulary/translate", { word });
//       setTranslatedResult(data);
//     } catch {
//       const sample = dictionarySamples[word.toLowerCase()];
//       if (sample) {
//         setTranslatedResult(sample);
//       } else {
//         setTranslatedResult({
//           found: false,
//           word,
//           phonetic: `/${word.toLowerCase()}/`,
//           type: "Unknown",
//           meaning: `Không tìm thấy định nghĩa cho "${word}". Hãy kiểm tra lại chính tả.`,
//           example: "",
//         });
//       }
//     } finally {
//       setIsTranslating(false);
//     }
//   };

//   const handleSaveToNotebook = async () => {
//     if (!translatedResult || translatedResult.found === false) return;

//     setIsSaving(true);
//     setSaveMessage("");

//     try {
//       await callAPI("POST", "/api/vocabulary/notebook", {
//         word: translatedResult.word,
//         phonetic: translatedResult.phonetic,
//         type: translatedResult.type,
//         meaning: translatedResult.meaning,
//         example: translatedResult.example,
//         audioUrl: translatedResult.audioUrl || "",
//       });

//       onSaveToNotebook(translatedResult);
//       setTranslatedResult(null);
//       setSearchWord("");
//     } catch (err) {
//       if (err.status === 409) {
//         setSaveMessage(`⚠️ ${err.message}`);
//       } else {
//         onSaveToNotebook(translatedResult);
//         setTranslatedResult(null);
//         setSearchWord("");
//       }
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleClear = () => {
//     setTranslatedResult(null);
//     setSaveMessage("");
//   };

//   const playAudio = (audioUrl) => {
//     if (audioUrl) {
//       const audio = new Audio(audioUrl);
//       audio.play().catch(() => {});
//     }
//   };

//   return (
//     <section className="vocab-translate-layout">
//       {/* Panel trái: Form tra từ */}
//       <article className="vocab-panel">
//         <div className="learning-card-head" style={{ marginBottom: 18 }}>
//           <div>
//             <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
//               Phiên dịch từ vựng
//             </h2>
//             <p className="vocab-muted">
//               Tra nghĩa, loại từ, phiên âm và ví dụ trước khi lưu vào sổ tay.
//             </p>
//           </div>
//           <span className="vocab-icon">
//             <i className="bi bi-translate" />
//           </span>
//         </div>

//         <form className="vocab-search-form" onSubmit={handleTranslate}>
//           <input
//             className="learning-input"
//             type="text"
//             value={searchWord}
//             onChange={(e) => {
//               setSearchWord(e.target.value);
//               setSaveMessage("");
//             }}
//             placeholder="Nhập từ tiếng Anh cần tra..."
//             required
//             autoComplete="off"
//           />
//           <button
//             className="learning-btn primary"
//             type="submit"
//             disabled={isTranslating || !searchWord.trim()}
//           >
//             {isTranslating ? (
//               <>
//                 <span className="learning-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
//                 Đang tra...
//               </>
//             ) : (
//               <>
//                 <i className="bi bi-search" />
//                 Tra từ
//               </>
//             )}
//           </button>
//         </form>

//         {/* Gợi ý nhanh */}
//         <div style={{ marginTop: 16 }}>
//           <p className="vocab-muted" style={{ marginBottom: 10, fontSize: "0.85rem" }}>
//             <i className="bi bi-lightbulb" /> Gợi ý thử nhanh:
//           </p>
//           <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//             {QUICK_WORDS.map((w) => (
//               <button
//                 key={w}
//                 className="learning-btn"
//                 style={{ padding: "5px 12px", fontSize: "0.82rem" }}
//                 type="button"
//                 onClick={() => {
//                   setSearchWord(w);
//                   setSaveMessage("");
//                 }}
//               >
//                 {w}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Hướng dẫn */}
//         <div className="exam-explanation" style={{ marginTop: 20 }}>
//           <strong>
//             <i className="bi bi-info-circle" /> Cách hoạt động
//           </strong>
//           <p style={{ margin: "8px 0 0", fontSize: "0.88rem" }}>
//             Tra từ qua từ điển tiếng Anh tự động. Sau khi có kết quả, nhấn{" "}
//             <strong>"Thêm vào sổ tay"</strong> để lưu và ôn tập bằng Flashcard hoặc Quiz.
//           </p>
//         </div>
//       </article>

//       {/* Panel phải: Kết quả */}
//       <article className="vocab-panel">
//         {/* Trạng thái rỗng */}
//         {!translatedResult && (
//           <div className="learning-empty">
//             <span className="vocab-icon study">
//               <i className="bi bi-search-heart" />
//             </span>
//             <h3 className="exam-title" style={{ fontSize: "1.2rem", marginTop: 12 }}>
//               Kết quả tra từ sẽ hiển thị ở đây
//             </h3>
//             <p className="vocab-muted">
//               Nhập một từ tiếng Anh và nhấn <strong>Tra từ</strong> để xem định nghĩa, phiên âm và ví dụ.
//             </p>
//           </div>
//         )}

//         {/* Không tìm thấy */}
//         {translatedResult && translatedResult.found === false && (
//           <div className="learning-empty">
//             <span className="vocab-icon" style={{ background: "#fff0f0", color: "#b42318" }}>
//               <i className="bi bi-exclamation-circle" />
//             </span>
//             <h3
//               className="exam-title"
//               style={{ fontSize: "1.2rem", marginTop: 12, color: "#b42318" }}
//             >
//               Không tìm thấy "{translatedResult.word}"
//             </h3>
//             <p className="vocab-muted" style={{ marginTop: 8 }}>
//               {translatedResult.meaning}
//             </p>
//             <button className="learning-btn" style={{ marginTop: 16 }} onClick={handleClear}>
//               <i className="bi bi-arrow-left" /> Thử từ khác
//             </button>
//           </div>
//         )}

//         {/* Có kết quả - UI mới */}
//         {translatedResult && translatedResult.found !== false && (
//           <div className="vocab-result">
//             {/* Header: từ + phiên âm + icon loa trên cùng 1 hàng */}
//             <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
//               <div style={{ flex: 1 }}>
//                 {/* Từ tiếng Anh + icon loa cạnh nhau */}
//                 <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//                   <h3 className="learning-title" style={{ fontSize: "2rem", color: "#10233f", margin: 0 }}>
//                     {translatedResult.word}
//                   </h3>
//                   {translatedResult.audioUrl && (
//                     <button
//                       className="learning-btn ghost"
//                       style={{
//                         padding: "4px 8px",
//                         minHeight: "auto",
//                         border: "1px solid #d6deeb",
//                         borderRadius: 8,
//                         background: "#f8fafc",
//                         color: "#0b57c5",
//                         fontSize: "1.1rem",
//                       }}
//                       onClick={() => playAudio(translatedResult.audioUrl)}
//                       title="Nghe phát âm"
//                     >
//                       <i className="bi bi-volume-up-fill" />
//                     </button>
//                   )}
//                 </div>
//                 {/* Phiên âm */}
//                 <p className="vocab-muted" style={{ marginTop: 4 }}>{translatedResult.phonetic}</p>
//               </div>
//               {/* Nút đóng */}
//               <button className="learning-btn ghost" onClick={handleClear} title="Xóa kết quả">
//                 <i className="bi bi-x-lg" />
//               </button>
//             </div>

//             {/* Loại từ */}
//             <div style={{ marginTop: 14 }}>
//               <span className="learning-badge">{translatedResult.type}</span>
//             </div>

//             {/* Nghĩa tiếng Việt - nổi bật */}
//             <div
//               style={{
//                 marginTop: 16,
//                 padding: "16px 18px",
//                 borderRadius: 10,
//                 background: "#f0f5ff",
//                 borderLeft: "4px solid #0b57c5",
//               }}
//             >
//               <p
//                 style={{
//                   fontSize: "1.25rem",
//                   fontWeight: 800,
//                   color: "#10233f",
//                   margin: 0,
//                   lineHeight: 1.45,
//                 }}
//               >
//                 {translatedResult.meaning}
//               </p>
//             </div>

//             {/* Thông báo lỗi trùng lặp */}
//             {saveMessage && (
//               <div
//                 style={{
//                   marginTop: 12,
//                   padding: "10px 14px",
//                   borderRadius: 8,
//                   background: "#fff3d6",
//                   color: "#a15c00",
//                   fontSize: "0.88rem",
//                   fontWeight: 650,
//                 }}
//               >
//                 {saveMessage}
//               </div>
//             )}

//             {/* Nút lưu */}
//             <button
//               className="learning-btn success"
//               style={{ width: "100%", marginTop: 20 }}
//               onClick={handleSaveToNotebook}
//               disabled={isSaving}
//             >
//               {isSaving ? (
//                 <>
//                   <span
//                     className="learning-spinner"
//                     style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: "#fff" }}
//                   />
//                   Đang lưu...
//                 </>
//               ) : (
//                 <>
//                   <i className="bi bi-plus-circle" />
//                   Thêm từ vào sổ tay cá nhân
//                 </>
//               )}
//             </button>
//           </div>
//         )}
//       </article>
//     </section>
//   );
// };

// export default VocabularyTranslate;
