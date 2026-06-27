import React, { useEffect, useRef, useState } from "react";
import StudySummary from "./StudySummary";

// Resolve URL giống VocabularyList.jsx / VocabularyHub.jsx
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

const FlashcardMode = ({ studyList, onUpdateVocabStatus, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const currentWord = studyList[currentIndex];

  // Resolve audio URL an toàn
  const resolvedAudioUrl = resolveMediaUrl(currentWord?.audioUrl);
  const hasAudio = Boolean(resolvedAudioUrl);

  // Reset audio khi chuyển từ
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // Cập nhật src cho thẻ audio ẩn
      audioRef.current.src = resolvedAudioUrl || "";
    }
    setIsPlaying(false);
    setIsFlipped(false);
  }, [currentIndex, resolvedAudioUrl]);

  const playAudio = (e) => {
    e?.stopPropagation(); // Không lật thẻ khi bấm loa

    if (!resolvedAudioUrl) {
      // Fallback: dùng Web Speech API nếu không có file audio
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(currentWord?.word || "");
        u.lang = "en-US";
        u.rate = 0.85;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
      }
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      // Đảm bảo src được set đúng trước khi play
      if (audioRef.current.src !== resolvedAudioUrl) {
        audioRef.current.src = resolvedAudioUrl;
      }

      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio play failed:", err);
          setIsPlaying(false);
          // Fallback sang Speech API
          if ("speechSynthesis" in window) {
            const u = new SpeechSynthesisUtterance(currentWord?.word || "");
            u.lang = "en-US";
            u.rate = 0.85;
            speechSynthesis.cancel();
            speechSynthesis.speak(u);
          }
        });
    }
  };

  const handleNextItem = (known) => {
    if (known) {
      onUpdateVocabStatus(currentWord.id, "Đã thuộc");
      setKnownCount((prev) => prev + 1);
    }

    if (currentIndex < studyList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) return <StudySummary total={studyList.length} known={knownCount} onExit={onExit} />;

  return (
    <section className="flashcard-stage">
      {/* Header */}
      <div className="learning-section-heading" style={{ marginBottom: 18 }}>
        <button className="learning-btn" onClick={onExit}>
          <i className="bi bi-arrow-left" />
          Thoát
        </button>
        <div className="learning-actions">
          <div className="learning-progress" style={{ width: 160 }}>
            <span style={{ width: `${((currentIndex + 1) / studyList.length) * 100}%` }} />
          </div>
          <span className="learning-badge">
            {currentIndex + 1}/{studyList.length}
          </span>
          <span className="learning-badge green">{knownCount} đã nhớ</span>
        </div>
      </div>

      {/* Flashcard */}
      <div className="flashcard" onClick={() => setIsFlipped((prev) => !prev)}>
        <div className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}>
          {/* Mặt trước: Từ + phonetic + audio */}
          <div className="flashcard-face">
            <div style={{ width: "100%", textAlign: "center" }}>
              <span className="learning-badge">{currentWord.type || "Word"}</span>

              <h2 className="learning-title" style={{ fontSize: "2.6rem", marginTop: 18, marginBottom: 8 }}>
                {currentWord.word}
              </h2>

              {/* Phonetic + nút loa */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="learning-subtitle" style={{ fontSize: "1.1rem", margin: 0 }}>
                  {currentWord.phonetic}
                </p>

                {/* Nút loa luôn hiện — fallback sang TTS nếu không có file */}
                <button
                  className="learning-btn"
                  style={{
                    padding: "5px 10px",
                    borderColor: isPlaying ? "#0b57c5" : "#d6deeb",
                    background: isPlaying ? "#e9f0ff" : "#fff",
                    color: isPlaying ? "#0b57c5" : "#475569",
                  }}
                  onClick={playAudio}
                  title={isPlaying ? "Dừng phát âm" : "Nghe phát âm"}
                >
                  <i
                    className={`bi ${isPlaying ? "bi-volume-up-fill" : "bi-volume-up"}`}
                    style={{ fontSize: "1.1rem" }}
                  />
                </button>
              </div>

              {!hasAudio && (
                <p className="vocab-muted" style={{ fontSize: "0.82rem" }}>
                  (Phát âm bằng giọng tổng hợp)
                </p>
              )}

              <p className="vocab-muted" style={{ marginTop: 20 }}>
                Nhấp vào thẻ để lật mặt sau
              </p>
            </div>
          </div>

          {/* Mặt sau: Nghĩa + ví dụ */}
          <div className="flashcard-face flashcard-back">
            <div style={{ width: "100%" }}>
              {/* Nút loa ở mặt sau */}
              <div
                style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="learning-btn"
                  style={{ padding: "5px 12px", fontSize: "0.88rem" }}
                  onClick={playAudio}
                >
                  <i
                    className={`bi ${isPlaying ? "bi-volume-up-fill" : "bi-volume-up"}`}
                    style={{ color: "#0b57c5", marginRight: 6 }}
                  />
                  {isPlaying ? "Đang phát..." : "Nghe phát âm"}
                </button>
              </div>

              <h2 className="exam-title" style={{ fontSize: "1.8rem", textAlign: "center" }}>
                {currentWord.meaning}
              </h2>

              {(currentWord.exampleEn || currentWord.example) && (
                <div className="exam-passage" style={{ background: "#f8fafc", marginTop: 18, textAlign: "left" }}>
                  <strong style={{ fontSize: "0.78rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Ví dụ
                  </strong>
                  <p style={{ margin: "6px 0 0", fontStyle: "italic" }}>
                    "{currentWord.exampleEn || currentWord.example}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nút đánh giá */}
      <div className="learning-grid cols-2" style={{ marginTop: 18, opacity: isFlipped ? 1 : 0.45 }}>
        <button className="learning-btn danger-soft" onClick={() => handleNextItem(false)} disabled={!isFlipped}>
          <i className="bi bi-arrow-repeat" />
          Vẫn chưa thuộc
        </button>
        <button className="learning-btn success" onClick={() => handleNextItem(true)} disabled={!isFlipped}>
          <i className="bi bi-check2-circle" />
          Đã ghi nhớ
        </button>
      </div>

      {/* Audio element ẩn */}
      <audio
        ref={audioRef}
        src={resolvedAudioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        hidden
        preload="auto"
      />
    </section>
  );
};

export default FlashcardMode;



// import React, { useEffect, useRef, useState } from "react";
// import StudySummary from "./StudySummary";

// const FlashcardMode = ({ studyList, onUpdateVocabStatus, onExit }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isFlipped, setIsFlipped] = useState(false);
//   const [knownCount, setKnownCount] = useState(0);
//   const [isFinished, setIsFinished] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const audioRef = useRef(null);

//   const currentWord = studyList[currentIndex];

//   // Reset audio khi chuyển từ
//   useEffect(() => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//     }
//     setIsPlaying(false);
//     setIsFlipped(false);
//   }, [currentIndex]);

//   const playAudio = (e) => {
//     e?.stopPropagation(); // Không lật thẻ khi bấm loa
//     const audioUrl = currentWord?.audioUrl;
//     if (!audioUrl) return;

//     if (audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//         setIsPlaying(false);
//         return;
//       }
//       audioRef.current.src = audioUrl;
//       audioRef.current
//         .play()
//         .then(() => setIsPlaying(true))
//         .catch(() => setIsPlaying(false));
//     } else {
//       // Fallback nếu không dùng ref
//       new Audio(audioUrl).play().catch(() => {});
//     }
//   };

//   const handleNextItem = (known) => {
//     if (known) {
//       onUpdateVocabStatus(currentWord.id, "Đã thuộc");
//       setKnownCount((prev) => prev + 1);
//     }

//     if (currentIndex < studyList.length - 1) {
//       setCurrentIndex((prev) => prev + 1);
//     } else {
//       setIsFinished(true);
//     }
//   };

//   if (isFinished) return <StudySummary total={studyList.length} known={knownCount} onExit={onExit} />;

//   const hasAudio = Boolean(currentWord?.audioUrl);

//   return (
//     <section className="flashcard-stage">
//       {/* Header */}
//       <div className="learning-section-heading" style={{ marginBottom: 18 }}>
//         <button className="learning-btn" onClick={onExit}>
//           <i className="bi bi-arrow-left" />
//           Thoát
//         </button>
//         <div className="learning-actions">
//           <div className="learning-progress" style={{ width: 160 }}>
//             <span style={{ width: `${((currentIndex + 1) / studyList.length) * 100}%` }} />
//           </div>
//           <span className="learning-badge">
//             {currentIndex + 1}/{studyList.length}
//           </span>
//           <span className="learning-badge green">{knownCount} đã nhớ</span>
//         </div>
//       </div>

//       {/* Flashcard */}
//       <div className="flashcard" onClick={() => setIsFlipped((prev) => !prev)}>
//         <div className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}>
//           {/* Mặt trước: Từ + phonetic + audio */}
//           <div className="flashcard-face">
//             <div style={{ width: "100%", textAlign: "center" }}>
//               <span className="learning-badge">{currentWord.type}</span>

//               <h2 className="learning-title" style={{ fontSize: "2.6rem", marginTop: 18, marginBottom: 8 }}>
//                 {currentWord.word}
//               </h2>

//               {/* Phonetic + nút loa */}
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   gap: 10,
//                   marginBottom: 16,
//                 }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <p className="learning-subtitle" style={{ fontSize: "1.1rem", margin: 0 }}>
//                   {currentWord.phonetic}
//                 </p>

//                 {hasAudio && (
//                   <button
//                     className="learning-btn"
//                     style={{
//                       padding: "5px 10px",
//                       borderColor: isPlaying ? "#0b57c5" : "#d6deeb",
//                       background: isPlaying ? "#e9f0ff" : "#fff",
//                       color: isPlaying ? "#0b57c5" : "#475569",
//                     }}
//                     onClick={playAudio}
//                     title={isPlaying ? "Dừng phát âm" : "Nghe phát âm"}
//                   >
//                     <i
//                       className={`bi ${isPlaying ? "bi-volume-up-fill" : "bi-volume-up"}`}
//                       style={{ fontSize: "1.1rem" }}
//                     />
//                   </button>
//                 )}
//               </div>

//               {!hasAudio && (
//                 <p className="vocab-muted" style={{ fontSize: "0.82rem" }}>
//                   (Không có audio)
//                 </p>
//               )}

//               <p className="vocab-muted" style={{ marginTop: 20 }}>
//                 Nhấp vào thẻ để lật mặt sau
//               </p>
//             </div>
//           </div>

//           {/* Mặt sau: Nghĩa + ví dụ */}
//           <div className="flashcard-face flashcard-back">
//             <div style={{ width: "100%" }}>
//               {/* Nút loa ở mặt sau */}
//               {hasAudio && (
//                 <div
//                   style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <button
//                     className="learning-btn"
//                     style={{ padding: "5px 12px", fontSize: "0.88rem" }}
//                     onClick={playAudio}
//                   >
//                     <i
//                       className={`bi ${isPlaying ? "bi-volume-up-fill" : "bi-volume-up"}`}
//                       style={{ color: "#0b57c5", marginRight: 6 }}
//                     />
//                     {isPlaying ? "Đang phát..." : "Nghe phát âm"}
//                   </button>
//                 </div>
//               )}

//               <h2 className="exam-title" style={{ fontSize: "1.8rem", textAlign: "center" }}>
//                 {currentWord.meaning}
//               </h2>

//               {currentWord.example && (
//                 <div className="exam-passage" style={{ background: "#f8fafc", marginTop: 18, textAlign: "left" }}>
//                   <strong style={{ fontSize: "0.78rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
//                     Ví dụ
//                   </strong>
//                   <p style={{ margin: "6px 0 0", fontStyle: "italic" }}>
//                     "{currentWord.example}"
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Nút đánh giá */}
//       <div className="learning-grid cols-2" style={{ marginTop: 18, opacity: isFlipped ? 1 : 0.45 }}>
//         <button className="learning-btn danger-soft" onClick={() => handleNextItem(false)} disabled={!isFlipped}>
//           <i className="bi bi-arrow-repeat" />
//           Vẫn chưa thuộc
//         </button>
//         <button className="learning-btn success" onClick={() => handleNextItem(true)} disabled={!isFlipped}>
//           <i className="bi bi-check2-circle" />
//           Đã ghi nhớ
//         </button>
//       </div>

//       <audio
//         ref={audioRef}
//         onEnded={() => setIsPlaying(false)}
//         onPause={() => setIsPlaying(false)}
//         hidden
//       />
//     </section>
//   );
// };

// export default FlashcardMode;