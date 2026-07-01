import React, { useMemo, useState } from "react";

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
                {/* <option value="">Sổ tay chung (không phân bộ)</option> */}
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
// WordCard — hiển thị 1 từ, bao gồm ảnh + audio
// ──────────────────────────────────────────────────────────────
const WordCard = ({ word, userCollections, onDelete, onEdit, onStatusChange }) => {
  const isUserAdded = word.isUserAdded === true;
  const [imgError, setImgError] = useState(false);
  const [showImage, setShowImage] = useState(false);

  // Ưu tiên ví dụ tiếng Anh
  const exampleText = word.exampleEn || word.example || "";
  const resolvedImageUrl = resolveMediaUrl(word.imageUrl);
  const resolvedAudioUrl = resolveMediaUrl(word.audioUrl);

  const playAudio = (e) => {
    e.stopPropagation();
    if (resolvedAudioUrl) new Audio(resolvedAudioUrl).play().catch(() => {});
  };

  // imageUrl có thể từ VocabularySet (hệ thống) hoặc do user upload sau này
  const hasImage = Boolean(resolvedImageUrl) && !imgError;

  return (
    <article className={`learning-card vocab-card ${word.status === "Đã thuộc" ? "mastered" : ""}`}>
      {/* Ảnh minh họa — hiển thị thu gọn, click để phóng to */}
      {hasImage && (
        <div
          style={{
            margin: "-20px -20px 14px -20px",
            borderRadius: "8px 8px 0 0",
            overflow: "hidden",
            background: "#f8fafc",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => setShowImage(true)}
          title="Xem ảnh minh họa"
        >
          <img
            src={resolvedImageUrl}
            alt={`Minh họa từ "${word.word}"`}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: 140,
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 6,
              right: 8,
              background: "rgba(0,0,0,0.45)",
              color: "#fff",
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: "0.72rem",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <i className="bi bi-zoom-in" /> Xem ảnh
          </div>
        </div>
      )}

      <div className="vocab-card-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 className="vocab-word">{word.word}</h3>
            {resolvedAudioUrl && (
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
          <span
            className={`learning-badge ${word.status === "Đã thuộc" ? "green" : ""}`}
            onClick={() => {
              const next = word.status === "Đã thuộc" ? "Đang học" : "Đã thuộc";
              onStatusChange && onStatusChange(word.id, next, word.isUserAdded, word);
            }}
            title={word.status === "Đã thuộc" ? "Bấm để đánh dấu Đang học" : "Bấm để đánh dấu Đã thuộc"}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            {word.status === "Đã thuộc" ? "✓ Đã thuộc" : "Đang học"}
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
      {resolvedAudioUrl && (
        <audio controls preload="none" src={resolvedAudioUrl} style={{ width: "100%", marginTop: 8 }} />
      )}
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

      {/* Lightbox ảnh minh họa */}
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
          <div style={{ position: "relative", maxWidth: 680, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <img
              src={resolvedImageUrl}
              alt={`Minh họa từ "${word.word}"`}
              style={{
                width: "100%",
                maxHeight: "76vh",
                objectFit: "contain",
                borderRadius: 12,
                background: "#fff",
              }}
            />
            <div style={{ textAlign: "center", marginTop: 12, color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
              {word.word}
              {word.phonetic && (
                <span style={{ marginLeft: 10, fontWeight: 400, opacity: 0.75, fontSize: "0.95rem" }}>
                  {word.phonetic}
                </span>
              )}
            </div>
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

// ──────────────────────────────────────────────────────────────
// VocabularyList (main)
// ──────────────────────────────────────────────────────────────
const VocabularyList = ({
  vocabularies,
  userCollections = [],
  allCollections  = [],
  activeCollectionId = null,
  onDeleteWord,
  onEditWord,
  onStatusChange,
}) => {
  const [filterCollection, setFilterCollection] = useState(activeCollectionId || "");
  const [filterStatus,     setFilterStatus]     = useState("all");
  const [searchTerm,       setSearchTerm]        = useState("");
  const [editingWord,      setEditingWord]       = useState(null);

  React.useEffect(() => {
    if (activeCollectionId !== null) setFilterCollection(activeCollectionId);
  }, [activeCollectionId]);

  const collectionOptions = allCollections.length > 0 ? allCollections : userCollections;

  const filteredVocabs = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return vocabularies.filter((w) => {
      const matchStatus = filterStatus === "all" || w.status === filterStatus;
      const matchCol =
        !filterCollection
          ? true
          : w.collectionId === filterCollection;
      const matchSearch =
        !keyword ||
        (w.word && w.word.toLowerCase().includes(keyword)) ||
        (w.meaning && w.meaning.toLowerCase().includes(keyword));
      return matchStatus && matchCol && matchSearch;
    });
  }, [vocabularies, filterStatus, filterCollection, searchTerm]);

  const vocabsWithoutStatusFilter = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return vocabularies.filter((w) => {
      const matchCol = !filterCollection ? true : w.collectionId === filterCollection;
      const matchSearch =
        !keyword ||
        (w.word && w.word.toLowerCase().includes(keyword)) ||
        (w.meaning && w.meaning.toLowerCase().includes(keyword));
      return matchCol && matchSearch;
    });
  }, [vocabularies, filterCollection, searchTerm]);

  const totalLearning = vocabsWithoutStatusFilter.filter((w) => w.status === "Đang học").length;
  const totalMastered = vocabsWithoutStatusFilter.filter((w) => w.status === "Đã thuộc").length;

  // Theo filter đang chọn
  const filteredLearning = filteredVocabs.filter((w) => w.status === "Đang học").length;
  const filteredMastered = filteredVocabs.filter((w) => w.status === "Đã thuộc").length;

  const handleSaveEdit = (updatedData) => {
    onEditWord(editingWord.id, updatedData);
    setEditingWord(null);
  };

  const selectedColLabel = collectionOptions.find((c) => c.id === filterCollection)?.title;

  return (
    <section>
      {/* Header */}
      {/* <div className="learning-section-heading" style={{ marginBottom: 14 }}>
        <div>
          <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
            Sổ tay từ vựng cá nhân
          </h2>
          <p className="vocab-muted">
            Bạn đang có {vocabularies.length} từ trong sổ tay.
          </p>
        </div>
        <div className="learning-actions">
          {filterCollection ? (
            // Đang filter theo bộ → hiện số trong bộ đó / tổng
            <>
              <span className="learning-badge">
                {filteredLearning} đang học
              </span>
              <span className="learning-badge green">
                {filteredMastered} đã thuộc
              </span>
              <span className="vocab-muted" style={{ fontSize: "0.82rem" }}>
                (trong bộ) • tổng: {totalLearning} đang học / {totalMastered} đã thuộc
              </span>
            </>
          ) : (
            // Không filter → hiện tổng toàn bộ
            <>
              <span className="learning-badge">
                {totalLearning} đang học
              </span>
              <span className="learning-badge green">
                {totalMastered} đã thuộc
              </span>
            </>
          )}
        </div>
      </div> */}

      <div className="learning-section-heading" style={{ marginBottom: 14 }}>
        <div>
          <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
            Sổ tay từ vựng cá nhân
          </h2>
          <p className="vocab-muted">
            Bạn đang có {vocabularies.length} từ trong sổ tay.
          </p>
        </div>
        <div className="learning-actions">
          <span className="learning-badge">{totalLearning} đang học</span>
          <span className="learning-badge green">{totalMastered} đã thuộc</span>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="learning-card" style={{ marginBottom: 18, padding: "16px 18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center" }}>
          <div className="exam-search" style={{ minHeight: 40 }}>
            <i className="bi bi-search" style={{ color: "#64748b" }} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm từ hoặc nghĩa..."
              style={{ width: "100%", border: 0, background: "transparent", font: "inherit", outline: "none", color: "#10233f" }}
            />
          </div>

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
            {filteredVocabs.map((word, index) => (
              <WordCard
                key={word.id && word.id !== "undefined" ? word.id : `word-${word.word}-${index}`}
                word={word}
                userCollections={userCollections}
                onDelete={onDeleteWord}
                onEdit={(w) => setEditingWord(w)}
                onStatusChange={onStatusChange}
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
