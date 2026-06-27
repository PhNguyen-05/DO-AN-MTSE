import React, { useEffect, useMemo, useState } from "react";
import FlashcardMode from "../components/Vocabulary/FlashcardMode";
import QuizMode from "../components/Vocabulary/QuizMode";
import StudySelection from "../components/Vocabulary/StudySelection";
import Toast from "../components/Vocabulary/Toast";
import VocabularyList from "../components/Vocabulary/VocabularyList";
import VocabularyTranslate from "../components/Vocabulary/VocabularyTranslate";
// import { initialVocabs, mockVocabularyCollections } from "../data/learningMockData";

// ──────────────────────────────────────────────────────────────
// Bộ từ admin tạo (không thể sửa/xóa/thêm vào)
// ──────────────────────────────────────────────────────────────
const ADMIN_COLLECTION_IDS = mockVocabularyCollections.map((c) => c.id);

const tabs = [
  { id: "list", label: "Sổ tay", icon: "bi-journal-bookmark" },
  { id: "translate", label: "Tra từ", icon: "bi-translate" },
  { id: "study", label: "Ôn tập", icon: "bi-lightning-charge" },
  { id: "mysets", label: "Bộ từ của tôi", icon: "bi-folder-plus" },
];

// ──────────────────────────────────────────────────────────────
// Modal tạo / chỉnh sửa bộ từ cá nhân
// ──────────────────────────────────────────────────────────────
const CollectionModal = ({ editingCollection, onSave, onClose }) => {
  const [name, setName] = useState(editingCollection?.title || "");
  const [description, setDescription] = useState(editingCollection?.description || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() });
  };

  return (
    <div className="learning-modal-backdrop">
      <div className="learning-modal">
        <div className="learning-modal-head">
          <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
            {editingCollection ? "Chỉnh sửa bộ từ" : "Tạo bộ từ mới"}
          </h2>
          <button className="learning-btn ghost" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <form className="learning-form" onSubmit={handleSubmit}>
          <div className="learning-field">
            <label>Tên bộ từ *</label>
            <input
              className="learning-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Từ vựng Business, TOEIC Part 5..."
              required
              autoFocus
            />
          </div>
          <div className="learning-field">
            <label>Mô tả (tuỳ chọn)</label>
            <textarea
              className="learning-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú về bộ từ này..."
              style={{ resize: "vertical" }}
            />
          </div>
          <div className="learning-actions" style={{ justifyContent: "flex-end" }}>
            <button className="learning-btn" type="button" onClick={onClose}>
              Hủy
            </button>
            <button className="learning-btn primary" type="submit">
              {editingCollection ? "Lưu thay đổi" : "Tạo bộ từ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Panel quản lý bộ từ cá nhân
// ──────────────────────────────────────────────────────────────
const MyCollectionsPanel = ({
  userCollections,
  vocabularies,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  const handleSave = (data) => {
    if (editingCollection) {
      onEditCollection(editingCollection.id, data);
    } else {
      onCreateCollection(data);
    }
    setShowModal(false);
    setEditingCollection(null);
  };

  const handleEdit = (col) => {
    setEditingCollection(col);
    setShowModal(true);
  };

  const handleDelete = (col) => {
    const wordCount = vocabularies.filter((w) => w.collectionId === col.id).length;
    const msg = wordCount > 0
      ? `Bộ từ "${col.title}" có ${wordCount} từ. Xóa bộ sẽ chuyển các từ sang "Không có bộ". Tiếp tục?`
      : `Xóa bộ từ "${col.title}"?`;
    if (window.confirm(msg)) onDeleteCollection(col.id);
  };

  return (
    <section>
      <div className="learning-section-heading" style={{ marginBottom: 18 }}>
        <div>
          <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
            Bộ từ cá nhân của tôi
          </h2>
          <p className="vocab-muted">
            Tạo và quản lý bộ từ để phân loại sổ tay theo chủ đề riêng.
          </p>
        </div>
        <button
          className="learning-btn primary"
          onClick={() => { setEditingCollection(null); setShowModal(true); }}
        >
          <i className="bi bi-plus-lg" />
          Tạo bộ từ mới
        </button>
      </div>

      {userCollections.length === 0 ? (
        <div className="learning-card learning-empty">
          <span className="learning-icon" style={{ marginBottom: 14 }}>
            <i className="bi bi-folder-plus" />
          </span>
          <h3 className="exam-title" style={{ fontSize: "1.2rem" }}>
            Chưa có bộ từ cá nhân
          </h3>
          <p className="vocab-muted">
            Tạo bộ từ để phân loại từ vựng theo chủ đề — Business, TOEIC Part 5, Travel...
          </p>
          <button
            className="learning-btn primary"
            style={{ marginTop: 16 }}
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg" />
            Tạo bộ từ đầu tiên
          </button>
        </div>
      ) : (
        <div className="learning-grid cols-3">
          {userCollections.map((col) => {
            const wordCount = vocabularies.filter((w) => w.collectionId === col.id).length;
            const studyingCount = vocabularies.filter(
              (w) => w.collectionId === col.id && w.status === "Đang học"
            ).length;
            return (
              <article key={col.id} className="learning-card" style={{ position: "relative" }}>
                <div className="learning-card-head" style={{ marginBottom: 14 }}>
                  <span className="learning-icon violet">
                    <i className="bi bi-folder2-open" />
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="learning-btn ghost"
                      style={{ padding: "4px 8px" }}
                      title="Chỉnh sửa bộ"
                      onClick={() => handleEdit(col)}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      className="learning-btn ghost"
                      style={{ padding: "4px 8px", color: "#b42318" }}
                      title="Xóa bộ"
                      onClick={() => handleDelete(col)}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>
                <h3 style={{ margin: "0 0 4px", color: "#10233f", fontWeight: 800, fontSize: "1.05rem" }}>
                  {col.title}
                </h3>
                {col.description && (
                  <p className="vocab-muted" style={{ fontSize: "0.85rem", marginBottom: 12 }}>
                    {col.description}
                  </p>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  <span className="learning-badge">{wordCount} từ</span>
                  <span className="learning-badge amber">{studyingCount} đang học</span>
                </div>
                <p className="vocab-muted" style={{ marginTop: 10, fontSize: "0.78rem" }}>
                  Tạo lúc: {new Date(col.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {/* Bộ từ từ Admin */}
      {mockVocabularyCollections.length > 0 && (
        <>
          <div className="learning-section-heading" style={{ marginTop: 28, marginBottom: 14 }}>
            <div>
              <h2 className="exam-title" style={{ fontSize: "1.1rem" }}>
                Bộ từ từ hệ thống
              </h2>
              <p className="vocab-muted">Các bộ từ do Admin cung cấp (chỉ đọc).</p>
            </div>
          </div>
          <div className="learning-grid cols-3">
            {mockVocabularyCollections.map((col) => (
              <article key={col.id} className="learning-card" style={{ borderTop: "3px solid #0b57c5" }}>
                <div className="learning-card-head" style={{ marginBottom: 14 }}>
                  <span className="learning-icon">
                    <i className="bi bi-shield-check" />
                  </span>
                  <span className="learning-badge">Hệ thống</span>
                </div>
                <h3 style={{ margin: "0 0 4px", color: "#10233f", fontWeight: 800, fontSize: "1.05rem" }}>
                  {col.title}
                </h3>
                {col.premium && (
                  <span className="learning-badge amber" style={{ marginTop: 6 }}>Premium</span>
                )}
              </article>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <CollectionModal
          editingCollection={editingCollection}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingCollection(null); }}
        />
      )}
    </section>
  );
};

// ──────────────────────────────────────────────────────────────
// VocabularyHub (main component)
// ──────────────────────────────────────────────────────────────
const VocabularyHub = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [vocabularies, setVocabularies] = useState([]);
  const [userCollections, setUserCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studyMode, setStudyMode] = useState(null);
  const [studyList, setStudyList] = useState([]);
  const [studyCollectionId, setStudyCollectionId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVocabularies(initialVocabs);
      // Khởi tạo bộ từ cá nhân từ localStorage (nếu có)
      const saved = localStorage.getItem("user_collections");
      if (saved) {
        try { setUserCollections(JSON.parse(saved)); } catch { /* ignore */ }
      }
      setLoading(false);
    }, 450);
    return () => window.clearTimeout(timer);
  }, []);

  // Lưu userCollections vào localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("user_collections", JSON.stringify(userCollections));
    }
  }, [userCollections, loading]);

  // ── Quản lý bộ từ cá nhân ──
  const handleCreateCollection = ({ name, description }) => {
    const newCol = {
      id: `user_col_${Date.now()}`,
      title: name,
      description,
      isUserCreated: true,
      createdAt: new Date().toISOString(),
    };
    setUserCollections((prev) => [newCol, ...prev]);
    showToast(`Đã tạo bộ từ "${name}".`, "success");
  };

  const handleEditCollection = (id, { name, description }) => {
    setUserCollections((prev) =>
      prev.map((col) => col.id === id ? { ...col, title: name, description } : col)
    );
    showToast("Đã cập nhật bộ từ.", "success");
  };

  const handleDeleteCollection = (id) => {
    // Chuyển từ vựng trong bộ đã xóa sang "uncategorized"
    setVocabularies((prev) =>
      prev.map((w) => w.collectionId === id ? { ...w, collectionId: null } : w)
    );
    setUserCollections((prev) => prev.filter((col) => col.id !== id));
    showToast("Đã xóa bộ từ.", "warning");
  };

  // ── Tra từ → lưu vào bộ ──
  const handleSaveToNotebook = (newWord, targetCollectionId) => {
    const newVocab = {
      ...newWord,
      id: Date.now(),
      collectionId: targetCollectionId || null,
      isUserAdded: true,
      status: "Đang học",
      lastReviewed: new Date().toISOString().slice(0, 10),
    };
    setVocabularies((prev) => [newVocab, ...prev]);
    const colName = userCollections.find((c) => c.id === targetCollectionId)?.title;
    showToast(
      `Đã lưu "${newWord.word}"${colName ? ` vào bộ "${colName}"` : " vào sổ tay"}.`,
      "success"
    );
    setActiveTab("list");
    setStudyMode(null);
  };

  // ── Xóa từ ──
  const handleDeleteWord = (id) => {
    setVocabularies((prev) => prev.filter((w) => w.id !== id));
    showToast("Đã xóa từ khỏi sổ tay.", "warning");
  };

  // ── Chỉnh sửa từ ──
  const handleEditWord = (id, updatedData) => {
    setVocabularies((prev) =>
      prev.map((w) => w.id === id ? { ...w, ...updatedData } : w)
    );
    showToast("Đã cập nhật từ vựng.", "success");
  };

  // ── Bắt đầu ôn tập ──
  const handleStartStudy = (mode, collectionId) => {
    const wordsToStudy = vocabularies.filter((word) => {
      const inCollection = !collectionId || collectionId === "all"
        ? true
        : word.collectionId === collectionId;
      return inCollection && word.status === "Đang học";
    });

    if (wordsToStudy.length === 0) {
      showToast("Không còn từ đang học trong bộ này. Hãy chọn bộ khác hoặc thêm từ mới.", "warning");
      return;
    }

    setStudyList([...wordsToStudy].sort(() => 0.5 - Math.random()));
    setStudyCollectionId(collectionId);
    setStudyMode(mode);
  };

  const handleUpdateVocabStatus = (id, newStatus) => {
    setVocabularies((prev) =>
      prev.map((word) => word.id === id ? { ...word, status: newStatus } : word)
    );
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Tất cả bộ (user + admin) để hiển thị trong StudySelection
  const allAvailableCollections = useMemo(() => [
    ...userCollections,
    ...mockVocabularyCollections.map((c) => ({ ...c, isUserCreated: false })),
  ], [userCollections]);

  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <span className="learning-spinner" />
          <p className="learning-subtitle" style={{ marginTop: 14 }}>
            Đang tải dữ liệu từ vựng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-page">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {!studyMode && (
        <header className="vocab-topbar">
          <div className="vocab-topbar-inner">
            <div>
              <h1 className="vocab-brand">
                Vocabulary<span style={{ color: "#0b57c5" }}>Hub</span>
              </h1>
              <p className="vocab-muted">Ôn tập, tra từ và quản lý sổ tay TOEIC cá nhân.</p>
            </div>
            <nav className="vocab-tabs" aria-label="Vocabulary navigation">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`vocab-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setStudyMode(null);
                  }}
                >
                  <i className={`bi ${tab.icon}`} /> {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </header>
      )}

      <main className="learning-shell">
        {/* ── Sổ tay ── */}
        {!studyMode && activeTab === "list" && (
          <VocabularyList
            vocabularies={vocabularies}
            userCollections={userCollections}
            onDeleteWord={handleDeleteWord}
            onEditWord={handleEditWord}
          />
        )}

        {/* ── Tra từ ── */}
        {!studyMode && activeTab === "translate" && (
          <VocabularyTranslate
            onSaveToNotebook={handleSaveToNotebook}
            userCollections={userCollections}
          />
        )}

        {/* ── Ôn tập ── */}
        {!studyMode && activeTab === "study" && (
          <StudySelection
            collections={allAvailableCollections}
            vocabularies={vocabularies}
            onStartStudy={handleStartStudy}
          />
        )}

        {/* ── Bộ từ của tôi ── */}
        {!studyMode && activeTab === "mysets" && (
          <MyCollectionsPanel
            userCollections={userCollections}
            vocabularies={vocabularies}
            onCreateCollection={handleCreateCollection}
            onEditCollection={handleEditCollection}
            onDeleteCollection={handleDeleteCollection}
          />
        )}

        {/* ── Flashcard ── */}
        {studyMode === "flashcard" && (
          <FlashcardMode
            studyList={studyList}
            onUpdateVocabStatus={handleUpdateVocabStatus}
            onExit={() => setStudyMode(null)}
          />
        )}

        {/* ── Quiz ── */}
        {studyMode === "quiz" && (
          <QuizMode
            studyList={studyList}
            allVocabularies={vocabularies}
            onUpdateVocabStatus={handleUpdateVocabStatus}
            onExit={() => setStudyMode(null)}
          />
        )}
      </main>
    </div>
  );
};

export default VocabularyHub;





// import React, { useEffect, useMemo, useState } from "react";
// import FlashcardMode from "../components/Vocabulary/FlashcardMode";
// import QuizMode from "../components/Vocabulary/QuizMode";
// import StudySelection from "../components/Vocabulary/StudySelection";
// import Toast from "../components/Vocabulary/Toast";
// import VocabularyList from "../components/Vocabulary/VocabularyList";
// import VocabularyTranslate from "../components/Vocabulary/VocabularyTranslate";
// import { initialVocabs, mockVocabularyCollections } from "../data/learningMockData";

// const tabs = [
//   { id: "list", label: "Sổ tay", icon: "bi-journal-bookmark" },
//   { id: "translate", label: "Tra từ", icon: "bi-translate" },
//   { id: "study", label: "Ôn tập", icon: "bi-lightning-charge" },
// ];

// const VocabularyHub = () => {
//   const [activeTab, setActiveTab] = useState("list");
//   const [vocabularies, setVocabularies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [studyMode, setStudyMode] = useState(null);
//   const [studyList, setStudyList] = useState([]);
//   const [selectedCollection, setSelectedCollection] = useState("all");
//   const [toast, setToast] = useState(null);

//   useEffect(() => {
//     const timer = window.setTimeout(() => {
//       setVocabularies(initialVocabs);
//       setLoading(false);
//     }, 450);

//     return () => window.clearTimeout(timer);
//   }, []);

//   const visibleVocabs = useMemo(() => {
//     if (selectedCollection === "all") return vocabularies;
//     return vocabularies.filter((item) => item.collectionId === selectedCollection);
//   }, [selectedCollection, vocabularies]);

//   const handleSaveToNotebook = (newWord) => {
//     const newVocab = {
//       ...newWord,
//       id: Date.now(),
//       collectionId: "core",
//       status: "Đang học",
//       lastReviewed: new Date().toISOString().slice(0, 10),
//     };
//     setVocabularies((prev) => [newVocab, ...prev]);
//     setToast({ message: "Đã lưu từ vào sổ tay cá nhân.", type: "success" });
//     setActiveTab("list");
//     setStudyMode(null);
//   };

//   const handleStartStudy = (mode, collectionId = selectedCollection) => {
//     const wordsToStudy = vocabularies.filter((word) => {
//       const inCollection = collectionId === "all" || word.collectionId === collectionId;
//       return inCollection && word.status === "Đang học";
//     });

//     if (wordsToStudy.length === 0) {
//       setToast({ message: "Không còn từ đang học trong bộ này. Hãy chọn bộ khác hoặc thêm từ mới.", type: "warning" });
//       return;
//     }

//     setStudyList([...wordsToStudy].sort(() => 0.5 - Math.random()));
//     setStudyMode(mode);
//   };

//   const handleUpdateVocabStatus = (id, newStatus) => {
//     setVocabularies((prev) => prev.map((word) => (word.id === id ? { ...word, status: newStatus } : word)));
//   };

//   if (loading) {
//     return (
//       <div className="learning-page">
//         <div className="learning-shell learning-empty">
//           <span className="learning-spinner" />
//           <p className="learning-subtitle" style={{ marginTop: 14 }}>
//             Đang tải dữ liệu từ vựng...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="learning-page">
//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

//       {!studyMode && (
//         <header className="vocab-topbar">
//           <div className="vocab-topbar-inner">
//             <div>
//               <h1 className="vocab-brand">
//                 Vocabulary<span style={{ color: "#0b57c5" }}>Hub</span>
//               </h1>
//               <p className="vocab-muted">Ôn tập, tra từ và quản lý sổ tay TOEIC cá nhân.</p>
//             </div>
//             <nav className="vocab-tabs" aria-label="Vocabulary navigation">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.id}
//                   className={`vocab-tab ${activeTab === tab.id ? "active" : ""}`}
//                   onClick={() => {
//                     setActiveTab(tab.id);
//                     setStudyMode(null);
//                   }}
//                 >
//                   <i className={`bi ${tab.icon}`} /> {tab.label}
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </header>
//       )}

//       <main className="learning-shell">
//         {!studyMode && (
//           <section className="learning-card" style={{ marginBottom: 18 }}>
//             <div className="learning-section-heading">
//               <div>
//                 <strong>Bộ từ vựng đang xem</strong>
//                 <p className="vocab-muted">Có thể chọn bộ miễn phí, đã mua lẻ hoặc thuộc Premium.</p>
//               </div>
//               <select className="learning-input" value={selectedCollection} onChange={(event) => setSelectedCollection(event.target.value)} style={{ maxWidth: 280 }}>
//                 <option value="all">Tất cả bộ từ</option>
//                 {mockVocabularyCollections.map((collection) => (
//                   <option key={collection.id} value={collection.id}>
//                     {collection.title} {collection.premium ? "(Premium)" : ""}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </section>
//         )}

//         {!studyMode && activeTab === "list" && <VocabularyList vocabularies={visibleVocabs} />}
//         {!studyMode && activeTab === "translate" && <VocabularyTranslate onSaveToNotebook={handleSaveToNotebook} />}
//         {!studyMode && activeTab === "study" && (
//           <StudySelection
//             collections={mockVocabularyCollections}
//             selectedCollection={selectedCollection}
//             onStartStudy={handleStartStudy}
//           />
//         )}

//         {studyMode === "flashcard" && (
//           <FlashcardMode studyList={studyList} onUpdateVocabStatus={handleUpdateVocabStatus} onExit={() => setStudyMode(null)} />
//         )}

//         {studyMode === "quiz" && (
//           <QuizMode
//             studyList={studyList}
//             allVocabularies={vocabularies}
//             onUpdateVocabStatus={handleUpdateVocabStatus}
//             onExit={() => setStudyMode(null)}
//           />
//         )}
//       </main>
//     </div>
//   );
// };

// export default VocabularyHub;
