import React, { useEffect, useMemo, useState } from "react";
import FlashcardMode from "../components/Vocabulary/FlashcardMode";
import QuizMode from "../components/Vocabulary/QuizMode";
import StudySelection from "../components/Vocabulary/StudySelection";
import Toast from "../components/Vocabulary/Toast";
import VocabularyList from "../components/Vocabulary/VocabularyList";
import VocabularyTranslate from "../components/Vocabulary/VocabularyTranslate";
import { vocabApi } from "../services/userApi";

const tabs = [
  { id: "list", label: "Sổ tay", icon: "bi-journal-bookmark" },
  { id: "translate", label: "Tra từ", icon: "bi-translate" },
  { id: "study", label: "Ôn tập", icon: "bi-lightning-charge" },
];

const VocabularyHub = () => {
  const [activeTab, setActiveTab] = useState("list");

  // Sổ tay cá nhân (UserVocabulary - /api/vocabulary/notebook)
  const [vocabularies, setVocabularies] = useState([]);
  // Bộ từ vựng (VocabularySet - /user/vocabulary-sets) - giờ có kèm words
  const [collections, setCollections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studyMode, setStudyMode] = useState(null);
  const [studyList, setStudyList] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [notebookData, setsData] = await Promise.all([
          vocabApi.getNotebook(),
          vocabApi.getSets(),
        ]);

        // Chuẩn hóa dữ liệu notebook
        const normalized = notebookData.map((item) => ({
          id: item._id,
          word: item.word,
          phonetic: item.phonetic || "",
          audioUrl: item.audioUrl || "",
          type: item.type || "",
          meaning: item.meaning,
          example: item.example || "",
          status: item.status || "Đang học",
          lastReviewed: item.lastReviewed || item.updatedAt,
          collectionId: "notebook",
        }));

        setVocabularies(normalized);
        setCollections(setsData);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu từ vựng.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc từ theo bộ đang chọn
  const visibleVocabs = useMemo(() => {
    if (selectedCollection === "all") {
      // Gộp sổ tay + tất cả words từ các bộ đang sở hữu
      const allSetWords = collections
        .filter((c) => c.owned && c.words && c.words.length > 0)
        .flatMap((c) => c.words);
      // Dùng sổ tay nếu không có bộ nào, hoặc gộp tất cả
      return [...vocabularies, ...allSetWords];
    }

    if (selectedCollection === "notebook") {
      return vocabularies;
    }

    // Chọn một bộ cụ thể
    const col = collections.find((c) => c.id === selectedCollection);
    if (!col || !col.owned) return [];

    // Trả về words của bộ đó (đã được backend trả kèm)
    return col.words || [];
  }, [selectedCollection, vocabularies, collections]);

  const handleSaveToNotebook = async (newWord) => {
    try {
      const saved = await vocabApi.saveWord({
        word: newWord.word,
        phonetic: newWord.phonetic || "",
        audioUrl: newWord.audioUrl || "",
        type: newWord.type || "",
        meaning: newWord.meaning,
        example: newWord.example || "",
      });

      const normalized = {
        id: saved.vocab?._id || Date.now().toString(),
        word: saved.vocab?.word || newWord.word,
        phonetic: saved.vocab?.phonetic || newWord.phonetic || "",
        audioUrl: saved.vocab?.audioUrl || newWord.audioUrl || "",
        type: saved.vocab?.type || newWord.type || "",
        meaning: saved.vocab?.meaning || newWord.meaning,
        example: saved.vocab?.example || newWord.example || "",
        status: "Đang học",
        lastReviewed: new Date().toISOString(),
        collectionId: "notebook",
      };

      setVocabularies((prev) => [normalized, ...prev]);
      setToast({ message: "Đã lưu từ vào sổ tay cá nhân.", type: "success" });
      setActiveTab("list");
      setStudyMode(null);
    } catch (err) {
      if (err.status === 409) {
        setToast({ message: err.message || "Từ này đã có trong sổ tay.", type: "warning" });
      } else {
        const tempWord = {
          id: Date.now().toString(),
          word: newWord.word,
          phonetic: newWord.phonetic || "",
          audioUrl: newWord.audioUrl || "",
          type: newWord.type || "",
          meaning: newWord.meaning,
          example: newWord.example || "",
          status: "Đang học",
          lastReviewed: new Date().toISOString(),
          collectionId: "notebook",
        };
        setVocabularies((prev) => [tempWord, ...prev]);
        setToast({ message: "Đã lưu tạm vào sổ tay (chưa đồng bộ).", type: "warning" });
        setActiveTab("list");
        setStudyMode(null);
      }
    }
  };

  const handleStartStudy = (mode) => {
    const wordsToStudy = visibleVocabs.filter((word) => word.status === "Đang học");

    if (wordsToStudy.length === 0) {
      setToast({
        message: "Không còn từ đang học trong bộ này. Hãy chọn bộ khác hoặc thêm từ mới.",
        type: "warning",
      });
      return;
    }

    setStudyList([...wordsToStudy].sort(() => 0.5 - Math.random()));
    setStudyMode(mode);
  };

  const handleUpdateVocabStatus = async (id, newStatus) => {
    setVocabularies((prev) =>
      prev.map((word) => (word.id === id ? { ...word, status: newStatus } : word)),
    );

    try {
      await vocabApi.updateStatus(id, newStatus);
    } catch {
      // Rollback nếu thất bại
    }
  };

  // Danh sách bộ từ cho selector
  const collectionOptions = useMemo(() => {
    const notebookOption = {
      id: "notebook",
      title: "Sổ tay cá nhân",
      owned: true,
      premium: false,
    };
    return [notebookOption, ...collections];
  }, [collections]);

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

  if (error) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <h2 className="exam-title">Không thể tải dữ liệu</h2>
          <p className="learning-subtitle">{error}</p>
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
              <p className="vocab-muted">
                Ôn tập, tra từ và quản lý sổ tay TOEIC cá nhân.
              </p>
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
                <p className="vocab-muted">
                  Chọn sổ tay cá nhân hoặc bộ từ đã mua / miễn phí.
                </p>
              </div>
              <select
                className="learning-input"
                value={selectedCollection}
                onChange={(event) => setSelectedCollection(event.target.value)}
                style={{ maxWidth: 280 }}
              >
                <option value="all">Tất cả từ vựng</option>
                {collectionOptions.map((collection) => (
                  <option
                    key={collection.id}
                    value={collection.id}
                    disabled={!collection.owned}
                  >
                    {collection.title}{" "}
                    {collection.premium ? "(Premium)" : ""}
                    {!collection.owned ? " 🔒" : ""}
                  </option>
                ))}
              </select>
            </div>
          </section>
        )}

        {!studyMode && activeTab === "list" && (
          <VocabularyList vocabularies={visibleVocabs} />
        )}
        {!studyMode && activeTab === "translate" && (
          <VocabularyTranslate onSaveToNotebook={handleSaveToNotebook} />
        )}
        {!studyMode && activeTab === "study" && (
          <StudySelection
            collections={collectionOptions}
            selectedCollection={selectedCollection}
            onStartStudy={handleStartStudy}
          />
        )}

        {studyMode === "flashcard" && (
          <FlashcardMode
            studyList={studyList}
            onUpdateVocabStatus={handleUpdateVocabStatus}
            onExit={() => setStudyMode(null)}
          />
        )}

        {studyMode === "quiz" && (
          <QuizMode
            studyList={studyList}
            allVocabularies={visibleVocabs}
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
