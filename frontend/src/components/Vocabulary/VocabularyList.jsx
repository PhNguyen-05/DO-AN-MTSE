import React, { useMemo, useState } from "react";

// ──────────────────────────────────────────────────────────────
// Modal chỉnh sửa từ vựng
// ──────────────────────────────────────────────────────────────
const EditWordModal = ({ word, userCollections, onSave, onClose }) => {
  const [form, setForm] = useState({
    word:         word.word     || "",
    phonetic:     word.phonetic || "",
    type:         word.type     || "",
    meaning:      word.meaning  || "",
    example:      word.example  || "",
    exampleEn:    word.exampleEn || word.example || "",
    collectionId: word.collectionId || "",
    status:       word.status   || "Đang học",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.word.trim() || !form.meaning.trim()) return;
    onSave({ ...form, word: form.word.trim(), meaning: form.meaning.trim() });
  };

  return (
    <div className="learning-modal-backdrop">
      <div className="learning-modal" style={{ maxWidth: 560 }}>
        <div className="learning-modal-head">
          <h2 className="exam-title" style={{ fontSize: "1.15rem" }}>Chỉnh sửa từ vựng</h2>
          <button className="learning-btn ghost" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <form className="learning-form" onSubmit={handleSubmit}>
          <div className="learning-form-grid">
            <div className="learning-field">
              <label>Từ (tiếng Anh) *</label>
              <input className="learning-input" name="word" value={form.word} onChange={handleChange} required />
            </div>
            <div className="learning-field">
              <label>Phiên âm</label>
              <input className="learning-input" name="phonetic" value={form.phonetic} onChange={handleChange} placeholder="/fəˈnetɪk/" />
            </div>
          </div>

          <div className="learning-form-grid">
            <div className="learning-field">
              <label>Loại từ</label>
              <select className="learning-input" name="type" value={form.type} onChange={handleChange}>
                <option value="">-- Chọn loại từ --</option>
                {["Noun", "Verb", "Adjective", "Adverb", "Phrase", "Other"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="learning-field">
              <label>Trạng thái</label>
              <select className="learning-input" name="status" value={form.status} onChange={handleChange}>
                <option value="Đang học">Đang học</option>
                <option value="Đã thuộc">Đã thuộc</option>
              </select>
            </div>
          </div>

          <div className="learning-field">
            <label>Nghĩa tiếng Việt *</label>
            <input className="learning-input" name="meaning" value={form.meaning} onChange={handleChange} required />
          </div>

          <div className="learning-field">
            <label>Ví dụ (tiếng Anh)</label>
            <textarea
              className="learning-input"
              name="exampleEn"
              rows={2}
              value={form.exampleEn}
              onChange={handleChange}
              style={{ resize: "vertical" }}
              placeholder="e.g. The team negotiated a new contract."
            />
          </div>

          {userCollections.length > 0 && (
            <div className="learning-field">
              <label>Bộ từ</label>
              <select className="learning-input" name="collectionId" value={form.collectionId} onChange={handleChange}>
                <option value="">Sổ tay chung (không phân bộ)</option>
                {userCollections.map((col) => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="learning-actions" style={{ justifyContent: "flex-end" }}>
            <button className="learning-btn" type="button" onClick={onClose}>Hủy</button>
            <button className="learning-btn primary" type="submit">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// WordCard
// ──────────────────────────────────────────────────────────────
const WordCard = ({ word, userCollections, onDelete, onEdit }) => {
  const isUserAdded = word.isUserAdded === true;

  // Ưu tiên ví dụ tiếng Anh; fallback sang example nếu không có
  const exampleText = word.exampleEn || word.example || "";

  const playAudio = (e) => {
    e.stopPropagation();
    if (word.audioUrl) new Audio(word.audioUrl).play().catch(() => {});
  };

  return (
    <article className={`learning-card vocab-card ${word.status === "Đã thuộc" ? "mastered" : ""}`}>
      <div className="vocab-card-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 className="vocab-word">{word.word}</h3>
            {word.audioUrl && (
              <button
                className="learning-btn ghost"
                style={{ padding: "2px 6px", color: "#0b57c5" }}
                onClick={playAudio}
                title="Nghe phát âm"
              >
                <i className="bi bi-volume-up-fill" style={{ fontSize: "1rem" }} />
              </button>
            )}
          </div>
          <span className="vocab-phonetic">{word.phonetic}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span className={`learning-badge ${word.status === "Đã thuộc" ? "green" : ""}`}>
            {word.status}
          </span>
          {isUserAdded && (
            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              <button
                className="learning-btn ghost"
                style={{ padding: "3px 7px", fontSize: "0.82rem" }}
                title="Chỉnh sửa từ"
                onClick={() => onEdit(word)}
              >
                <i className="bi bi-pencil" style={{ color: "#0b57c5" }} />
              </button>
              <button
                className="learning-btn ghost"
                style={{ padding: "3px 7px", fontSize: "0.82rem" }}
                title="Xóa từ"
                onClick={() => {
                  if (window.confirm(`Xóa từ "${word.word}" khỏi sổ tay?`)) onDelete(word.id);
                }}
              >
                <i className="bi bi-trash" style={{ color: "#b42318" }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nghĩa tiếng Việt */}
      <p style={{ margin: "14px 0 4px", color: "#10233f", fontWeight: 750 }}>{word.meaning}</p>
      {word.type && <span className="learning-badge amber">{word.type}</span>}

      {/* Ví dụ tiếng Anh */}
      {exampleText && (
        <p className="vocab-example">"{exampleText}"</p>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, alignItems: "center" }}>
        <p className="vocab-muted" style={{ fontSize: "0.78rem", margin: 0 }}>
          Ôn gần nhất: {new Date(word.lastReviewed).toLocaleDateString("vi-VN")}
        </p>
        {!isUserAdded && (
          <span className="learning-badge" style={{ fontSize: "0.72rem" }}>
            <i className="bi bi-shield-check" style={{ marginRight: 3 }} />
            Hệ thống
          </span>
        )}
      </div>
    </article>
  );
};

// ──────────────────────────────────────────────────────────────
// VocabularyList (main)
// Props mới: activeCollectionId — bộ từ đang được chọn từ ngoài vào
//            (nếu có thì mặc định filter theo bộ đó, không hiện dropdown)
// ──────────────────────────────────────────────────────────────
const VocabularyList = ({
  vocabularies,
  userCollections = [],
  allCollections  = [],   // toàn bộ bộ từ (user + system) để hiện trong dropdown
  activeCollectionId = null,
  onDeleteWord,
  onEditWord,
}) => {
  // Nếu được truyền activeCollectionId từ ngoài thì dùng nó làm filter mặc định
  const [filterCollection, setFilterCollection] = useState(activeCollectionId || "");
  const [filterStatus,     setFilterStatus]     = useState("all");
  const [searchTerm,       setSearchTerm]        = useState("");
  const [editingWord,      setEditingWord]       = useState(null);

  // Khi prop thay đổi (user click bộ từ khác từ MyCollections), sync lại
  React.useEffect(() => {
    if (activeCollectionId !== null) setFilterCollection(activeCollectionId);
  }, [activeCollectionId]);

  const learningCount = vocabularies.filter((w) => w.status === "Đang học").length;
  const masteredCount = vocabularies.filter((w) => w.status === "Đã thuộc").length;

  // Danh sách bộ từ hiển thị trong dropdown (bỏ "Tất cả" và "Không phân bộ")
  const collectionOptions = allCollections.length > 0 ? allCollections : userCollections;

  const filteredVocabs = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return vocabularies.filter((w) => {
      const matchStatus = filterStatus === "all" || w.status === filterStatus;

      // Lọc bộ từ: nếu không chọn gì → hiện tất cả
      const matchCol =
        !filterCollection
          ? true
          : w.collectionId === filterCollection;

      const matchSearch =
        !keyword ||
        w.word.toLowerCase().includes(keyword) ||
        w.meaning.toLowerCase().includes(keyword);

      return matchStatus && matchCol && matchSearch;
    });
  }, [vocabularies, filterStatus, filterCollection, searchTerm]);

  const handleSaveEdit = (updatedData) => {
    onEditWord(editingWord.id, updatedData);
    setEditingWord(null);
  };

  // Label của bộ đang chọn (cho placeholder)
  const selectedColLabel = collectionOptions.find((c) => c.id === filterCollection)?.title;

  return (
    <section>
      {/* Header */}
      <div className="learning-section-heading" style={{ marginBottom: 14 }}>
        <div>
          <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>Sổ tay từ vựng cá nhân</h2>
          <p className="vocab-muted">Bạn đang có {vocabularies.length} từ trong sổ tay.</p>
        </div>
        <div className="learning-actions">
          <span className="learning-badge">{learningCount} đang học</span>
          <span className="learning-badge green">{masteredCount} đã thuộc</span>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="learning-card" style={{ marginBottom: 18, padding: "16px 18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center" }}>
          {/* Tìm kiếm */}
          <div className="exam-search" style={{ minHeight: 40 }}>
            <i className="bi bi-search" style={{ color: "#64748b" }} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm từ hoặc nghĩa..."
              style={{ width: "100%", border: 0, background: "transparent", font: "inherit", outline: "none", color: "#10233f" }}
            />
          </div>

          {/* Lọc bộ từ — chỉ hiện các bộ cụ thể, không có "Tất cả" hay "Không phân bộ" */}
          <select
            className="learning-input"
            value={filterCollection}
            onChange={(e) => setFilterCollection(e.target.value)}
            style={{ minWidth: 200 }}
          >
            <option value="">-- Chọn bộ từ --</option>
            {collectionOptions.map((col) => (
              <option key={col.id} value={col.id}>{col.title}</option>
            ))}
          </select>

          {/* Lọc trạng thái */}
          <div className="learning-segmented">
            {[
              { value: "all",       label: "Tất cả"    },
              { value: "Đang học",  label: "Đang học"  },
              { value: "Đã thuộc",  label: "Đã thuộc"  },
            ].map((opt) => (
              <button
                key={opt.value}
                className={filterStatus === opt.value ? "active" : ""}
                onClick={() => setFilterStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chip bộ đang chọn + nút xóa filter */}
        {filterCollection && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <span className="learning-badge">
              <i className="bi bi-funnel-fill" />
              {selectedColLabel}
            </span>
            <button
              className="learning-btn ghost"
              style={{ padding: "2px 8px", fontSize: "0.82rem" }}
              onClick={() => setFilterCollection("")}
            >
              <i className="bi bi-x" /> Bỏ lọc
            </button>
          </div>
        )}
      </div>

      {/* Danh sách */}
      {filteredVocabs.length === 0 ? (
        <div className="learning-card learning-empty">
          <span className="vocab-icon study">
            <i className="bi bi-journal-plus" />
          </span>
          <h3 className="exam-title" style={{ fontSize: "1.2rem", marginTop: 12 }}>
            {vocabularies.length === 0
              ? "Chưa có từ trong sổ tay"
              : filterCollection
                ? "Bộ từ này chưa có từ nào phù hợp"
                : "Không tìm thấy từ phù hợp"}
          </h3>
          <p className="vocab-muted">
            {vocabularies.length === 0
              ? "Hãy tra từ mới rồi thêm vào sổ tay để bắt đầu ôn tập."
              : "Thử đổi bộ lọc hoặc từ khoá tìm kiếm."}
          </p>
        </div>
      ) : (
        <>
          <p className="vocab-muted" style={{ marginBottom: 12, fontSize: "0.85rem" }}>
            Hiển thị {filteredVocabs.length}/{vocabularies.length} từ
          </p>
          <div className="vocab-list">
            {filteredVocabs.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                userCollections={userCollections}
                onDelete={onDeleteWord}
                onEdit={(w) => setEditingWord(w)}
              />
            ))}
          </div>
        </>
      )}

      {editingWord && (
        <EditWordModal
          word={editingWord}
          userCollections={userCollections}
          onSave={handleSaveEdit}
          onClose={() => setEditingWord(null)}
        />
      )}
    </section>
  );
};

export default VocabularyList;



// import React, { useMemo, useState } from "react";

// // ──────────────────────────────────────────────────────────────
// // Modal chỉnh sửa từ vựng (chỉ từ user tự thêm)
// // ──────────────────────────────────────────────────────────────
// const EditWordModal = ({ word, userCollections, onSave, onClose }) => {
//   const [form, setForm] = useState({
//     word: word.word || "",
//     phonetic: word.phonetic || "",
//     type: word.type || "",
//     meaning: word.meaning || "",
//     example: word.example || "",
//     collectionId: word.collectionId || "",
//     status: word.status || "Đang học",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!form.word.trim() || !form.meaning.trim()) return;
//     onSave({ ...form, word: form.word.trim(), meaning: form.meaning.trim() });
//   };

//   return (
//     <div className="learning-modal-backdrop">
//       <div className="learning-modal" style={{ maxWidth: 560 }}>
//         <div className="learning-modal-head">
//           <h2 className="exam-title" style={{ fontSize: "1.15rem" }}>
//             Chỉnh sửa từ vựng
//           </h2>
//           <button className="learning-btn ghost" onClick={onClose}>
//             <i className="bi bi-x-lg" />
//           </button>
//         </div>

//         <form className="learning-form" onSubmit={handleSubmit}>
//           <div className="learning-form-grid">
//             <div className="learning-field">
//               <label>Từ (tiếng Anh) *</label>
//               <input
//                 className="learning-input"
//                 name="word"
//                 value={form.word}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="learning-field">
//               <label>Phiên âm</label>
//               <input
//                 className="learning-input"
//                 name="phonetic"
//                 value={form.phonetic}
//                 onChange={handleChange}
//                 placeholder="/fəˈnetɪk/"
//               />
//             </div>
//           </div>

//           <div className="learning-form-grid">
//             <div className="learning-field">
//               <label>Loại từ</label>
//               <select className="learning-input" name="type" value={form.type} onChange={handleChange}>
//                 <option value="">-- Chọn loại từ --</option>
//                 {["Noun", "Verb", "Adjective", "Adverb", "Phrase", "Other"].map((t) => (
//                   <option key={t} value={t}>{t}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="learning-field">
//               <label>Trạng thái</label>
//               <select className="learning-input" name="status" value={form.status} onChange={handleChange}>
//                 <option value="Đang học">Đang học</option>
//                 <option value="Đã thuộc">Đã thuộc</option>
//               </select>
//             </div>
//           </div>

//           <div className="learning-field">
//             <label>Nghĩa tiếng Việt *</label>
//             <input
//               className="learning-input"
//               name="meaning"
//               value={form.meaning}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="learning-field">
//             <label>Ví dụ</label>
//             <textarea
//               className="learning-input"
//               name="example"
//               rows={2}
//               value={form.example}
//               onChange={handleChange}
//               style={{ resize: "vertical" }}
//             />
//           </div>

//           {userCollections.length > 0 && (
//             <div className="learning-field">
//               <label>Bộ từ</label>
//               <select
//                 className="learning-input"
//                 name="collectionId"
//                 value={form.collectionId}
//                 onChange={handleChange}
//               >
//                 <option value="">Sổ tay chung (không phân bộ)</option>
//                 {userCollections.map((col) => (
//                   <option key={col.id} value={col.id}>{col.title}</option>
//                 ))}
//               </select>
//             </div>
//           )}

//           <div className="learning-actions" style={{ justifyContent: "flex-end" }}>
//             <button className="learning-btn" type="button" onClick={onClose}>
//               Hủy
//             </button>
//             <button className="learning-btn primary" type="submit">
//               Lưu thay đổi
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // ──────────────────────────────────────────────────────────────
// // WordCard - hiển thị 1 từ
// // ──────────────────────────────────────────────────────────────
// const WordCard = ({ word, userCollections, onDelete, onEdit }) => {
//   const isUserAdded = word.isUserAdded === true;

//   const playAudio = (e) => {
//     e.stopPropagation();
//     if (word.audioUrl) new Audio(word.audioUrl).play().catch(() => {});
//   };

//   return (
//     <article className={`learning-card vocab-card ${word.status === "Đã thuộc" ? "mastered" : ""}`}>
//       <div className="vocab-card-head">
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <h3 className="vocab-word">{word.word}</h3>
//             {/* Nút loa phát âm */}
//             {word.audioUrl && (
//               <button
//                 className="learning-btn ghost"
//                 style={{ padding: "2px 6px", color: "#0b57c5" }}
//                 onClick={playAudio}
//                 title="Nghe phát âm"
//               >
//                 <i className="bi bi-volume-up-fill" style={{ fontSize: "1rem" }} />
//               </button>
//             )}
//           </div>
//           <span className="vocab-phonetic">{word.phonetic}</span>
//         </div>

//         <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
//           <span className={`learning-badge ${word.status === "Đã thuộc" ? "green" : ""}`}>
//             {word.status}
//           </span>

//           {/* Chỉ từ user thêm mới có nút sửa/xóa */}
//           {isUserAdded && (
//             <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
//               <button
//                 className="learning-btn ghost"
//                 style={{ padding: "3px 7px", fontSize: "0.82rem" }}
//                 title="Chỉnh sửa từ"
//                 onClick={() => onEdit(word)}
//               >
//                 <i className="bi bi-pencil" style={{ color: "#0b57c5" }} />
//               </button>
//               <button
//                 className="learning-btn ghost"
//                 style={{ padding: "3px 7px", fontSize: "0.82rem" }}
//                 title="Xóa từ"
//                 onClick={() => {
//                   if (window.confirm(`Xóa từ "${word.word}" khỏi sổ tay?`)) onDelete(word.id);
//                 }}
//               >
//                 <i className="bi bi-trash" style={{ color: "#b42318" }} />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <p style={{ margin: "14px 0 4px", color: "#10233f", fontWeight: 750 }}>{word.meaning}</p>
//       {word.type && <span className="learning-badge amber">{word.type}</span>}
//       {word.example && <p className="vocab-example">"{word.example}"</p>}

//       <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, alignItems: "center" }}>
//         <p className="vocab-muted" style={{ fontSize: "0.78rem", margin: 0 }}>
//           Ôn gần nhất: {new Date(word.lastReviewed).toLocaleDateString("vi-VN")}
//         </p>
//         {!isUserAdded && (
//           <span className="learning-badge" style={{ fontSize: "0.72rem" }}>
//             <i className="bi bi-shield-check" style={{ marginRight: 3 }} />
//             Hệ thống
//           </span>
//         )}
//       </div>
//     </article>
//   );
// };

// // ──────────────────────────────────────────────────────────────
// // VocabularyList (main)
// // ──────────────────────────────────────────────────────────────
// const VocabularyList = ({ vocabularies, userCollections = [], onDeleteWord, onEditWord }) => {
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterCollection, setFilterCollection] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [editingWord, setEditingWord] = useState(null);

//   const learningCount = vocabularies.filter((w) => w.status === "Đang học").length;
//   const masteredCount = vocabularies.filter((w) => w.status === "Đã thuộc").length;

//   const filteredVocabs = useMemo(() => {
//     const keyword = searchTerm.trim().toLowerCase();
//     return vocabularies.filter((w) => {
//       const matchStatus = filterStatus === "all" || w.status === filterStatus;
//       const matchCol =
//         filterCollection === "all"
//           ? true
//           : filterCollection === "none"
//           ? !w.collectionId
//           : w.collectionId === filterCollection;
//       const matchSearch =
//         !keyword ||
//         w.word.toLowerCase().includes(keyword) ||
//         w.meaning.toLowerCase().includes(keyword);
//       return matchStatus && matchCol && matchSearch;
//     });
//   }, [vocabularies, filterStatus, filterCollection, searchTerm]);

//   const handleSaveEdit = (updatedData) => {
//     onEditWord(editingWord.id, updatedData);
//     setEditingWord(null);
//   };

//   return (
//     <section>
//       {/* Header */}
//       <div className="learning-section-heading" style={{ marginBottom: 14 }}>
//         <div>
//           <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
//             Sổ tay từ vựng cá nhân
//           </h2>
//           <p className="vocab-muted">
//             Bạn đang có {vocabularies.length} từ trong sổ tay.
//           </p>
//         </div>
//         <div className="learning-actions">
//           <span className="learning-badge">{learningCount} đang học</span>
//           <span className="learning-badge green">{masteredCount} đã thuộc</span>
//         </div>
//       </div>

//       {/* Bộ lọc */}
//       <div className="learning-card" style={{ marginBottom: 18, padding: "16px 18px" }}>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center" }}>
//           {/* Tìm kiếm */}
//           <div className="exam-search" style={{ minHeight: 40 }}>
//             <i className="bi bi-search" style={{ color: "#64748b" }} />
//             <input
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Tìm từ hoặc nghĩa..."
//               style={{ width: "100%", border: 0, background: "transparent", font: "inherit", outline: "none", color: "#10233f" }}
//             />
//           </div>

//           {/* Lọc bộ từ */}
//           <select
//             className="learning-input"
//             value={filterCollection}
//             onChange={(e) => setFilterCollection(e.target.value)}
//             style={{ minWidth: 180 }}
//           >
//             <option value="all">Tất cả bộ từ</option>
//             <option value="none">Không phân bộ</option>
//             {userCollections.map((col) => (
//               <option key={col.id} value={col.id}>{col.title}</option>
//             ))}
//           </select>

//           {/* Lọc trạng thái */}
//           <div className="learning-segmented">
//             {[
//               { value: "all", label: "Tất cả" },
//               { value: "Đang học", label: "Đang học" },
//               { value: "Đã thuộc", label: "Đã thuộc" },
//             ].map((opt) => (
//               <button
//                 key={opt.value}
//                 className={filterStatus === opt.value ? "active" : ""}
//                 onClick={() => setFilterStatus(opt.value)}
//               >
//                 {opt.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Danh sách */}
//       {filteredVocabs.length === 0 ? (
//         <div className="learning-card learning-empty">
//           <span className="vocab-icon study">
//             <i className="bi bi-journal-plus" />
//           </span>
//           <h3 className="exam-title" style={{ fontSize: "1.2rem", marginTop: 12 }}>
//             {vocabularies.length === 0
//               ? "Chưa có từ trong sổ tay"
//               : "Không tìm thấy từ phù hợp"}
//           </h3>
//           <p className="vocab-muted">
//             {vocabularies.length === 0
//               ? "Hãy tra từ mới rồi thêm vào sổ tay để bắt đầu ôn tập."
//               : "Thử đổi bộ lọc hoặc từ khoá tìm kiếm."}
//           </p>
//         </div>
//       ) : (
//         <>
//           <p className="vocab-muted" style={{ marginBottom: 12, fontSize: "0.85rem" }}>
//             Hiển thị {filteredVocabs.length}/{vocabularies.length} từ
//           </p>
//           <div className="vocab-list">
//             {filteredVocabs.map((word) => (
//               <WordCard
//                 key={word.id}
//                 word={word}
//                 userCollections={userCollections}
//                 onDelete={onDeleteWord}
//                 onEdit={(w) => setEditingWord(w)}
//               />
//             ))}
//           </div>
//         </>
//       )}

//       {/* Modal chỉnh sửa */}
//       {editingWord && (
//         <EditWordModal
//           word={editingWord}
//           userCollections={userCollections}
//           onSave={handleSaveEdit}
//           onClose={() => setEditingWord(null)}
//         />
//       )}
//     </section>
//   );
// };

// export default VocabularyList;