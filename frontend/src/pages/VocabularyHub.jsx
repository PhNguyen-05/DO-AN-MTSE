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

const resolveMediaUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
      if (isLocalHost) {
        return `${import.meta.env.VITE_API_URL || ""}${url.pathname}${url.search}`;
      }
      return value;
    } catch {
      return value;
    }
  }
  if (value.startsWith("/")) return `${import.meta.env.VITE_API_URL || ""}${value}`;
  if (value.startsWith("uploads/")) return `${import.meta.env.VITE_API_URL || ""}/${value}`;
  return `${import.meta.env.VITE_API_URL || ""}/${value}`;
};

/// FIX: sinh id dự phòng nếu backend không trả _id (tránh key=undefined)
const ensureId = (w, prefix = "word") => {
  const raw = w._id || w.id;
  if (raw) return String(raw);
  return `${prefix}_${w.word || "unknown"}_${Math.random().toString(36).slice(2, 9)}`;
};

const normalizeNotebookWord = (w) => ({
  id:           ensureId(w, "nb"),
  word:         w.word,
  phonetic:     w.phonetic    || "",
  audioUrl:     w.audioUrl    || w.audio || "",
  imageUrl:     w.imageUrl    || w.image || "",
  type:         w.type        || "",
  meaning:      w.meaning,
  example:      w.example     || "",
  exampleEn:    w.exampleEn   || w.example || "",
  status:       w.status      || "Đang học",
  lastReviewed: w.lastReviewed || w.updatedAt || new Date().toISOString(),
  collectionId: w.collectionId || null,
  isUserAdded:  true,
});

const normalizeSetWord = (w, setId) => ({
  id:           ensureId(w, `set_${setId}`),
  word:         w.word,
  phonetic:     w.phonetic    || "",
  audioUrl:     w.audioUrl    || w.audio || "",
  imageUrl:     w.imageUrl    || w.image || "",
  type:         w.type        || "",
  meaning:      w.meaning,
  example:      w.example     || "",
  exampleEn:    w.exampleEn   || w.example || "",
  status:       w.status      || "Đang học",
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

// ── WordCardCompact ───────────────────────────────────────────
const WordCardCompact = ({ word, onDelete, onEdit, readOnly = false }) => {
  const [imgError, setImgError]   = useState(false);
  const [showImage, setShowImage] = useState(false);

  const exampleText      = word.exampleEn || word.example || "";
  const resolvedImageUrl = resolveMediaUrl(word.imageUrl);
  const resolvedAudioUrl = resolveMediaUrl(word.audioUrl);
  const hasImage         = Boolean(resolvedImageUrl) && !imgError;

  const playAudio = (e) => {
    e.stopPropagation();
    if (resolvedAudioUrl) new Audio(resolvedAudioUrl).play().catch(() => {});
  };

  return (
    <article
      className={`learning-card vocab-card ${word.status === "Đã thuộc" ? "mastered" : ""}`}
      style={{ padding: "14px 16px" }}
    >
      {hasImage && (
        <div
          style={{
            margin: "-14px -16px 12px -16px",
            borderRadius: "8px 8px 0 0",
            overflow: "hidden",
            background: "#f8fafc",
            cursor: "pointer",
          }}
          onClick={(e) => { e.stopPropagation(); setShowImage(true); }}
          title="Xem ảnh minh họa"
        >
          <img
            src={resolvedImageUrl}
            alt={`Minh họa từ "${word.word}"`}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: 96, objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      <div className="vocab-card-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 className="vocab-word" style={{ fontSize: "1.1rem" }}>{word.word}</h3>
            {resolvedAudioUrl && (
              <button
                className="learning-btn ghost"
                style={{ padding: "2px 6px", color: "#0b57c5" }}
                onClick={playAudio}
              >
                <i className="bi bi-volume-up-fill" style={{ fontSize: "0.95rem" }} />
              </button>
            )}
          </div>
          {word.phonetic && <span className="vocab-phonetic">{word.phonetic}</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span
            className={`learning-badge ${word.status === "Đã thuộc" ? "green" : ""}`}
            style={{ fontSize: "0.75rem" }}
          >
            {word.status}
          </span>
          {/* FIX: truyền đúng (word) để component cha tách id và data */}
          {!readOnly && word.isUserAdded && (
            <>
              <button
                className="learning-btn ghost"
                style={{ padding: "3px 7px" }}
                onClick={() => onEdit && onEdit(word)}
              >
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
      {resolvedAudioUrl && (
        <audio controls preload="none" src={resolvedAudioUrl} style={{ width: "100%", marginTop: 8 }} />
      )}
      {exampleText && (
        <p className="vocab-example" style={{ fontSize: "0.88rem", marginTop: 8 }}>
          "{exampleText}"
        </p>
      )}

      {showImage && hasImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.78)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowImage(false)}
        >
          <div
            style={{ position: "relative", maxWidth: 680, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={resolvedImageUrl}
              alt={`Ảnh minh họa từ "${word.word}"`}
              style={{
                width: "100%",
                maxHeight: "76vh",
                objectFit: "contain",
                borderRadius: 12,
                background: "#fff",
              }}
            />
            <button
              onClick={() => setShowImage(false)}
              style={{
                position: "absolute",
                top: -14,
                right: -14,
                background: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1rem",
                color: "#334155",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

// ── MyCollectionsPanel ────────────────────────────────────────
const MyCollectionsPanel = ({
  userCollections,
  systemCollections,
  allVocabularies,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
  onDeleteWord,
  onEditWord,
}) => {
  const [showModal, setShowModal]     = useState(false);
  const [editingCol, setEditingCol]   = useState(null);
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

  const openedWords = useMemo(
    () => openedColId
      ? allVocabularies.filter((w) => w.collectionId === openedColId)
      : [],
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
          <button
            className="learning-btn primary"
            style={{ marginTop: 16 }}
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg" /> Tạo bộ từ đầu tiên
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, marginBottom: 8 }}>
          {userCollections.map((col) => {
            const wordCount     = allVocabularies.filter((w) => w.collectionId === col.id).length;
            const masteredCount = allVocabularies.filter((w) => w.collectionId === col.id && w.status === "Đã thuộc").length;
            const studyingCount = allVocabularies.filter((w) => w.collectionId === col.id && w.status === "Đang học").length;
            const isOpen        = openedColId === col.id;

            return (
              <div key={col.id}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                      <span
                        className="learning-icon violet"
                        style={{
                          flexShrink: 0,
                          background: isOpen ? "#0b57c5" : undefined,
                          color: isOpen ? "#fff" : undefined,
                        }}
                      >
                        <i className={`bi ${isOpen ? "bi-folder2-open" : "bi-folder2"}`} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ color: "#10233f", fontSize: "1.05rem" }}>{col.title}</strong>
                        {col.description && (
                          <p
                            className="vocab-muted"
                            style={{
                              fontSize: "0.85rem",
                              margin: "2px 0 0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {col.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span className="learning-badge">{wordCount} từ</span>
                      {/* FIX: hiện cả đang học lẫn đã thuộc để phản ánh đúng sau flashcard */}
                      <span className="learning-badge amber">{studyingCount} đang học</span>
                      <span className="learning-badge green">{masteredCount} đã thuộc</span>
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
                      <i
                        className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`}
                        style={{ color: "#64748b" }}
                      />
                    </div>
                  </div>
                </article>

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
                        <i
                          className="bi bi-journal-plus"
                          style={{ fontSize: "1.6rem", display: "block", marginBottom: 8 }}
                        />
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
                              // FIX: tách word object thành (id, data) cho handler
                              onEdit={(w) => onEditWord(w.id, w)}
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
              const isOpen     = openedColId === col.id;
              const wordsInSet = allVocabularies.filter((w) => w.collectionId === col.id);

              return (
                <div key={col.id}>
                  <article
                    className="learning-card"
                    style={{
                      cursor: col.owned ? "pointer" : "default",
                      borderLeft: "4px solid #0b57c5",
                      opacity: col.owned ? 1 : 0.65,
                      marginBottom: 0,
                    }}
                    onClick={() => col.owned && toggleOpen(col.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                        <span
                          className="learning-icon"
                          style={{
                            flexShrink: 0,
                            background: isOpen ? "#0b57c5" : "#e9f0ff",
                            color: isOpen ? "#fff" : "#0b57c5",
                          }}
                        >
                          <i className={`bi ${isOpen ? "bi-shield-fill-check" : "bi-shield-check"}`} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: "#10233f", fontSize: "1.05rem" }}>{col.title}</strong>
                          {col.description && (
                            <p className="vocab-muted" style={{ fontSize: "0.85rem", margin: "2px 0 0" }}>
                              {col.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span className="learning-badge">{col.total || 0} từ</span>
                        {col.premium && <span className="learning-badge amber">Premium</span>}
                        {!col.owned && (
                          <span className="learning-badge red">
                            <i className="bi bi-lock" /> Khoá
                          </span>
                        )}
                        {col.owned && (
                          <i
                            className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`}
                            style={{ color: "#64748b" }}
                          />
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

// ── VocabularyHub (main) ──────────────────────────────────────
const VocabularyHub = () => {
  const [activeTab, setActiveTab]               = useState("list");
  const [activeListCollection, setActiveListCol] = useState(null);
  const [vocabularies, setVocabularies]         = useState([]);
  const [systemCollections, setSystemCols]      = useState([]);
  const [systemVocabs, setSystemVocabs]         = useState([]);
  const [userCollections, setUserCollections]   = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [loadError, setLoadError]               = useState(null);
  const [studyMode, setStudyMode]               = useState(null);
  const [studyList, setStudyList]               = useState([]);
  const [toast, setToast]                       = useState(null);

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

        // FIX: normalize đọc collectionId từ backend
        setVocabularies((notebookData || []).map(normalizeNotebookWord));

        // Xây dựng map word → status từ notebook để merge vào system words
        // Giúp status "Đã thuộc" persist qua các lần reload
        const notebookStatusMap = {};
        for (const w of (notebookData || [])) {
          if (w.word) notebookStatusMap[w.word.toLowerCase()] = w.status || "Đang học";
        }

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
          (set.words || []).map((w) => {
            const normalized = normalizeSetWord(w, set.id);
            // Merge status từ notebook nếu user đã học từ này trước đó
            const notebookStatus = notebookStatusMap[normalized.word?.toLowerCase()];
            if (notebookStatus) normalized.status = notebookStatus;
            return normalized;
          })
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

  // Lưu user collections vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (!loading) saveUserCollections(userCollections);
  }, [userCollections, loading]);

  // ── Derived state ────────────────────────────────────────────
  const allVocabularies = useMemo(
    () => [...vocabularies, ...systemVocabs],
    [vocabularies, systemVocabs]
  );

  const allCollectionsForList = useMemo(() => [
    ...userCollections.map((c) => ({ ...c, isUserCreated: true })),
    ...systemCollections.filter((c) => c.owned).map((c) => ({ ...c, isUserCreated: false })),
  ], [userCollections, systemCollections]);

  const allCollectionsForStudy = useMemo(() => [
    ...userCollections.map((c) => ({ ...c, isUserCreated: true })),
    ...systemCollections.filter((c) => c.owned).map((c) => ({ ...c, isUserCreated: false })),
  ], [userCollections, systemCollections]);

  // ── Handlers ─────────────────────────────────────────────────
  const showToast = (message, type = "success") => setToast({ message, type });

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
    // Chuyển từ thuộc bộ bị xóa về sổ tay chung
    setVocabularies((prev) =>
      prev.map((w) => w.collectionId === id ? { ...w, collectionId: null } : w)
    );
    setUserCollections((prev) => prev.filter((col) => col.id !== id));
    showToast("Đã xóa bộ từ.", "warning");
  };

  // FIX: async + gọi API với collectionId + xử lý đúng từng case lỗi
  const handleSaveToNotebook = async (newWord, targetCollectionId) => {
    const colName = userCollections.find((c) => c.id === targetCollectionId)?.title;

    try {
      const saved = await vocabApi.saveWord({
        word:         newWord.word,
        phonetic:     newWord.phonetic  || "",
        audioUrl:     newWord.audioUrl  || "",
        type:         newWord.type      || "",
        meaning:      newWord.meaning,
        example:      newWord.exampleEn || newWord.example || "",
        collectionId: targetCollectionId || null,
      });

      // Dùng _id thật từ backend để sau reload vẫn nhận dạng được
      const savedId = saved?.vocab?._id
        ? String(saved.vocab._id)
        : saved?._id
        ? String(saved._id)
        : `local_${Date.now()}`;

      const newVocab = {
        ...newWord,
        id:           savedId,
        collectionId: targetCollectionId || null,
        isUserAdded:  true,
        status:       "Đang học",
        lastReviewed: new Date().toISOString(),
      };

      setVocabularies((prev) => [newVocab, ...prev]);
      showToast(
        `Đã lưu "${newWord.word}"${colName ? ` vào bộ "${colName}"` : " vào sổ tay"}.`,
        "success"
      );
      setActiveTab("list");
      setStudyMode(null);

    } catch (err) {
      if (err?.status === 409) {
        // Từ đã tồn tại → chỉ báo warning, không chuyển tab
        showToast(`Từ "${newWord.word}" đã có trong sổ tay.`, "warning");
        return;
      }

      // Lỗi khác (network, chưa đăng nhập...) → lưu local tạm, vẫn chuyển tab
      const newVocab = {
        ...newWord,
        id:           `local_${Date.now()}`,
        collectionId: targetCollectionId || null,
        isUserAdded:  true,
        status:       "Đang học",
        lastReviewed: new Date().toISOString(),
      };
      setVocabularies((prev) => [newVocab, ...prev]);
      showToast(
        `Đã lưu "${newWord.word}" cục bộ${colName ? ` vào bộ "${colName}"` : ""}. (Chưa đồng bộ server)`,
        "warning"
      );
      setActiveTab("list");
      setStudyMode(null);
    }
  };

  const handleDeleteWord = async (id) => {
    // Xóa trên backend nếu không phải local
    if (!String(id).startsWith("local_")) {
      try { await vocabApi.deleteWord(id); } catch { /* ignore */ }
    }
    setVocabularies((prev) => prev.filter((w) => w.id !== id));
    showToast("Đã xóa từ khỏi sổ tay.", "warning");
  };

  // FIX: nhận (id, updatedData) — dùng cho cả VocabularyList và MyCollectionsPanel
  const handleEditWord = (id, updatedData) => {
    setVocabularies((prev) =>
      prev.map((w) => w.id === id ? { ...w, ...updatedData } : w)
    );
    showToast("Đã cập nhật từ vựng.", "success");
  };

  const handleStartStudy = (mode, collectionId) => {
    const wordsToStudy = allVocabularies.filter((word) => {
      const inCollection =
        !collectionId || collectionId === "all"
          ? true
          : word.collectionId === collectionId;
      return inCollection && word.status === "Đang học";
    });

    if (wordsToStudy.length === 0) {
      showToast("Không còn từ đang học trong bộ này.", "warning");
      return;
    }
    setStudyList([...wordsToStudy].sort(() => 0.5 - Math.random()));
    setStudyMode(mode);
  };

  // FIX: update cả vocabularies lẫn systemVocabs để badge số từ phản ánh đúng
  // const handleUpdateVocabStatus = async (id, newStatus) => {
  //   // Update UI trước (optimistic)
  //   setVocabularies((prev) =>
  //     prev.map((w) => w.id === id ? { ...w, status: newStatus } : w)
  //   );
  //   setSystemVocabs((prev) =>
  //     prev.map((w) => w.id === id ? { ...w, status: newStatus } : w)
  //   );

  //   // Chỉ gọi API nếu từ do user thêm vào notebook
  //   const word = [...vocabularies, ...systemVocabs].find((w) => w.id === id);
  //   const isUserWord = word?.isUserAdded === true;
    
  //   const skipPrefixes = ["local_", "set_", "nb_"];
  //   const hasInvalidId = !id || 
  //     String(id) === "undefined" || 
  //     skipPrefixes.some((p) => String(id).startsWith(p));

  //   if (isUserWord && !hasInvalidId) {
  //     try {
  //       await vocabApi.updateStatus(id, newStatus);
  //     } catch (err) {
  //       // Bỏ qua lỗi 404 (ID không còn trong DB), chỉ log các lỗi khác
  //       if (err?.status !== 404) {
  //         console.warn("Không thể đồng bộ trạng thái từ:", err?.message);
  //       }
  //     }
  //   }
  // };


  const handleUpdateVocabStatus = async (id, newStatus, isUserAdded, wordData) => {
    // Cập nhật đúng state tương ứng để UI phản ánh ngay
    if (isUserAdded) {
      setVocabularies((prev) =>
        prev.map((w) => w.id === id ? { ...w, status: newStatus } : w)
      );
    } else {
      setSystemVocabs((prev) =>
        prev.map((w) => w.id === id ? { ...w, status: newStatus } : w)
      );
    }

    // --- Từ hệ thống (isUserAdded=false): lưu progress vào notebook để analytics thống kê ---
    if (!isUserAdded) {
      if (!wordData) return;
      try {
        // Tìm trong notebook xem từ đã tồn tại chưa
        const notebook = await vocabApi.getNotebook();
        const existing = notebook.find(
          (w) => w.word?.toLowerCase() === wordData.word?.toLowerCase()
        );

        if (existing?._id) {
          // Từ đã có → update status trực tiếp
          await vocabApi.updateStatus(existing._id, newStatus);
        } else {
          // Từ chưa có → saveWord (tự động tạo với status mặc định), sau đó updateStatus
          const saved = await vocabApi.saveWord({
            word:     wordData.word,
            phonetic: wordData.phonetic || "",
            audioUrl: wordData.audioUrl || "",
            type:     wordData.type     || "",
            meaning:  wordData.meaning  || "",
            example:  wordData.example  || "",
          });
          const savedId = saved?.vocab?._id || saved?._id;
          if (savedId) {
            await vocabApi.updateStatus(String(savedId), newStatus);
          }
        }
      } catch (err) {
        console.warn("Không thể đồng bộ trạng thái từ hệ thống:", err?.message);
      }
      return;
    }

    // --- Từ notebook cá nhân (isUserAdded=true): update trực tiếp ---
    const skipPrefixes = ["local_", "set_", "nb_"];
    const hasInvalidId = !id ||
      String(id) === "undefined" ||
      skipPrefixes.some((p) => String(id).startsWith(p));

    if (hasInvalidId) return;

    try {
      await vocabApi.updateStatus(id, newStatus);
    } catch (err) {
      if (err?.status !== 404) {
        console.warn("Không thể đồng bộ trạng thái từ:", err?.message);
      }
    }
  };



  // ── Loading / Error ──────────────────────────────────────────
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

  if (loadError) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <span className="learning-icon red" style={{ marginBottom: 14 }}>
            <i className="bi bi-exclamation-circle" />
          </span>
          <h2 className="exam-title" style={{ fontSize: "1.3rem" }}>Không thể tải dữ liệu</h2>
          <p className="learning-subtitle">{loadError}</p>
          <button
            className="learning-btn primary"
            style={{ marginTop: 16 }}
            onClick={() => window.location.reload()}
          >
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
                    if (tab.id !== "list") setActiveListCol(null);
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
            onStatusChange={handleUpdateVocabStatus}
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
            onCreateCollection={handleCreateCollection}
            onEditCollection={handleEditCollection}
            onDeleteCollection={handleDeleteCollection}
            onDeleteWord={handleDeleteWord}
            // FIX: truyền đúng signature (id, data)
            onEditWord={handleEditWord}
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

