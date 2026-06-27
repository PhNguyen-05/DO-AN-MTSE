import React, { useEffect, useMemo, useState } from "react";
import FlashcardMode from "../components/Vocabulary/FlashcardMode";
import QuizMode from "../components/Vocabulary/QuizMode";
import StudySelection from "../components/Vocabulary/StudySelection";
import Toast from "../components/Vocabulary/Toast";
import VocabularyList from "../components/Vocabulary/VocabularyList";
import VocabularyTranslate from "../components/Vocabulary/VocabularyTranslate";
import { vocabApi } from "../services/userApi";

// ── Constants ─────────────────────────────────────────────────
const USER_COLLECTIONS_KEY = "user_collections";

const tabs = [
  { id: "list",      label: "Sổ tay",       icon: "bi-journal-bookmark" },
  { id: "translate", label: "Tra từ",        icon: "bi-translate"        },
  { id: "study",     label: "Ôn tập",        icon: "bi-lightning-charge" },
  { id: "mysets",    label: "Bộ từ của tôi", icon: "bi-folder-plus"      },
];

// ── Helpers ───────────────────────────────────────────────────
const loadUserCollections = () => {
  try {
    const raw = localStorage.getItem(USER_COLLECTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveUserCollections = (cols) => {
  localStorage.setItem(USER_COLLECTIONS_KEY, JSON.stringify(cols));
};

const normalizeNotebookWord = (w) => ({
  id:           w._id,
  word:         w.word,
  phonetic:     w.phonetic   || "",
  audioUrl:     w.audioUrl   || "",
  type:         w.type       || "",
  meaning:      w.meaning,
  example:      w.example    || "",   // tiếng Việt (fallback)
  exampleEn:    w.exampleEn  || w.example || "",  // tiếng Anh ưu tiên
  status:       w.status     || "Đang học",
  lastReviewed: w.lastReviewed || w.updatedAt || new Date().toISOString(),
  collectionId: null,
  isUserAdded:  true,
});

const normalizeSetWord = (w, setId) => ({
  id:           w.id || w._id,
  word:         w.word,
  phonetic:     w.phonetic   || "",
  audioUrl:     w.audioUrl   || "",
  type:         w.type       || "",
  meaning:      w.meaning,
  example:      w.example    || "",   // tiếng Việt
  exampleEn:    w.exampleEn  || w.example || "",  // tiếng Anh
  status:       w.status     || "Đang học",
  lastReviewed: w.lastReviewed || new Date().toISOString(),
  collectionId: setId,
  isUserAdded:  false,
});

// ── CollectionModal ───────────────────────────────────────────
const CollectionModal = ({ editingCollection, onSave, onClose }) => {
  const [name, setName]        = useState(editingCollection?.title       || "");
  const [description, setDesc] = useState(editingCollection?.description || "");

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
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ghi chú về bộ từ này..."
              style={{ resize: "vertical" }}
            />
          </div>
          <div className="learning-actions" style={{ justifyContent: "flex-end" }}>
            <button className="learning-btn" type="button" onClick={onClose}>Hủy</button>
            <button className="learning-btn primary" type="submit">
              {editingCollection ? "Lưu thay đổi" : "Tạo bộ từ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── MyCollectionsPanel ────────────────────────────────────────
// Khi click vào 1 card → hiện từ vựng của bộ đó ngay bên dưới
const MyCollectionsPanel = ({
  userCollections,
  systemCollections,
  allVocabularies,
  userCollectionsOnly,     // chỉ từ user tự thêm (để đếm / hiển thị trong bộ cá nhân)
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
  onDeleteWord,
  onEditWord,
}) => {
  const [showModal, setShowModal]   = useState(false);
  const [editingCol, setEditingCol] = useState(null);
  // id của bộ đang mở xem từ vựng (null = chưa mở)
  const [openedColId, setOpenedColId] = useState(null);

  const handleSave = (data) => {
    if (editingCol) {
      onEditCollection(editingCol.id, data);
    } else {
      onCreateCollection(data);
    }
    setShowModal(false);
    setEditingCol(null);
  };

  const handleEdit = (col, e) => {
    e.stopPropagation();
    setEditingCol(col);
    setShowModal(true);
  };

  const handleDelete = (col, e) => {
    e.stopPropagation();
    const wordCount = allVocabularies.filter((w) => w.collectionId === col.id).length;
    const msg = wordCount > 0
      ? `Bộ từ "${col.title}" có ${wordCount} từ. Xóa bộ sẽ chuyển các từ sang "Không có bộ". Tiếp tục?`
      : `Xóa bộ từ "${col.title}"?`;
    if (window.confirm(msg)) {
      if (openedColId === col.id) setOpenedColId(null);
      onDeleteCollection(col.id);
    }
  };

  const toggleOpen = (colId) => {
    setOpenedColId((prev) => (prev === colId ? null : colId));
  };

  // Từ vựng của bộ đang mở
  const openedWords = useMemo(
    () => openedColId ? allVocabularies.filter((w) => w.collectionId === openedColId) : [],
    [openedColId, allVocabularies]
  );

  return (
    <section>
      {/* ── Bộ từ cá nhân ── */}
      <div className="learning-section-heading" style={{ marginBottom: 18 }}>
        <div>
          <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>Bộ từ cá nhân của tôi</h2>
          <p className="vocab-muted">Bấm vào bộ từ để xem danh sách từ vựng bên trong.</p>
        </div>
        <button
          className="learning-btn primary"
          onClick={() => { setEditingCol(null); setShowModal(true); }}
        >
          <i className="bi bi-plus-lg" /> Tạo bộ từ mới
        </button>
      </div>

      {userCollections.length === 0 ? (
        <div className="learning-card learning-empty" style={{ marginBottom: 24 }}>
          <span className="learning-icon" style={{ marginBottom: 14 }}>
            <i className="bi bi-folder-plus" />
          </span>
          <h3 className="exam-title" style={{ fontSize: "1.2rem" }}>Chưa có bộ từ cá nhân</h3>
          <p className="vocab-muted">
            Tạo bộ từ để phân loại từ vựng theo chủ đề — Business, TOEIC Part 5, Travel...
          </p>
          <button className="learning-btn primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg" /> Tạo bộ từ đầu tiên
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, marginBottom: 8 }}>
          {userCollections.map((col) => {
            const wordCount     = allVocabularies.filter((w) => w.collectionId === col.id).length;
            const studyingCount = allVocabularies.filter((w) => w.collectionId === col.id && w.status === "Đang học").length;
            const isOpen        = openedColId === col.id;

            return (
              <div key={col.id}>
                {/* Card bộ từ — click để toggle từ vựng */}
                <article
                  className="learning-card"
                  style={{
                    cursor: "pointer",
                    borderLeft: isOpen ? "4px solid #0b57c5" : "4px solid transparent",
                    transition: "border-color 0.2s",
                    marginBottom: 0,
                  }}
                  onClick={() => toggleOpen(col.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    {/* Icon + tên */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                      <span
                        className="learning-icon violet"
                        style={{ flexShrink: 0, background: isOpen ? "#0b57c5" : undefined, color: isOpen ? "#fff" : undefined }}
                      >
                        <i className={`bi ${isOpen ? "bi-folder2-open" : "bi-folder2"}`} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ color: "#10233f", fontSize: "1.05rem" }}>{col.title}</strong>
                        {col.description && (
                          <p className="vocab-muted" style={{ fontSize: "0.85rem", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {col.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats + actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span className="learning-badge">{wordCount} từ</span>
                      <span className="learning-badge amber">{studyingCount} đang học</span>
                      <button
                        className="learning-btn ghost"
                        style={{ padding: "4px 8px" }}
                        title="Chỉnh sửa"
                        onClick={(e) => handleEdit(col, e)}
                      >
                        <i className="bi bi-pencil" />
                      </button>
                      <button
                        className="learning-btn ghost"
                        style={{ padding: "4px 8px", color: "#b42318" }}
                        title="Xóa bộ"
                        onClick={(e) => handleDelete(col, e)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                      <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ color: "#64748b" }} />
                    </div>
                  </div>
                </article>

                {/* Danh sách từ vựng inline — mở khi isOpen */}
                {isOpen && (
                  <div
                    style={{
                      border: "1px solid #b7cdf9",
                      borderTop: "none",
                      borderRadius: "0 0 8px 8px",
                      background: "#f8fbff",
                      padding: "16px",
                    }}
                  >
                    {openedWords.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "24px 0", color: "#64748b" }}>
                        <i className="bi bi-journal-plus" style={{ fontSize: "1.6rem", display: "block", marginBottom: 8 }} />
                        Bộ từ này chưa có từ nào. Hãy tra từ và lưu vào bộ này.
                      </div>
                    ) : (
                      <>
                        <p className="vocab-muted" style={{ marginBottom: 12, fontSize: "0.85rem" }}>
                          {openedWords.length} từ trong bộ này
                        </p>
                        <div className="vocab-list">
                          {openedWords.map((word) => (
                            <WordCardCompact
                              key={word.id}
                              word={word}
                              onDelete={onDeleteWord}
                              onEdit={onEditWord}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bộ từ hệ thống ── */}
      {systemCollections.length > 0 && (
        <>
          <div className="learning-section-heading" style={{ marginTop: 32, marginBottom: 14 }}>
            <div>
              <h2 className="exam-title" style={{ fontSize: "1.1rem" }}>Bộ từ từ hệ thống</h2>
              <p className="vocab-muted">Bấm vào bộ từ để xem danh sách từ vựng bên trong.</p>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {systemCollections.map((col) => {
              const isOpen      = openedColId === col.id;
              const wordsInSet  = allVocabularies.filter((w) => w.collectionId === col.id);

              return (
                <div key={col.id}>
                  <article
                    className="learning-card"
                    style={{
                      cursor: col.owned ? "pointer" : "default",
                      borderLeft: isOpen ? "4px solid #0b57c5" : "4px solid #0b57c5",
                      opacity: col.owned ? 1 : 0.65,
                      marginBottom: 0,
                    }}
                    onClick={() => col.owned && toggleOpen(col.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                        <span
                          className="learning-icon"
                          style={{ flexShrink: 0, background: isOpen ? "#0b57c5" : "#e9f0ff", color: isOpen ? "#fff" : "#0b57c5" }}
                        >
                          <i className={`bi ${isOpen ? "bi-shield-fill-check" : "bi-shield-check"}`} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: "#10233f", fontSize: "1.05rem" }}>{col.title}</strong>
                          {col.description && (
                            <p className="vocab-muted" style={{ fontSize: "0.85rem", margin: "2px 0 0" }}>{col.description}</p>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span className="learning-badge">{col.total || 0} từ</span>
                        {col.premium && <span className="learning-badge amber">Premium</span>}
                        {!col.owned && <span className="learning-badge red"><i className="bi bi-lock" /> Khoá</span>}
                        {col.owned && (
                          <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ color: "#64748b" }} />
                        )}
                      </div>
                    </div>
                  </article>

                  {isOpen && col.owned && (
                    <div
                      style={{
                        border: "1px solid #b7cdf9",
                        borderTop: "none",
                        borderRadius: "0 0 8px 8px",
                        background: "#f8fbff",
                        padding: "16px",
                      }}
                    >
                      {wordsInSet.length === 0 ? (
                        <p className="vocab-muted" style={{ textAlign: "center", padding: "16px 0" }}>
                          Chưa có dữ liệu từ vựng cho bộ này.
                        </p>
                      ) : (
                        <>
                          <p className="vocab-muted" style={{ marginBottom: 12, fontSize: "0.85rem" }}>
                            {wordsInSet.length} từ trong bộ này
                          </p>
                          <div className="vocab-list">
                            {wordsInSet.map((word) => (
                              <WordCardCompact key={word.id} word={word} readOnly />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {showModal && (
        <CollectionModal
          editingCollection={editingCol}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingCol(null); }}
        />
      )}
    </section>
  );
};

// ── WordCardCompact — dùng trong MyCollectionsPanel ───────────
// Gọn hơn WordCard đầy đủ; example hiện tiếng Anh
const WordCardCompact = ({ word, onDelete, onEdit, readOnly = false }) => {
  const exampleText = word.exampleEn || word.example || "";

  const playAudio = (e) => {
    e.stopPropagation();
    if (word.audioUrl) new Audio(word.audioUrl).play().catch(() => {});
  };

  return (
    <article
      className={`learning-card vocab-card ${word.status === "Đã thuộc" ? "mastered" : ""}`}
      style={{ padding: "14px 16px" }}
    >
      <div className="vocab-card-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 className="vocab-word" style={{ fontSize: "1.1rem" }}>{word.word}</h3>
            {word.audioUrl && (
              <button className="learning-btn ghost" style={{ padding: "2px 6px", color: "#0b57c5" }} onClick={playAudio}>
                <i className="bi bi-volume-up-fill" style={{ fontSize: "0.95rem" }} />
              </button>
            )}
          </div>
          {word.phonetic && <span className="vocab-phonetic">{word.phonetic}</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span className={`learning-badge ${word.status === "Đã thuộc" ? "green" : ""}`} style={{ fontSize: "0.75rem" }}>
            {word.status}
          </span>
          {!readOnly && word.isUserAdded && (
            <>
              <button className="learning-btn ghost" style={{ padding: "3px 7px" }} onClick={() => onEdit && onEdit(word)}>
                <i className="bi bi-pencil" style={{ color: "#0b57c5", fontSize: "0.85rem" }} />
              </button>
              <button
                className="learning-btn ghost"
                style={{ padding: "3px 7px" }}
                onClick={() => {
                  if (window.confirm(`Xóa từ "${word.word}"?`)) onDelete && onDelete(word.id);
                }}
              >
                <i className="bi bi-trash" style={{ color: "#b42318", fontSize: "0.85rem" }} />
              </button>
            </>
          )}
        </div>
      </div>

      <p style={{ margin: "8px 0 4px", color: "#10233f", fontWeight: 700, fontSize: "0.95rem" }}>
        {word.meaning}
      </p>
      {word.type && (
        <span className="learning-badge amber" style={{ fontSize: "0.72rem" }}>{word.type}</span>
      )}
      {exampleText && (
        <p className="vocab-example" style={{ fontSize: "0.88rem", marginTop: 8 }}>
          "{exampleText}"
        </p>
      )}
    </article>
  );
};

// ── VocabularyHub (main) ──────────────────────────────────────
const VocabularyHub = () => {
  const [activeTab, setActiveTab]             = useState("list");
  // activeListCollection: id bộ từ muốn filter sẵn khi chuyển sang tab "list"
  const [activeListCollection, setActiveListCol] = useState(null);
  const [vocabularies, setVocabularies]       = useState([]);
  const [systemCollections, setSystemCols]    = useState([]);
  const [systemVocabs, setSystemVocabs]       = useState([]);
  const [userCollections, setUserCollections] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [loadError, setLoadError]             = useState(null);
  const [studyMode, setStudyMode]             = useState(null);
  const [studyList, setStudyList]             = useState([]);
  const [toast, setToast]                     = useState(null);

  // ── Fetch data ──────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const [notebookData, setsData] = await Promise.all([
          vocabApi.getNotebook().catch(() => []),
          vocabApi.getSets().catch(() => []),
        ]);

        setVocabularies((notebookData || []).map(normalizeNotebookWord));

        const accessibleSets = (setsData || []).filter((s) => s.owned);
        setSystemCols(
          (setsData || []).map((s) => ({
            id:          s.id,
            title:       s.title,
            description: s.description || "",
            total:       s.total || 0,
            premium:     s.premium || false,
            owned:       s.owned,
          }))
        );

        const allSetWords = accessibleSets.flatMap((set) =>
          (set.words || []).map((w) => normalizeSetWord(w, set.id))
        );
        setSystemVocabs(allSetWords);
      } catch (err) {
        setLoadError(err.message || "Không thể tải dữ liệu từ vựng.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    setUserCollections(loadUserCollections());
  }, []);

  useEffect(() => {
    if (!loading) saveUserCollections(userCollections);
  }, [userCollections, loading]);

  // ── Derived state ────────────────────────────────────────────
  const allVocabularies = useMemo(
    () => [...vocabularies, ...systemVocabs],
    [vocabularies, systemVocabs]
  );

  // Tất cả bộ từ để hiện trong dropdown của VocabularyList
  const allCollectionsForList = useMemo(() => [
    ...userCollections.map((c) => ({ ...c, isUserCreated: true })),
    ...systemCollections.filter((c) => c.owned).map((c) => ({ ...c, isUserCreated: false })),
  ], [userCollections, systemCollections]);

  const allCollectionsForStudy = useMemo(() => [
    ...userCollections.map((c) => ({ ...c, isUserCreated: true })),
    ...systemCollections.filter((c) => c.owned).map((c) => ({ ...c, isUserCreated: false })),
  ], [userCollections, systemCollections]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleCreateCollection = ({ name, description }) => {
    const newCol = {
      id:            `user_col_${Date.now()}`,
      title:         name,
      description,
      isUserCreated: true,
      createdAt:     new Date().toISOString(),
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
    setVocabularies((prev) =>
      prev.map((w) => w.collectionId === id ? { ...w, collectionId: null } : w)
    );
    setUserCollections((prev) => prev.filter((col) => col.id !== id));
    showToast("Đã xóa bộ từ.", "warning");
  };

  const handleSaveToNotebook = (newWord, targetCollectionId) => {
    const newVocab = {
      ...newWord,
      id:           `local_${Date.now()}`,
      collectionId: targetCollectionId || null,
      isUserAdded:  true,
      status:       "Đang học",
      lastReviewed: new Date().toISOString(),
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

  const handleDeleteWord = async (id) => {
    if (!String(id).startsWith("local_")) {
      try { await vocabApi.deleteWord(id); } catch { /* ignore */ }
    }
    setVocabularies((prev) => prev.filter((w) => w.id !== id));
    showToast("Đã xóa từ khỏi sổ tay.", "warning");
  };

  const handleEditWord = (id, updatedData) => {
    setVocabularies((prev) =>
      prev.map((w) => w.id === id ? { ...w, ...updatedData } : w)
    );
    showToast("Đã cập nhật từ vựng.", "success");
  };

  const handleStartStudy = (mode, collectionId) => {
    const wordsToStudy = allVocabularies.filter((word) => {
      const inCollection =
        !collectionId || collectionId === "all" ? true : word.collectionId === collectionId;
      return inCollection && word.status === "Đang học";
    });

    if (wordsToStudy.length === 0) {
      showToast("Không còn từ đang học trong bộ này.", "warning");
      return;
    }
    setStudyList([...wordsToStudy].sort(() => 0.5 - Math.random()));
    setStudyMode(mode);
  };

  const handleUpdateVocabStatus = async (id, newStatus) => {
    setVocabularies((prev) => prev.map((w) => w.id === id ? { ...w, status: newStatus } : w));
    setSystemVocabs((prev) => prev.map((w) => w.id === id ? { ...w, status: newStatus } : w));
    if (!String(id).startsWith("local_")) {
      try { await vocabApi.updateStatus(id, newStatus); } catch { /* ignore */ }
    }
  };

  const showToast = (message, type = "success") => setToast({ message, type });

  const switchToListWithCollection = (colId) => {
    setActiveListCol(colId);
    setActiveTab("list");
  };

  // ── Loading / Error ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <span className="learning-spinner" />
          <p className="learning-subtitle" style={{ marginTop: 14 }}>Đang tải dữ liệu từ vựng...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <span className="learning-icon red" style={{ marginBottom: 14 }}>
            <i className="bi bi-exclamation-circle" />
          </span>
          <h2 className="exam-title" style={{ fontSize: "1.3rem" }}>Không thể tải dữ liệu</h2>
          <p className="learning-subtitle">{loadError}</p>
          <button className="learning-btn primary" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>
            <i className="bi bi-arrow-clockwise" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────
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
                    if (tab.id !== "list") setActiveListCol(null); // reset filter khi rời tab list
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
            vocabularies={allVocabularies}
            userCollections={userCollections}
            allCollections={allCollectionsForList}
            activeCollectionId={activeListCollection}
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
            collections={allCollectionsForStudy}
            vocabularies={allVocabularies}
            onStartStudy={handleStartStudy}
          />
        )}

        {/* ── Bộ từ của tôi ── */}
        {!studyMode && activeTab === "mysets" && (
          <MyCollectionsPanel
            userCollections={userCollections}
            systemCollections={systemCollections}
            allVocabularies={allVocabularies}
            userCollectionsOnly={vocabularies}
            onCreateCollection={handleCreateCollection}
            onEditCollection={handleEditCollection}
            onDeleteCollection={handleDeleteCollection}
            onDeleteWord={handleDeleteWord}
            onEditWord={(id, data) => handleEditWord(id, data)}
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
            allVocabularies={allVocabularies}
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
// import { vocabApi } from "../services/userApi";

// // ── Constants ─────────────────────────────────────────────────
// const USER_COLLECTIONS_KEY = "user_collections";

// const tabs = [
//   { id: "list",      label: "Sổ tay",      icon: "bi-journal-bookmark"  },
//   { id: "translate", label: "Tra từ",       icon: "bi-translate"         },
//   { id: "study",     label: "Ôn tập",       icon: "bi-lightning-charge"  },
//   { id: "mysets",    label: "Bộ từ của tôi", icon: "bi-folder-plus"      },
// ];

// // ── Helpers ───────────────────────────────────────────────────
// const loadUserCollections = () => {
//   try {
//     const raw = localStorage.getItem(USER_COLLECTIONS_KEY);
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// };

// const saveUserCollections = (cols) => {
//   localStorage.setItem(USER_COLLECTIONS_KEY, JSON.stringify(cols));
// };

// // Chuẩn hoá word từ API notebook (UserVocabulary schema)
// const normalizeNotebookWord = (w) => ({
//   id:           w._id,
//   word:         w.word,
//   phonetic:     w.phonetic  || "",
//   audioUrl:     w.audioUrl  || "",
//   type:         w.type      || "",
//   meaning:      w.meaning,
//   example:      w.example   || "",
//   status:       w.status    || "Đang học",
//   lastReviewed: w.lastReviewed || w.updatedAt || new Date().toISOString(),
//   collectionId: null,        // notebook cá nhân không thuộc bộ từ hệ thống
//   isUserAdded:  true,
// });

// // Chuẩn hoá word từ VocabularySet (hệ thống)
// const normalizeSetWord = (w, setId) => ({
//   id:           w.id || w._id,
//   word:         w.word,
//   phonetic:     w.phonetic  || "",
//   audioUrl:     w.audioUrl  || "",
//   type:         w.type      || "",
//   meaning:      w.meaning,
//   example:      w.example   || "",
//   status:       w.status    || "Đang học",
//   lastReviewed: w.lastReviewed || new Date().toISOString(),
//   collectionId: setId,
//   isUserAdded:  false,       // từ do hệ thống cung cấp
// });

// // ── CollectionModal ───────────────────────────────────────────
// const CollectionModal = ({ editingCollection, onSave, onClose }) => {
//   const [name, setName]         = useState(editingCollection?.title       || "");
//   const [description, setDesc]  = useState(editingCollection?.description || "");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!name.trim()) return;
//     onSave({ name: name.trim(), description: description.trim() });
//   };

//   return (
//     <div className="learning-modal-backdrop">
//       <div className="learning-modal">
//         <div className="learning-modal-head">
//           <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
//             {editingCollection ? "Chỉnh sửa bộ từ" : "Tạo bộ từ mới"}
//           </h2>
//           <button className="learning-btn ghost" onClick={onClose}>
//             <i className="bi bi-x-lg" />
//           </button>
//         </div>
//         <form className="learning-form" onSubmit={handleSubmit}>
//           <div className="learning-field">
//             <label>Tên bộ từ *</label>
//             <input
//               className="learning-input"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="VD: Từ vựng Business, TOEIC Part 5..."
//               required
//               autoFocus
//             />
//           </div>
//           <div className="learning-field">
//             <label>Mô tả (tuỳ chọn)</label>
//             <textarea
//               className="learning-input"
//               rows={3}
//               value={description}
//               onChange={(e) => setDesc(e.target.value)}
//               placeholder="Ghi chú về bộ từ này..."
//               style={{ resize: "vertical" }}
//             />
//           </div>
//           <div className="learning-actions" style={{ justifyContent: "flex-end" }}>
//             <button className="learning-btn" type="button" onClick={onClose}>Hủy</button>
//             <button className="learning-btn primary" type="submit">
//               {editingCollection ? "Lưu thay đổi" : "Tạo bộ từ"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // ── MyCollectionsPanel ────────────────────────────────────────
// const MyCollectionsPanel = ({
//   userCollections,
//   systemCollections,
//   vocabularies,
//   onCreateCollection,
//   onEditCollection,
//   onDeleteCollection,
// }) => {
//   const [showModal, setShowModal]             = useState(false);
//   const [editingCollection, setEditing]       = useState(null);

//   const handleSave = (data) => {
//     if (editingCollection) {
//       onEditCollection(editingCollection.id, data);
//     } else {
//       onCreateCollection(data);
//     }
//     setShowModal(false);
//     setEditing(null);
//   };

//   const handleEdit = (col) => { setEditing(col); setShowModal(true); };

//   const handleDelete = (col) => {
//     const wordCount = vocabularies.filter((w) => w.collectionId === col.id).length;
//     const msg = wordCount > 0
//       ? `Bộ từ "${col.title}" có ${wordCount} từ. Xóa bộ sẽ chuyển các từ sang "Không có bộ". Tiếp tục?`
//       : `Xóa bộ từ "${col.title}"?`;
//     if (window.confirm(msg)) onDeleteCollection(col.id);
//   };

//   return (
//     <section>
//       {/* Bộ từ cá nhân */}
//       <div className="learning-section-heading" style={{ marginBottom: 18 }}>
//         <div>
//           <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>Bộ từ cá nhân của tôi</h2>
//           <p className="vocab-muted">Tạo và quản lý bộ từ để phân loại sổ tay theo chủ đề riêng.</p>
//         </div>
//         <button
//           className="learning-btn primary"
//           onClick={() => { setEditing(null); setShowModal(true); }}
//         >
//           <i className="bi bi-plus-lg" /> Tạo bộ từ mới
//         </button>
//       </div>

//       {userCollections.length === 0 ? (
//         <div className="learning-card learning-empty">
//           <span className="learning-icon" style={{ marginBottom: 14 }}>
//             <i className="bi bi-folder-plus" />
//           </span>
//           <h3 className="exam-title" style={{ fontSize: "1.2rem" }}>Chưa có bộ từ cá nhân</h3>
//           <p className="vocab-muted">
//             Tạo bộ từ để phân loại từ vựng theo chủ đề — Business, TOEIC Part 5, Travel...
//           </p>
//           <button
//             className="learning-btn primary"
//             style={{ marginTop: 16 }}
//             onClick={() => setShowModal(true)}
//           >
//             <i className="bi bi-plus-lg" /> Tạo bộ từ đầu tiên
//           </button>
//         </div>
//       ) : (
//         <div className="learning-grid cols-3">
//           {userCollections.map((col) => {
//             const wordCount     = vocabularies.filter((w) => w.collectionId === col.id).length;
//             const studyingCount = vocabularies.filter(
//               (w) => w.collectionId === col.id && w.status === "Đang học"
//             ).length;
//             return (
//               <article key={col.id} className="learning-card">
//                 <div className="learning-card-head" style={{ marginBottom: 14 }}>
//                   <span className="learning-icon violet"><i className="bi bi-folder2-open" /></span>
//                   <div style={{ display: "flex", gap: 6 }}>
//                     <button className="learning-btn ghost" style={{ padding: "4px 8px" }} onClick={() => handleEdit(col)}>
//                       <i className="bi bi-pencil" />
//                     </button>
//                     <button className="learning-btn ghost" style={{ padding: "4px 8px", color: "#b42318" }} onClick={() => handleDelete(col)}>
//                       <i className="bi bi-trash" />
//                     </button>
//                   </div>
//                 </div>
//                 <h3 style={{ margin: "0 0 4px", color: "#10233f", fontWeight: 800, fontSize: "1.05rem" }}>
//                   {col.title}
//                 </h3>
//                 {col.description && (
//                   <p className="vocab-muted" style={{ fontSize: "0.85rem", marginBottom: 12 }}>
//                     {col.description}
//                   </p>
//                 )}
//                 <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
//                   <span className="learning-badge">{wordCount} từ</span>
//                   <span className="learning-badge amber">{studyingCount} đang học</span>
//                 </div>
//                 <p className="vocab-muted" style={{ marginTop: 10, fontSize: "0.78rem" }}>
//                   Tạo lúc: {new Date(col.createdAt).toLocaleDateString("vi-VN")}
//                 </p>
//               </article>
//             );
//           })}
//         </div>
//       )}

//       {/* Bộ từ hệ thống (từ API) */}
//       {systemCollections.length > 0 && (
//         <>
//           <div className="learning-section-heading" style={{ marginTop: 28, marginBottom: 14 }}>
//             <div>
//               <h2 className="exam-title" style={{ fontSize: "1.1rem" }}>Bộ từ từ hệ thống</h2>
//               <p className="vocab-muted">Các bộ từ do Admin cung cấp (chỉ đọc).</p>
//             </div>
//           </div>
//           <div className="learning-grid cols-3">
//             {systemCollections.map((col) => (
//               <article key={col.id} className="learning-card" style={{ borderTop: "3px solid #0b57c5" }}>
//                 <div className="learning-card-head" style={{ marginBottom: 14 }}>
//                   <span className="learning-icon"><i className="bi bi-shield-check" /></span>
//                   <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
//                     <span className="learning-badge">Hệ thống</span>
//                     {col.premium && <span className="learning-badge amber">Premium</span>}
//                   </div>
//                 </div>
//                 <h3 style={{ margin: "0 0 4px", color: "#10233f", fontWeight: 800, fontSize: "1.05rem" }}>
//                   {col.title}
//                 </h3>
//                 {col.description && (
//                   <p className="vocab-muted" style={{ fontSize: "0.85rem" }}>{col.description}</p>
//                 )}
//                 <div style={{ marginTop: 10 }}>
//                   <span className="learning-badge">{col.total || 0} từ</span>
//                 </div>
//               </article>
//             ))}
//           </div>
//         </>
//       )}

//       {showModal && (
//         <CollectionModal
//           editingCollection={editingCollection}
//           onSave={handleSave}
//           onClose={() => { setShowModal(false); setEditing(null); }}
//         />
//       )}
//     </section>
//   );
// };

// // ── VocabularyHub (main) ──────────────────────────────────────
// const VocabularyHub = () => {
//   const [activeTab, setActiveTab]             = useState("list");
//   const [vocabularies, setVocabularies]       = useState([]);   // từ vựng sổ tay cá nhân (notebook)
//   const [systemCollections, setSystemCols]    = useState([]);   // bộ từ hệ thống từ API
//   const [systemVocabs, setSystemVocabs]       = useState([]);   // từ vựng trong các bộ hệ thống
//   const [userCollections, setUserCollections] = useState([]);   // bộ từ user tự tạo (localStorage)
//   const [loading, setLoading]                 = useState(true);
//   const [loadError, setLoadError]             = useState(null);
//   const [studyMode, setStudyMode]             = useState(null);
//   const [studyList, setStudyList]             = useState([]);
//   const [studyCollectionId, setStudyCollId]   = useState(null);
//   const [toast, setToast]                     = useState(null);

//   // ── Fetch data ──────────────────────────────────────────────
//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         setLoading(true);
//         setLoadError(null);

//         const [notebookData, setsData] = await Promise.all([
//           vocabApi.getNotebook().catch(() => []),
//           vocabApi.getSets().catch(() => []),
//         ]);

//         // Sổ tay cá nhân
//         setVocabularies((notebookData || []).map(normalizeNotebookWord));

//         // Bộ từ hệ thống
//         const accessibleSets = (setsData || []).filter((s) => s.owned);
//         setSystemCols(
//           (setsData || []).map((s) => ({
//             id:          s.id,
//             title:       s.title,
//             description: s.description || "",
//             total:       s.total || 0,
//             premium:     s.premium || false,
//             owned:       s.owned,
//           }))
//         );

//         // Gộp từ của tất cả bộ hệ thống đã truy cập
//         const allSetWords = accessibleSets.flatMap((set) =>
//           (set.words || []).map((w) => normalizeSetWord(w, set.id))
//         );
//         setSystemVocabs(allSetWords);
//       } catch (err) {
//         setLoadError(err.message || "Không thể tải dữ liệu từ vựng.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAll();

//     // Load bộ từ cá nhân từ localStorage
//     setUserCollections(loadUserCollections());
//   }, []);

//   // Lưu bộ từ cá nhân vào localStorage mỗi khi thay đổi
//   useEffect(() => {
//     if (!loading) saveUserCollections(userCollections);
//   }, [userCollections, loading]);

//   // ── Tất cả từ vựng hiển thị (notebook + từ hệ thống) ───────
//   const allVocabularies = useMemo(
//     () => [...vocabularies, ...systemVocabs],
//     [vocabularies, systemVocabs]
//   );

//   // ── Tất cả bộ từ cho StudySelection ─────────────────────────
//   const allCollectionsForStudy = useMemo(() => [
//     ...userCollections.map((c) => ({ ...c, isUserCreated: true })),
//     ...systemCollections
//       .filter((c) => c.owned)
//       .map((c) => ({ ...c, isUserCreated: false })),
//   ], [userCollections, systemCollections]);

//   // ── Quản lý bộ từ cá nhân ───────────────────────────────────
//   const handleCreateCollection = ({ name, description }) => {
//     const newCol = {
//       id:          `user_col_${Date.now()}`,
//       title:       name,
//       description,
//       isUserCreated: true,
//       createdAt:   new Date().toISOString(),
//     };
//     setUserCollections((prev) => [newCol, ...prev]);
//     showToast(`Đã tạo bộ từ "${name}".`, "success");
//   };

//   const handleEditCollection = (id, { name, description }) => {
//     setUserCollections((prev) =>
//       prev.map((col) => col.id === id ? { ...col, title: name, description } : col)
//     );
//     showToast("Đã cập nhật bộ từ.", "success");
//   };

//   const handleDeleteCollection = (id) => {
//     // Chuyển từ trong bộ bị xóa về uncategorized
//     setVocabularies((prev) =>
//       prev.map((w) => w.collectionId === id ? { ...w, collectionId: null } : w)
//     );
//     setUserCollections((prev) => prev.filter((col) => col.id !== id));
//     showToast("Đã xóa bộ từ.", "warning");
//   };

//   // ── Tra từ → lưu vào notebook ───────────────────────────────
//   const handleSaveToNotebook = (newWord, targetCollectionId) => {
//     const newVocab = {
//       ...newWord,
//       id:           `local_${Date.now()}`,
//       collectionId: targetCollectionId || null,
//       isUserAdded:  true,
//       status:       "Đang học",
//       lastReviewed: new Date().toISOString(),
//     };
//     setVocabularies((prev) => [newVocab, ...prev]);

//     const colName = userCollections.find((c) => c.id === targetCollectionId)?.title;
//     showToast(
//       `Đã lưu "${newWord.word}"${colName ? ` vào bộ "${colName}"` : " vào sổ tay"}.`,
//       "success"
//     );
//     setActiveTab("list");
//     setStudyMode(null);
//   };

//   // ── Xóa từ (chỉ từ user tự thêm) ───────────────────────────
//   const handleDeleteWord = async (id) => {
//     // Thử xóa trên server nếu id là ObjectId (không phải local_)
//     if (!String(id).startsWith("local_")) {
//       try {
//         await vocabApi.deleteWord(id);
//       } catch {
//         // Nếu lỗi vẫn xóa local (UX tốt hơn)
//       }
//     }
//     setVocabularies((prev) => prev.filter((w) => w.id !== id));
//     showToast("Đã xóa từ khỏi sổ tay.", "warning");
//   };

//   // ── Chỉnh sửa từ ────────────────────────────────────────────
//   const handleEditWord = (id, updatedData) => {
//     setVocabularies((prev) =>
//       prev.map((w) => w.id === id ? { ...w, ...updatedData } : w)
//     );
//     showToast("Đã cập nhật từ vựng.", "success");
//   };

//   // ── Bắt đầu ôn tập ──────────────────────────────────────────
//   const handleStartStudy = (mode, collectionId) => {
//     const wordsToStudy = allVocabularies.filter((word) => {
//       const inCollection =
//         !collectionId || collectionId === "all"
//           ? true
//           : word.collectionId === collectionId;
//       return inCollection && word.status === "Đang học";
//     });

//     if (wordsToStudy.length === 0) {
//       showToast(
//         "Không còn từ đang học trong bộ này. Hãy chọn bộ khác hoặc thêm từ mới.",
//         "warning"
//       );
//       return;
//     }

//     setStudyList([...wordsToStudy].sort(() => 0.5 - Math.random()));
//     setStudyCollId(collectionId);
//     setStudyMode(mode);
//   };

//   const handleUpdateVocabStatus = async (id, newStatus) => {
//     // Cập nhật local state ngay
//     setVocabularies((prev) =>
//       prev.map((w) => w.id === id ? { ...w, status: newStatus } : w)
//     );
//     setSystemVocabs((prev) =>
//       prev.map((w) => w.id === id ? { ...w, status: newStatus } : w)
//     );

//     // Thử đồng bộ lên server (chỉ với từ user tự thêm từ notebook)
//     if (!String(id).startsWith("local_")) {
//       try {
//         await vocabApi.updateStatus(id, newStatus);
//       } catch {
//         // Lỗi server không ảnh hưởng UX
//       }
//     }
//   };

//   const showToast = (message, type = "success") => setToast({ message, type });

//   // ── Loading / Error states ───────────────────────────────────
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

//   if (loadError) {
//     return (
//       <div className="learning-page">
//         <div className="learning-shell learning-empty">
//           <span className="learning-icon red" style={{ marginBottom: 14 }}>
//             <i className="bi bi-exclamation-circle" />
//           </span>
//           <h2 className="exam-title" style={{ fontSize: "1.3rem" }}>Không thể tải dữ liệu</h2>
//           <p className="learning-subtitle">{loadError}</p>
//           <button
//             className="learning-btn primary"
//             style={{ marginTop: 16 }}
//             onClick={() => window.location.reload()}
//           >
//             <i className="bi bi-arrow-clockwise" /> Thử lại
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ── Render ───────────────────────────────────────────────────
//   return (
//     <div className="learning-page">
//       {toast && (
//         <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
//       )}

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
//                   onClick={() => { setActiveTab(tab.id); setStudyMode(null); }}
//                 >
//                   <i className={`bi ${tab.icon}`} /> {tab.label}
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </header>
//       )}

//       <main className="learning-shell">
//         {/* ── Sổ tay ── */}
//         {!studyMode && activeTab === "list" && (
//           <VocabularyList
//             vocabularies={allVocabularies}
//             userCollections={userCollections}
//             onDeleteWord={handleDeleteWord}
//             onEditWord={handleEditWord}
//           />
//         )}

//         {/* ── Tra từ ── */}
//         {!studyMode && activeTab === "translate" && (
//           <VocabularyTranslate
//             onSaveToNotebook={handleSaveToNotebook}
//             userCollections={userCollections}
//           />
//         )}

//         {/* ── Ôn tập ── */}
//         {!studyMode && activeTab === "study" && (
//           <StudySelection
//             collections={allCollectionsForStudy}
//             vocabularies={allVocabularies}
//             onStartStudy={handleStartStudy}
//           />
//         )}

//         {/* ── Bộ từ của tôi ── */}
//         {!studyMode && activeTab === "mysets" && (
//           <MyCollectionsPanel
//             userCollections={userCollections}
//             systemCollections={systemCollections}
//             vocabularies={allVocabularies}
//             onCreateCollection={handleCreateCollection}
//             onEditCollection={handleEditCollection}
//             onDeleteCollection={handleDeleteCollection}
//           />
//         )}

//         {/* ── Flashcard ── */}
//         {studyMode === "flashcard" && (
//           <FlashcardMode
//             studyList={studyList}
//             onUpdateVocabStatus={handleUpdateVocabStatus}
//             onExit={() => setStudyMode(null)}
//           />
//         )}

//         {/* ── Quiz ── */}
//         {studyMode === "quiz" && (
//           <QuizMode
//             studyList={studyList}
//             allVocabularies={allVocabularies}
//             onUpdateVocabStatus={handleUpdateVocabStatus}
//             onExit={() => setStudyMode(null)}
//           />
//         )}
//       </main>
//     </div>
//   );
// };

// export default VocabularyHub;


