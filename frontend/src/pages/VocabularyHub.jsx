import React, { useEffect, useMemo, useState } from "react";
import FlashcardMode from "../components/Vocabulary/FlashcardMode";
import QuizMode from "../components/Vocabulary/QuizMode";
import StudySelection from "../components/Vocabulary/StudySelection";
import Toast from "../components/Vocabulary/Toast";
import VocabularyList from "../components/Vocabulary/VocabularyList";
import VocabularyTranslate from "../components/Vocabulary/VocabularyTranslate";
import { initialVocabs, mockVocabularyCollections } from "../data/learningMockData";

const tabs = [
  { id: "list", label: "Sổ tay", icon: "bi-journal-bookmark" },
  { id: "translate", label: "Tra từ", icon: "bi-translate" },
  { id: "study", label: "Ôn tập", icon: "bi-lightning-charge" },
];

const VocabularyHub = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studyMode, setStudyMode] = useState(null);
  const [studyList, setStudyList] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVocabularies(initialVocabs);
      setLoading(false);
    }, 450);

    return () => window.clearTimeout(timer);
  }, []);

  const visibleVocabs = useMemo(() => {
    if (selectedCollection === "all") return vocabularies;
    return vocabularies.filter((item) => item.collectionId === selectedCollection);
  }, [selectedCollection, vocabularies]);

  const handleSaveToNotebook = (newWord) => {
    const newVocab = {
      ...newWord,
      id: Date.now(),
      collectionId: "core",
      status: "Đang học",
      lastReviewed: new Date().toISOString().slice(0, 10),
    };
    setVocabularies((prev) => [newVocab, ...prev]);
    setToast({ message: "Đã lưu từ vào sổ tay cá nhân.", type: "success" });
    setActiveTab("list");
    setStudyMode(null);
  };

  const handleStartStudy = (mode, collectionId = selectedCollection) => {
    const wordsToStudy = vocabularies.filter((word) => {
      const inCollection = collectionId === "all" || word.collectionId === collectionId;
      return inCollection && word.status === "Đang học";
    });

    if (wordsToStudy.length === 0) {
      setToast({ message: "Không còn từ đang học trong bộ này. Hãy chọn bộ khác hoặc thêm từ mới.", type: "warning" });
      return;
    }

    setStudyList([...wordsToStudy].sort(() => 0.5 - Math.random()));
    setStudyMode(mode);
  };

  const handleUpdateVocabStatus = (id, newStatus) => {
    setVocabularies((prev) => prev.map((word) => (word.id === id ? { ...word, status: newStatus } : word)));
  };

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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
        {!studyMode && (
          <section className="learning-card" style={{ marginBottom: 18 }}>
            <div className="learning-section-heading">
              <div>
                <strong>Bộ từ vựng đang xem</strong>
                <p className="vocab-muted">Có thể chọn bộ miễn phí, đã mua lẻ hoặc thuộc Premium.</p>
              </div>
              <select className="learning-input" value={selectedCollection} onChange={(event) => setSelectedCollection(event.target.value)} style={{ maxWidth: 280 }}>
                <option value="all">Tất cả bộ từ</option>
                {mockVocabularyCollections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.title} {collection.premium ? "(Premium)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </section>
        )}

        {!studyMode && activeTab === "list" && <VocabularyList vocabularies={visibleVocabs} />}
        {!studyMode && activeTab === "translate" && <VocabularyTranslate onSaveToNotebook={handleSaveToNotebook} />}
        {!studyMode && activeTab === "study" && (
          <StudySelection
            collections={mockVocabularyCollections}
            selectedCollection={selectedCollection}
            onStartStudy={handleStartStudy}
          />
        )}

        {studyMode === "flashcard" && (
          <FlashcardMode studyList={studyList} onUpdateVocabStatus={handleUpdateVocabStatus} onExit={() => setStudyMode(null)} />
        )}

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
