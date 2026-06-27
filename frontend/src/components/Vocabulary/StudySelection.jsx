import React, { useMemo, useState } from "react";

// ──────────────────────────────────────────────────────────────
// Modal chọn bộ từ trước khi học
// ──────────────────────────────────────────────────────────────
const StudyModeModal = ({ mode, collections, vocabularies, onConfirm, onClose }) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState("all");

  const modeInfo = mode === "flashcard"
    ? { label: "Flashcard", icon: "bi-card-text", color: "#6d35c5" }
    : { label: "Trắc nghiệm Quiz", icon: "bi-ui-checks", color: "#0b57c5" };

  // Đếm số từ "Đang học" theo từng bộ
  // colId = "all"  → đếm tất cả từ đang học
  // colId = id cụ thể → đếm từ trong bộ đó
  const countStudying = (colId) => {
    if (colId === "all") {
      return vocabularies.filter((w) => w.status === "Đang học").length;
    }
    return vocabularies.filter(
      (w) => w.collectionId === colId && w.status === "Đang học"
    ).length;
  };

  const totalSelected = countStudying(selectedCollectionId);

  // Tổng tất cả từ đang học (cho badge header)
  const totalStudying = vocabularies.filter((w) => w.status === "Đang học").length;

  return (
    <div className="learning-modal-backdrop">
      <div className="learning-modal" style={{ maxWidth: 560 }}>
        <div className="learning-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              className="learning-icon"
              style={{ background: "#f1ecff", color: modeInfo.color, width: 38, height: 38 }}
            >
              <i className={`bi ${modeInfo.icon}`} />
            </span>
            <div>
              <h2 className="exam-title" style={{ fontSize: "1.15rem" }}>
                Chọn bộ từ để học
              </h2>
              <p className="vocab-muted" style={{ margin: 0 }}>
                Chế độ: <strong>{modeInfo.label}</strong>
              </p>
            </div>
          </div>
          <button className="learning-btn ghost" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="learning-form">
          <div style={{ display: "grid", gap: 8, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
            {/* Tất cả */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                border: `2px solid ${selectedCollectionId === "all" ? "#0b57c5" : "#d6deeb"}`,
                borderRadius: 8,
                cursor: "pointer",
                background: selectedCollectionId === "all" ? "#e9f0ff" : "#fff",
                transition: "all 0.15s",
              }}
            >
              <input
                type="radio"
                name="study-collection"
                value="all"
                checked={selectedCollectionId === "all"}
                onChange={() => setSelectedCollectionId("all")}
                style={{ accentColor: "#0b57c5" }}
              />
              <span className="learning-icon" style={{ width: 32, height: 32, fontSize: "1rem" }}>
                <i className="bi bi-collection" />
              </span>
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#10233f" }}>Tất cả bộ từ</strong>
                <p className="vocab-muted" style={{ fontSize: "0.82rem", margin: 0 }}>
                  Ôn tập toàn bộ từ vựng đang học
                </p>
              </div>
              <span className="learning-badge">
                {totalStudying} từ
              </span>
            </label>

            {/* Từng bộ */}
            {collections.map((col) => {
              const count = countStudying(col.id);
              const isSelected = selectedCollectionId === col.id;
              return (
                <label
                  key={col.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 14px",
                    border: `2px solid ${isSelected ? "#0b57c5" : "#d6deeb"}`,
                    borderRadius: 8,
                    cursor: count === 0 ? "not-allowed" : "pointer",
                    background: isSelected ? "#e9f0ff" : count === 0 ? "#f8fafc" : "#fff",
                    opacity: count === 0 ? 0.55 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="study-collection"
                    value={col.id}
                    checked={isSelected}
                    onChange={() => count > 0 && setSelectedCollectionId(col.id)}
                    disabled={count === 0}
                    style={{ accentColor: "#0b57c5" }}
                  />
                  <span
                    className="learning-icon"
                    style={{
                      width: 32, height: 32, fontSize: "1rem",
                      background: col.isUserCreated !== false ? "#f1ecff" : "#e9f0ff",
                      color: col.isUserCreated !== false ? "#6d35c5" : "#0b57c5",
                    }}
                  >
                    <i className={col.isUserCreated !== false ? "bi bi-folder2-open" : "bi bi-shield-check"} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: "#10233f" }}>{col.title}</strong>
                    {col.description && (
                      <p className="vocab-muted" style={{ fontSize: "0.82rem", margin: 0 }}>
                        {col.description}
                      </p>
                    )}
                  </div>
                  <span className={`learning-badge ${count === 0 ? "" : "green"}`}>
                    {count} từ
                  </span>
                </label>
              );
            })}
          </div>

          {/* Tóm tắt */}
          {totalSelected > 0 ? (
            <div className="exam-explanation" style={{ margin: "8px 0 0" }}>
              <strong><i className="bi bi-info-circle" /> Sẵn sàng!</strong>
              <p style={{ margin: "6px 0 0", fontSize: "0.88rem" }}>
                Sẽ ôn <strong>{totalSelected} từ</strong> có trạng thái "Đang học"
                {selectedCollectionId !== "all" && " trong bộ đã chọn"}.
              </p>
            </div>
          ) : (
            <div
              style={{
                marginTop: 8, padding: "10px 14px", borderRadius: 8,
                background: "#fff3d6", color: "#a15c00", fontSize: "0.88rem",
              }}
            >
              <i className="bi bi-exclamation-triangle" />{" "}
              {selectedCollectionId === "all"
                ? "Chưa có từ nào đang học. Hãy tra từ và thêm vào sổ tay."
                : "Bộ này không có từ nào đang học."}
            </div>
          )}

          <div className="learning-actions" style={{ justifyContent: "flex-end" }}>
            <button className="learning-btn" type="button" onClick={onClose}>
              Hủy
            </button>
            <button
              className="learning-btn primary"
              type="button"
              disabled={totalSelected === 0}
              onClick={() => onConfirm(mode, selectedCollectionId)}
            >
              <i className={`bi ${modeInfo.icon}`} />
              Bắt đầu {modeInfo.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// StudySelection (main)
// ──────────────────────────────────────────────────────────────
const StudySelection = ({ collections, vocabularies = [], onStartStudy }) => {
  const [pendingMode, setPendingMode] = useState(null); // "flashcard" | "quiz"

  const handleSelectMode = (mode) => {
    setPendingMode(mode);
  };

  const handleConfirm = (mode, collectionId) => {
    setPendingMode(null);
    onStartStudy(mode, collectionId);
  };

  // Tổng số từ đang học trong toàn bộ vocabularies (bao gồm cả từ không phân bộ)
  const totalStudying = vocabularies.filter((w) => w.status === "Đang học").length;

  return (
    <section>
      <div className="learning-section-heading" style={{ marginBottom: 18 }}>
        <div>
          <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
            Chọn chế độ ôn tập
          </h2>
          <p className="vocab-muted">
            Sau khi chọn chế độ, bạn sẽ được chọn bộ từ muốn ôn.
          </p>
        </div>
        <span className="learning-badge green">{totalStudying} từ đang học</span>
      </div>

      <div className="learning-grid cols-2">
        {/* Flashcard */}
        <article className="learning-card interactive" onClick={() => handleSelectMode("flashcard")}>
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
            Có phát âm bằng giọng thật.
          </p>
          <button className="learning-btn primary" style={{ marginTop: 18 }} type="button">
            Chọn bộ & bắt đầu <i className="bi bi-arrow-right" />
          </button>
        </article>

        {/* Quiz */}
        <article className="learning-card interactive" onClick={() => handleSelectMode("quiz")}>
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
            Chọn bộ & bắt đầu <i className="bi bi-arrow-right" />
          </button>
        </article>
      </div>

      {/* Tips khi chưa có từ đang học */}
      {totalStudying === 0 && (
        <div className="learning-card" style={{ marginTop: 18, borderLeft: "4px solid #f59e0b" }}>
          <div className="learning-card-head">
            <div className="learning-actions">
              <span className="learning-icon amber">
                <i className="bi bi-lightbulb" />
              </span>
              <div>
                <strong>Sổ tay trống</strong>
                <p className="vocab-muted">
                  Hãy tra từ và thêm vào sổ tay để bắt đầu ôn tập.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal chọn bộ */}
      {pendingMode && (
        <StudyModeModal
          mode={pendingMode}
          collections={collections}
          vocabularies={vocabularies}
          onConfirm={handleConfirm}
          onClose={() => setPendingMode(null)}
        />
      )}
    </section>
  );
};

export default StudySelection;



// import React, { useMemo, useState } from "react";

// // ──────────────────────────────────────────────────────────────
// // Modal chọn bộ từ trước khi học
// // ──────────────────────────────────────────────────────────────
// const StudyModeModal = ({ mode, collections, vocabularies, onConfirm, onClose }) => {
//   const [selectedCollectionId, setSelectedCollectionId] = useState("all");

//   const modeInfo = mode === "flashcard"
//     ? { label: "Flashcard", icon: "bi-card-text", color: "#6d35c5" }
//     : { label: "Trắc nghiệm Quiz", icon: "bi-ui-checks", color: "#0b57c5" };

//   // Đếm số từ "Đang học" theo từng bộ
//   const countStudying = (colId) => {
//     if (colId === "all") return vocabularies.filter((w) => w.status === "Đang học").length;
//     return vocabularies.filter((w) => w.collectionId === colId && w.status === "Đang học").length;
//   };

//   const totalSelected = countStudying(selectedCollectionId);

//   return (
//     <div className="learning-modal-backdrop">
//       <div className="learning-modal" style={{ maxWidth: 560 }}>
//         <div className="learning-modal-head">
//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             <span
//               className="learning-icon"
//               style={{ background: "#f1ecff", color: modeInfo.color, width: 38, height: 38 }}
//             >
//               <i className={`bi ${modeInfo.icon}`} />
//             </span>
//             <div>
//               <h2 className="exam-title" style={{ fontSize: "1.15rem" }}>
//                 Chọn bộ từ để học
//               </h2>
//               <p className="vocab-muted" style={{ margin: 0 }}>
//                 Chế độ: <strong>{modeInfo.label}</strong>
//               </p>
//             </div>
//           </div>
//           <button className="learning-btn ghost" onClick={onClose}>
//             <i className="bi bi-x-lg" />
//           </button>
//         </div>

//         <div className="learning-form">
//           <div style={{ display: "grid", gap: 8, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
//             {/* Tất cả */}
//             <label
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 12,
//                 padding: "11px 14px",
//                 border: `2px solid ${selectedCollectionId === "all" ? "#0b57c5" : "#d6deeb"}`,
//                 borderRadius: 8,
//                 cursor: "pointer",
//                 background: selectedCollectionId === "all" ? "#e9f0ff" : "#fff",
//                 transition: "all 0.15s",
//               }}
//             >
//               <input
//                 type="radio"
//                 name="study-collection"
//                 value="all"
//                 checked={selectedCollectionId === "all"}
//                 onChange={() => setSelectedCollectionId("all")}
//                 style={{ accentColor: "#0b57c5" }}
//               />
//               <span className="learning-icon" style={{ width: 32, height: 32, fontSize: "1rem" }}>
//                 <i className="bi bi-collection" />
//               </span>
//               <div style={{ flex: 1 }}>
//                 <strong style={{ color: "#10233f" }}>Tất cả bộ từ</strong>
//                 <p className="vocab-muted" style={{ fontSize: "0.82rem", margin: 0 }}>
//                   Ôn tập toàn bộ từ vựng đang học
//                 </p>
//               </div>
//               <span className="learning-badge">
//                 {countStudying("all")} từ
//               </span>
//             </label>

//             {/* Từng bộ */}
//             {collections.map((col) => {
//               const count = countStudying(col.id);
//               const isSelected = selectedCollectionId === col.id;
//               return (
//                 <label
//                   key={col.id}
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 12,
//                     padding: "11px 14px",
//                     border: `2px solid ${isSelected ? "#0b57c5" : "#d6deeb"}`,
//                     borderRadius: 8,
//                     cursor: count === 0 ? "not-allowed" : "pointer",
//                     background: isSelected ? "#e9f0ff" : count === 0 ? "#f8fafc" : "#fff",
//                     opacity: count === 0 ? 0.55 : 1,
//                     transition: "all 0.15s",
//                   }}
//                 >
//                   <input
//                     type="radio"
//                     name="study-collection"
//                     value={col.id}
//                     checked={isSelected}
//                     onChange={() => count > 0 && setSelectedCollectionId(col.id)}
//                     disabled={count === 0}
//                     style={{ accentColor: "#0b57c5" }}
//                   />
//                   <span
//                     className="learning-icon"
//                     style={{
//                       width: 32, height: 32, fontSize: "1rem",
//                       background: col.isUserCreated !== false ? "#f1ecff" : "#e9f0ff",
//                       color: col.isUserCreated !== false ? "#6d35c5" : "#0b57c5",
//                     }}
//                   >
//                     <i className={col.isUserCreated !== false ? "bi bi-folder2-open" : "bi bi-shield-check"} />
//                   </span>
//                   <div style={{ flex: 1 }}>
//                     <strong style={{ color: "#10233f" }}>{col.title}</strong>
//                     {col.description && (
//                       <p className="vocab-muted" style={{ fontSize: "0.82rem", margin: 0 }}>
//                         {col.description}
//                       </p>
//                     )}
//                   </div>
//                   <span className={`learning-badge ${count === 0 ? "" : "green"}`}>
//                     {count} từ
//                   </span>
//                 </label>
//               );
//             })}
//           </div>

//           {/* Tóm tắt */}
//           {totalSelected > 0 ? (
//             <div className="exam-explanation" style={{ margin: "8px 0 0" }}>
//               <strong><i className="bi bi-info-circle" /> Sẵn sàng!</strong>
//               <p style={{ margin: "6px 0 0", fontSize: "0.88rem" }}>
//                 Sẽ ôn <strong>{totalSelected} từ</strong> có trạng thái "Đang học" trong bộ đã chọn.
//               </p>
//             </div>
//           ) : (
//             <div
//               style={{
//                 marginTop: 8, padding: "10px 14px", borderRadius: 8,
//                 background: "#fff3d6", color: "#a15c00", fontSize: "0.88rem",
//               }}
//             >
//               <i className="bi bi-exclamation-triangle" /> Bộ này không có từ nào "Đang học".
//             </div>
//           )}

//           <div className="learning-actions" style={{ justifyContent: "flex-end" }}>
//             <button className="learning-btn" type="button" onClick={onClose}>
//               Hủy
//             </button>
//             <button
//               className="learning-btn primary"
//               type="button"
//               disabled={totalSelected === 0}
//               onClick={() => onConfirm(mode, selectedCollectionId)}
//             >
//               <i className={`bi ${modeInfo.icon}`} />
//               Bắt đầu {modeInfo.label}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ──────────────────────────────────────────────────────────────
// // StudySelection (main)
// // ──────────────────────────────────────────────────────────────
// const StudySelection = ({ collections, vocabularies = [], onStartStudy }) => {
//   const [pendingMode, setPendingMode] = useState(null); // "flashcard" | "quiz"

//   const handleSelectMode = (mode) => {
//     setPendingMode(mode);
//   };

//   const handleConfirm = (mode, collectionId) => {
//     setPendingMode(null);
//     onStartStudy(mode, collectionId);
//   };

//   const totalStudying = vocabularies.filter((w) => w.status === "Đang học").length;

//   return (
//     <section>
//       <div className="learning-section-heading" style={{ marginBottom: 18 }}>
//         <div>
//           <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
//             Chọn chế độ ôn tập
//           </h2>
//           <p className="vocab-muted">
//             Sau khi chọn chế độ, bạn sẽ được chọn bộ từ muốn ôn.
//           </p>
//         </div>
//         <span className="learning-badge green">{totalStudying} từ đang học</span>
//       </div>

//       <div className="learning-grid cols-2">
//         {/* Flashcard */}
//         <article className="learning-card interactive" onClick={() => handleSelectMode("flashcard")}>
//           <div className="learning-card-head" style={{ marginBottom: 18 }}>
//             <span className="vocab-icon study">
//               <i className="bi bi-card-text" />
//             </span>
//             <span className="learning-badge">Ghi nhớ nhanh</span>
//           </div>
//           <h3 className="exam-title" style={{ fontSize: "1.25rem" }}>
//             Flashcard
//           </h3>
//           <p className="vocab-muted" style={{ marginTop: 8 }}>
//             Lật thẻ để xem nghĩa, ví dụ và tự đánh dấu đã ghi nhớ sau mỗi từ.
//             Có phát âm bằng giọng thật.
//           </p>
//           <button className="learning-btn primary" style={{ marginTop: 18 }} type="button">
//             Chọn bộ & bắt đầu <i className="bi bi-arrow-right" />
//           </button>
//         </article>

//         {/* Quiz */}
//         <article className="learning-card interactive" onClick={() => handleSelectMode("quiz")}>
//           <div className="learning-card-head" style={{ marginBottom: 18 }}>
//             <span className="vocab-icon">
//               <i className="bi bi-ui-checks" />
//             </span>
//             <span className="learning-badge amber">Kiểm tra chủ động</span>
//           </div>
//           <h3 className="exam-title" style={{ fontSize: "1.25rem" }}>
//             Trắc nghiệm
//           </h3>
//           <p className="vocab-muted" style={{ marginTop: 8 }}>
//             Chọn nghĩa đúng của từ với 4 đáp án, nhận phản hồi đúng sai ngay lập tức.
//           </p>
//           <button className="learning-btn primary" style={{ marginTop: 18 }} type="button">
//             Chọn bộ & bắt đầu <i className="bi bi-arrow-right" />
//           </button>
//         </article>
//       </div>

//       {/* Tips */}
//       {totalStudying === 0 && (
//         <div className="learning-card" style={{ marginTop: 18, borderLeft: "4px solid #f59e0b" }}>
//           <div className="learning-card-head">
//             <div className="learning-actions">
//               <span className="learning-icon amber">
//                 <i className="bi bi-lightbulb" />
//               </span>
//               <div>
//                 <strong>Sổ tay trống</strong>
//                 <p className="vocab-muted">
//                   Hãy tra từ và thêm vào sổ tay để bắt đầu ôn tập.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal chọn bộ */}
//       {pendingMode && (
//         <StudyModeModal
//           mode={pendingMode}
//           collections={collections}
//           vocabularies={vocabularies}
//           onConfirm={handleConfirm}
//           onClose={() => setPendingMode(null)}
//         />
//       )}
//     </section>
//   );
// };

// export default StudySelection;


// import React from "react";

// const StudySelection = ({ collections, selectedCollection, onStartStudy }) => {
//   const activeCollection = collections.find((collection) => collection.id === selectedCollection);

//   return (
//     <section>
//       <div className="learning-section-heading" style={{ marginBottom: 18 }}>
//         <div>
//           <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
//             Chọn chế độ ôn tập
//           </h2>
//           <p className="vocab-muted">
//             {activeCollection
//               ? `Đang ôn bộ ${activeCollection.title}.`
//               : "Hệ thống sẽ lấy các từ có trạng thái Đang học trong danh sách hiện tại."}
//           </p>
//         </div>
//         <span className="learning-badge green">Flashcard hoặc Quiz</span>
//       </div>

//       <div className="learning-grid cols-2">
//         <article className="learning-card interactive" onClick={() => onStartStudy("flashcard")}>
//           <div className="learning-card-head" style={{ marginBottom: 18 }}>
//             <span className="vocab-icon study">
//               <i className="bi bi-card-text" />
//             </span>
//             <span className="learning-badge">Ghi nhớ nhanh</span>
//           </div>
//           <h3 className="exam-title" style={{ fontSize: "1.25rem" }}>
//             Flashcard
//           </h3>
//           <p className="vocab-muted" style={{ marginTop: 8 }}>
//             Lật thẻ để xem nghĩa, ví dụ và tự đánh dấu đã ghi nhớ sau mỗi từ.
//           </p>
//           <button className="learning-btn primary" style={{ marginTop: 18 }} type="button">
//             Bắt đầu flashcard <i className="bi bi-arrow-right" />
//           </button>
//         </article>

//         <article className="learning-card interactive" onClick={() => onStartStudy("quiz")}>
//           <div className="learning-card-head" style={{ marginBottom: 18 }}>
//             <span className="vocab-icon">
//               <i className="bi bi-ui-checks" />
//             </span>
//             <span className="learning-badge amber">Kiểm tra chủ động</span>
//           </div>
//           <h3 className="exam-title" style={{ fontSize: "1.25rem" }}>
//             Trắc nghiệm
//           </h3>
//           <p className="vocab-muted" style={{ marginTop: 8 }}>
//             Chọn nghĩa đúng của từ với 4 đáp án, nhận phản hồi đúng sai ngay lập tức.
//           </p>
//           <button className="learning-btn primary" style={{ marginTop: 18 }} type="button">
//             Bắt đầu quiz <i className="bi bi-arrow-right" />
//           </button>
//         </article>
//       </div>
//     </section>
//   );
// };

// export default StudySelection;
