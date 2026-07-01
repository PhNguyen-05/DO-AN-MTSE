import React, { useEffect, useMemo, useState } from "react";
import { analyticsApi } from "../services/userApi";

const partLabels = {
  1: "Mô tả tranh",
  2: "Hỏi đáp",
  3: "Hội thoại ngắn",
  4: "Bài nói ngắn",
  5: "Điền từ vào câu",
  6: "Điền đoạn văn",
  7: "Đọc hiểu",
};

const percent = (current, target) =>
  Math.min(100, Math.round((current / Math.max(target, 1)) * 100));

const UserAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    targetScore: 850,
    targetExams: 30,
    targetVocab: 1000,
    deadline: "2026-12-31",
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsApi.get();
        setAnalytics(data);
        if (data.learningGoal) {
          setGoalForm({
            targetScore: data.learningGoal.targetScore || 850,
            targetExams: data.learningGoal.targetExams || 30,
            targetVocab: data.learningGoal.targetVocab || 1000,
            deadline: data.learningGoal.deadline || "2026-12-31",
          });
        }
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const weakParts = useMemo(() => {
    if (!analytics) return [];
    return Object.entries(analytics.accuracyByPart || {})
      .filter(([, value]) => value < 60)
      .map(([part, value]) => ({
        part: Number(part),
        value,
        label: partLabels[part],
      }));
  }, [analytics]);

  const [goalSaving, setGoalSaving] = useState(false);
  const [goalMsg,    setGoalMsg]    = useState(null); // { type: "ok"|"err", text }

  const handleSaveGoal = async (event) => {
    event.preventDefault();
    setGoalSaving(true);
    setGoalMsg(null);
    const payload = {
      targetScore: Number(goalForm.targetScore),
      targetExams: Number(goalForm.targetExams),
      targetVocab: Number(goalForm.targetVocab),
      deadline:    goalForm.deadline,
    };
    try {
      await analyticsApi.saveGoal(payload);
      // Cập nhật local state để UI phản ánh ngay
      setAnalytics((prev) => ({
        ...prev,
        learningGoal: { ...prev.learningGoal, ...payload },
      }));
      setGoalMsg({ type: "ok", text: "Đã lưu mục tiêu thành công!" });
      setTimeout(() => { setShowGoalModal(false); setGoalMsg(null); }, 900);
    } catch {
      setGoalMsg({ type: "err", text: "Không thể lưu, vui lòng thử lại." });
    } finally {
      setGoalSaving(false);
    }
  };


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setGoalForm((prev) => ({ ...prev, [name]: value }));
  };

  const renderLineChart = () => {
    const data = analytics.recentScores || [];
    if (!data.length) {
      return (
        <div className="learning-empty" style={{ minHeight: 200 }}>
          <p className="vocab-muted">Chưa có dữ liệu điểm số.</p>
        </div>
      );
    }

    const width = 760;
    const height = 250;
    const paddingX = 46;
    const paddingY = 34;
    const maxScore = 990;
    const points = data
      .map((item, index) => {
        const x =
          paddingX + index * ((width - paddingX * 2) / Math.max(data.length - 1, 1));
        const y =
          height - paddingY - (item.score / maxScore) * (height - paddingY * 2);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="analytics-chart">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ điểm gần đây">
          {[0, 330, 660, 990].map((score) => {
            const y =
              height - paddingY - (score / maxScore) * (height - paddingY * 2);
            return (
              <g key={score}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#e5ebf4"
                  strokeWidth="1.5"
                />
                <text x={paddingX - 12} y={y + 4} fill="#64748b" fontSize="12" textAnchor="end">
                  {score}
                </text>
              </g>
            );
          })}
          {data.length > 1 && (
            <polyline
              fill="none"
              stroke="#0b57c5"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          )}
          {data.map((item, index) => {
            const x =
              paddingX +
              index * ((width - paddingX * 2) / Math.max(data.length - 1, 1));
            const y =
              height - paddingY - (item.score / maxScore) * (height - paddingY * 2);
            return (
              <g key={`${item.date}-${index}`}>
                <circle cx={x} cy={y} r="6" fill="#fff" stroke="#0b57c5" strokeWidth="3" />
                <text
                  x={x}
                  y={y - 14}
                  fill="#10233f"
                  fontSize="13"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {item.score}
                </text>
                <text
                  x={x}
                  y={height - 10}
                  fill="#64748b"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {item.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <span className="learning-spinner" />
          <p className="learning-subtitle" style={{ marginTop: 14 }}>
            Đang tổng hợp dữ liệu học tập...
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

  const { overview, learningGoal, accuracyByPart, weeklyStudy } = analytics;
  const scoreProgress = percent(learningGoal.currentBestScore, learningGoal.targetScore);
  const examProgress = percent(overview.totalExamsCompleted, learningGoal.targetExams);
  const vocabProgress = percent(overview.vocabLearned, learningGoal.targetVocab);

  return (
    <div className="learning-page">
      <header className="learning-header">
        <div className="learning-header-inner">
          <div className="learning-title-row">
            <div>
              <p className="learning-kicker">User Analytics</p>
              <h1 className="learning-title">Thống kê tiến độ học tập</h1>
              <p className="learning-subtitle">
                Đang hướng tới mốc {learningGoal.targetScore}+ điểm TOEIC.
              </p>
            </div>
            <button className="learning-btn primary" onClick={() => setShowGoalModal(true)}>
              <i className="bi bi-bullseye" />
              Đặt mục tiêu
            </button>
          </div>
        </div>
      </header>

      <main className="learning-shell">
        {/* Tổng quan */}
        <section className="learning-grid cols-4">
          <article className="learning-card">
            <span className="learning-icon">
              <i className="bi bi-file-earmark-check" />
            </span>
            <strong className="learning-stat-value">{overview.totalExamsCompleted}</strong>
            <span className="learning-stat-label">Đề đã hoàn thành</span>
          </article>
          <article className="learning-card">
            <span className="learning-icon green">
              <i className="bi bi-trophy" />
            </span>
            <strong className="learning-stat-value">{overview.averageScore}</strong>
            <span className="learning-stat-label">Điểm trung bình / 990</span>
          </article>
          <article className="learning-card">
            <span className="learning-icon amber">
              <i className="bi bi-hourglass-split" />
            </span>
            <strong className="learning-stat-value">{overview.totalStudyHours}h</strong>
            <span className="learning-stat-label">Số giờ học tích lũy</span>
          </article>
          <article className="learning-card">
            <span className="learning-icon violet">
              <i className="bi bi-journal-bookmark" />
            </span>
            <strong className="learning-stat-value">{overview.vocabLearned}</strong>
            <span className="learning-stat-label">Từ vựng đã thuộc</span>
          </article>
        </section>

        {/* Biểu đồ + Mục tiêu */}
        <section
          className="learning-grid"
          style={{
            gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.65fr)",
            marginTop: 18,
          }}
        >
          <article className="learning-card">
            <div className="learning-section-heading" style={{ marginBottom: 14 }}>
              <div>
                <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
                  Biểu đồ tăng trưởng điểm
                </h2>
                <p className="vocab-muted">6 lần luyện đề gần nhất</p>
              </div>
              <span className="learning-badge green">
                Best {learningGoal.currentBestScore}
              </span>
            </div>
            {renderLineChart()}
          </article>

          <article className="learning-card analytics-goal-card">
            <div className="learning-card-head">
              <div>
                <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
                  Tiến độ mục tiêu
                </h2>
                <p className="vocab-muted">
                  Deadline{" "}
                  {learningGoal.deadline
                    ? new Date(learningGoal.deadline).toLocaleDateString("vi-VN")
                    : "Chưa đặt"}
                </p>
              </div>
              <i className="bi bi-flag-fill" style={{ color: "#0b57c5" }} />
            </div>

            {[
              {
                label: "Điểm số",
                current: learningGoal.currentBestScore,
                target: learningGoal.targetScore,
                progress: scoreProgress,
                tone: "green",
              },
              {
                label: "Luyện đề",
                current: overview.totalExamsCompleted,
                target: learningGoal.targetExams,
                progress: examProgress,
                tone: "amber",
              },
              {
                label: "Từ vựng",
                current: overview.vocabLearned,
                target: learningGoal.targetVocab,
                progress: vocabProgress,
                tone: "",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="learning-card-head" style={{ marginBottom: 8 }}>
                  <strong>{item.label}</strong>
                  <span>
                    {item.current}/{item.target}
                  </span>
                </div>
                <div className="learning-progress">
                  <span className={item.tone} style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </article>
        </section>

        {/* Accuracy theo Part + Nhịp học */}
        <section className="learning-grid cols-2" style={{ marginTop: 18 }}>
          <article className="learning-card">
            <div className="learning-section-heading" style={{ marginBottom: 16 }}>
              <div>
                <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
                  Accuracy theo Part
                </h2>
                <p className="vocab-muted">Tổng hợp từ tất cả lần làm bài</p>
              </div>
              <span className={`learning-badge ${weakParts.length ? "red" : "green"}`}>
                {weakParts.length ? `${weakParts.length} kỹ năng yếu` : "Ổn định"}
              </span>
            </div>

            {Object.keys(accuracyByPart || {}).length === 0 ? (
              <p className="vocab-muted">Chưa có dữ liệu. Hãy hoàn thành ít nhất 1 bài thi.</p>
            ) : (
              <div className="analytics-bars">
                {Object.entries(accuracyByPart).map(([part, value]) => {
                  const isWeak = value < 60;
                  return (
                    <div key={part} className="analytics-part-row">
                      <strong>Part {part}</strong>
                      <div>
                        <div className="learning-card-head" style={{ marginBottom: 6 }}>
                          <span className="vocab-muted">{partLabels[part]}</span>
                          {isWeak && (
                            <span className="learning-badge red">Cần ưu tiên</span>
                          )}
                        </div>
                        <div className="learning-progress">
                          <span
                            className={
                              isWeak ? "red" : value >= 75 ? "green" : "amber"
                            }
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                      <strong>{value}%</strong>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          <article className="learning-card">
            <div className="learning-section-heading" style={{ marginBottom: 16 }}>
              <div>
                <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
                  Nhịp học tuần này
                </h2>
                <p className="vocab-muted">Số giờ học mỗi ngày</p>
              </div>
              <span className="learning-badge amber">
                {overview.streakDays} ngày streak
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "end", gap: 12, minHeight: 220 }}>
              {(weeklyStudy || []).map((day) => (
                <div
                  key={day.day}
                  style={{ display: "grid", gap: 8, flex: 1, textAlign: "center" }}
                >
                  <div
                    title={`${day.hours} giờ`}
                    style={{
                      height: `${Math.max(18, day.hours * 58)}px`,
                      borderRadius: 6,
                      background: day.hours >= 2 ? "#16a34a" : "#0b57c5",
                    }}
                  />
                  <small className="vocab-muted">{day.day}</small>
                </div>
              ))}
            </div>

            {weakParts.length > 0 && (
              <div className="exam-explanation" style={{ marginTop: 16 }}>
                <strong>
                  <i className="bi bi-exclamation-triangle" /> Kỹ năng nên ưu tiên
                </strong>
                <p style={{ margin: "8px 0 0" }}>
                  Tập trung{" "}
                  {weakParts.map((item) => `Part ${item.part} (${item.label})`).join(", ")}{" "}
                  trong 7 ngày tới.
                </p>
              </div>
            )}
          </article>
        </section>
      </main>

      {/* Modal đặt mục tiêu */}
      {showGoalModal && (
        <div className="learning-modal-backdrop">
          <div className="learning-modal">
            <div className="learning-modal-head">
              <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
                Đặt mục tiêu học tập
              </h2>
              <button
                className="learning-btn ghost"
                onClick={() => setShowGoalModal(false)}
                title="Đóng"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form className="learning-form" onSubmit={handleSaveGoal}>
              <div className="learning-field">
                <label>Điểm TOEIC mục tiêu</label>
                <input
                  className="learning-input"
                  type="number"
                  name="targetScore"
                  min="10"
                  max="990"
                  step="5"
                  value={goalForm.targetScore}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="learning-form-grid">
                <div className="learning-field">
                  <label>Số đề cần hoàn thành</label>
                  <input
                    className="learning-input"
                    type="number"
                    name="targetExams"
                    min="1"
                    value={goalForm.targetExams}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="learning-field">
                  <label>Số từ vựng cần học</label>
                  <input
                    className="learning-input"
                    type="number"
                    name="targetVocab"
                    min="10"
                    value={goalForm.targetVocab}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="learning-field">
                <label>Thời hạn hoàn thành</label>
                <input
                  className="learning-input"
                  type="date"
                  name="deadline"
                  value={goalForm.deadline}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="learning-actions" style={{ justifyContent: "flex-end", flexDirection: "column", gap: 10 }}>
                {goalMsg && (
                  <div style={{
                    padding: "8px 14px", borderRadius: 8, fontSize: "0.88rem", fontWeight: 600,
                    background: goalMsg.type === "ok" ? "#eaf8ef" : "#fff0f0",
                    color:      goalMsg.type === "ok" ? "#087443" : "#b42318",
                    border:     `1px solid ${goalMsg.type === "ok" ? "#86efac" : "#fca5a5"}`,
                    textAlign: "center",
                  }}>
                    <i className={`bi bi-${goalMsg.type === "ok" ? "check-circle" : "exclamation-circle"}`} style={{ marginRight: 6 }} />
                    {goalMsg.text}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    className="learning-btn"
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    disabled={goalSaving}
                  >
                    Hủy
                  </button>
                  <button className="learning-btn primary" type="submit" disabled={goalSaving}>
                    {goalSaving
                      ? <><i className="bi bi-hourglass-split" /> Đang lưu...</>
                      : <><i className="bi bi-check2" /> Lưu mục tiêu</>
                    }
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalytics;





// import React, { useEffect, useMemo, useState } from "react";
// import { mockAnalytics } from "../data/learningMockData";

// const partLabels = {
//   1: "Mô tả tranh",
//   2: "Hỏi đáp",
//   3: "Hội thoại ngắn",
//   4: "Bài nói ngắn",
//   5: "Điền từ vào câu",
//   6: "Điền đoạn văn",
//   7: "Đọc hiểu",
// };

// const percent = (current, target) => Math.min(100, Math.round((current / Math.max(target, 1)) * 100));

// const UserAnalytics = () => {
//   const user = { name: "Nguyễn Văn A", account_type: "Premium" };
//   const [analytics, setAnalytics] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showGoalModal, setShowGoalModal] = useState(false);
//   const [goalForm, setGoalForm] = useState({
//     targetScore: 850,
//     targetExams: 30,
//     targetVocab: 1000,
//     deadline: "2026-12-31",
//   });

//   useEffect(() => {
//     const timer = window.setTimeout(() => {
//       setAnalytics(mockAnalytics);
//       setGoalForm({
//         targetScore: mockAnalytics.learningGoal.targetScore,
//         targetExams: mockAnalytics.learningGoal.targetExams,
//         targetVocab: mockAnalytics.learningGoal.targetVocab,
//         deadline: mockAnalytics.learningGoal.deadline,
//       });
//       setLoading(false);
//     }, 600);

//     return () => window.clearTimeout(timer);
//   }, []);

//   const weakParts = useMemo(() => {
//     if (!analytics) return [];
//     return Object.entries(analytics.accuracyByPart)
//       .filter(([, value]) => value < 60)
//       .map(([part, value]) => ({ part: Number(part), value, label: partLabels[part] }));
//   }, [analytics]);

//   const handleSaveGoal = (event) => {
//     event.preventDefault();
//     setAnalytics((prev) => ({
//       ...prev,
//       learningGoal: {
//         ...prev.learningGoal,
//         targetScore: Number(goalForm.targetScore),
//         targetExams: Number(goalForm.targetExams),
//         targetVocab: Number(goalForm.targetVocab),
//         deadline: goalForm.deadline,
//       },
//     }));
//     setShowGoalModal(false);
//   };

//   const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     setGoalForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const renderLineChart = () => {
//     const data = analytics.recentScores;
//     const width = 760;
//     const height = 250;
//     const paddingX = 46;
//     const paddingY = 34;
//     const maxScore = 990;
//     const points = data
//       .map((item, index) => {
//         const x = paddingX + index * ((width - paddingX * 2) / (data.length - 1));
//         const y = height - paddingY - (item.score / maxScore) * (height - paddingY * 2);
//         return `${x},${y}`;
//       })
//       .join(" ");

//     return (
//       <div className="analytics-chart">
//         <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ điểm gần đây">
//           {[0, 330, 660, 990].map((score) => {
//             const y = height - paddingY - (score / maxScore) * (height - paddingY * 2);
//             return (
//               <g key={score}>
//                 <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e5ebf4" strokeWidth="1.5" />
//                 <text x={paddingX - 12} y={y + 4} fill="#64748b" fontSize="12" textAnchor="end">
//                   {score}
//                 </text>
//               </g>
//             );
//           })}
//           <polyline fill="none" stroke="#0b57c5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points} />
//           {data.map((item, index) => {
//             const x = paddingX + index * ((width - paddingX * 2) / (data.length - 1));
//             const y = height - paddingY - (item.score / maxScore) * (height - paddingY * 2);
//             return (
//               <g key={item.date}>
//                 <circle cx={x} cy={y} r="6" fill="#fff" stroke="#0b57c5" strokeWidth="3" />
//                 <text x={x} y={y - 14} fill="#10233f" fontSize="13" fontWeight="700" textAnchor="middle">
//                   {item.score}
//                 </text>
//                 <text x={x} y={height - 10} fill="#64748b" fontSize="12" textAnchor="middle">
//                   {item.date}
//                 </text>
//               </g>
//             );
//           })}
//         </svg>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="learning-page">
//         <div className="learning-shell learning-empty">
//           <span className="learning-spinner" />
//           <p className="learning-subtitle" style={{ marginTop: 14 }}>
//             Đang tổng hợp dữ liệu học tập...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const { overview, learningGoal, accuracyByPart, weeklyStudy } = analytics;
//   const scoreProgress = percent(learningGoal.currentBestScore, learningGoal.targetScore);
//   const examProgress = percent(overview.totalExamsCompleted, learningGoal.targetExams);
//   const vocabProgress = percent(overview.vocabLearned, learningGoal.targetVocab);

//   return (
//     <div className="learning-page">
//       <header className="learning-header">
//         <div className="learning-header-inner">
//           <div className="learning-title-row">
//             <div>
//               <p className="learning-kicker">User Analytics</p>
//               <h1 className="learning-title">Thống kê tiến độ học tập</h1>
//               <p className="learning-subtitle">
//                 Xin chào {user.name}. Tài khoản {user.account_type} đang hướng tới mốc {learningGoal.targetScore}+.
//               </p>
//             </div>
//             <button className="learning-btn primary" onClick={() => setShowGoalModal(true)}>
//               <i className="bi bi-bullseye" />
//               Đặt mục tiêu
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="learning-shell">
//         <section className="learning-grid cols-4">
//           <article className="learning-card">
//             <span className="learning-icon">
//               <i className="bi bi-file-earmark-check" />
//             </span>
//             <strong className="learning-stat-value">{overview.totalExamsCompleted}</strong>
//             <span className="learning-stat-label">Đề đã hoàn thành</span>
//           </article>
//           <article className="learning-card">
//             <span className="learning-icon green">
//               <i className="bi bi-trophy" />
//             </span>
//             <strong className="learning-stat-value">{overview.averageScore}</strong>
//             <span className="learning-stat-label">Điểm trung bình / 990</span>
//           </article>
//           <article className="learning-card">
//             <span className="learning-icon amber">
//               <i className="bi bi-hourglass-split" />
//             </span>
//             <strong className="learning-stat-value">{overview.totalStudyHours}h</strong>
//             <span className="learning-stat-label">Số giờ học tích lũy</span>
//           </article>
//           <article className="learning-card">
//             <span className="learning-icon violet">
//               <i className="bi bi-journal-bookmark" />
//             </span>
//             <strong className="learning-stat-value">{overview.vocabLearned}</strong>
//             <span className="learning-stat-label">Từ vựng đã học</span>
//           </article>
//         </section>

//         <section className="learning-grid" style={{ gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.65fr)", marginTop: 18 }}>
//           <article className="learning-card">
//             <div className="learning-section-heading" style={{ marginBottom: 14 }}>
//               <div>
//                 <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
//                   Biểu đồ tăng trưởng điểm
//                 </h2>
//                 <p className="vocab-muted">6 lần luyện đề gần nhất</p>
//               </div>
//               <span className="learning-badge green">Best {learningGoal.currentBestScore}</span>
//             </div>
//             {renderLineChart()}
//           </article>

//           <article className="learning-card analytics-goal-card">
//             <div className="learning-card-head">
//               <div>
//                 <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
//                   Tiến độ mục tiêu
//                 </h2>
//                 <p className="vocab-muted">
//                   Deadline {new Date(learningGoal.deadline).toLocaleDateString("vi-VN")}
//                 </p>
//               </div>
//               <i className="bi bi-flag-fill" style={{ color: "#0b57c5" }} />
//             </div>

//             {[
//               { label: "Điểm số", current: learningGoal.currentBestScore, target: learningGoal.targetScore, progress: scoreProgress, tone: "green" },
//               { label: "Luyện đề", current: overview.totalExamsCompleted, target: learningGoal.targetExams, progress: examProgress, tone: "amber" },
//               { label: "Từ vựng", current: overview.vocabLearned, target: learningGoal.targetVocab, progress: vocabProgress, tone: "" },
//             ].map((item) => (
//               <div key={item.label}>
//                 <div className="learning-card-head" style={{ marginBottom: 8 }}>
//                   <strong>{item.label}</strong>
//                   <span>
//                     {item.current}/{item.target}
//                   </span>
//                 </div>
//                 <div className="learning-progress">
//                   <span className={item.tone} style={{ width: `${item.progress}%` }} />
//                 </div>
//               </div>
//             ))}
//           </article>
//         </section>

//         <section className="learning-grid cols-2" style={{ marginTop: 18 }}>
//           <article className="learning-card">
//             <div className="learning-section-heading" style={{ marginBottom: 16 }}>
//               <div>
//                 <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
//                   Accuracy theo Part
//                 </h2>
//                 <p className="vocab-muted">Backend cần trả đúng tỷ lệ Part 1 đến Part 7</p>
//               </div>
//               <span className={`learning-badge ${weakParts.length ? "red" : "green"}`}>
//                 {weakParts.length ? `${weakParts.length} kỹ năng yếu` : "Ổn định"}
//               </span>
//             </div>

//             <div className="analytics-bars">
//               {Object.entries(accuracyByPart).map(([part, value]) => {
//                 const isWeak = value < 60;
//                 return (
//                   <div key={part} className="analytics-part-row">
//                     <strong>Part {part}</strong>
//                     <div>
//                       <div className="learning-card-head" style={{ marginBottom: 6 }}>
//                         <span className="vocab-muted">{partLabels[part]}</span>
//                         {isWeak && <span className="learning-badge red">Cần ưu tiên</span>}
//                       </div>
//                       <div className="learning-progress">
//                         <span className={isWeak ? "red" : value >= 75 ? "green" : "amber"} style={{ width: `${value}%` }} />
//                       </div>
//                     </div>
//                     <strong>{value}%</strong>
//                   </div>
//                 );
//               })}
//             </div>
//           </article>

//           <article className="learning-card">
//             <div className="learning-section-heading" style={{ marginBottom: 16 }}>
//               <div>
//                 <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
//                   Nhịp học tuần này
//                 </h2>
//                 <p className="vocab-muted">Dữ liệu mẫu theo số giờ học mỗi ngày</p>
//               </div>
//               <span className="learning-badge amber">{overview.streakDays} ngày streak</span>
//             </div>
//             <div style={{ display: "flex", alignItems: "end", gap: 12, minHeight: 220 }}>
//               {weeklyStudy.map((day) => (
//                 <div key={day.day} style={{ display: "grid", gap: 8, flex: 1, textAlign: "center" }}>
//                   <div
//                     title={`${day.hours} giờ`}
//                     style={{
//                       height: `${Math.max(18, day.hours * 58)}px`,
//                       borderRadius: 6,
//                       background: day.hours >= 2 ? "#16a34a" : "#0b57c5",
//                     }}
//                   />
//                   <small className="vocab-muted">{day.day}</small>
//                 </div>
//               ))}
//             </div>
//             {weakParts.length > 0 && (
//               <div className="exam-explanation">
//                 <strong>
//                   <i className="bi bi-exclamation-triangle" /> Kỹ năng nên ưu tiên
//                 </strong>
//                 <p style={{ margin: "8px 0 0" }}>
//                   Tập trung {weakParts.map((item) => `Part ${item.part} (${item.label})`).join(", ")} trong 7 ngày tới.
//                 </p>
//               </div>
//             )}
//           </article>
//         </section>
//       </main>

//       {showGoalModal && (
//         <div className="learning-modal-backdrop">
//           <div className="learning-modal">
//             <div className="learning-modal-head">
//               <h2 className="exam-title" style={{ fontSize: "1.25rem" }}>
//                 Đặt mục tiêu học tập
//               </h2>
//               <button className="learning-btn ghost" onClick={() => setShowGoalModal(false)} title="Đóng">
//                 <i className="bi bi-x-lg" />
//               </button>
//             </div>

//             <form className="learning-form" onSubmit={handleSaveGoal}>
//               <div className="learning-field">
//                 <label>Điểm TOEIC mục tiêu</label>
//                 <input
//                   className="learning-input"
//                   type="number"
//                   name="targetScore"
//                   min="10"
//                   max="990"
//                   step="5"
//                   value={goalForm.targetScore}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               <div className="learning-form-grid">
//                 <div className="learning-field">
//                   <label>Số đề cần hoàn thành</label>
//                   <input
//                     className="learning-input"
//                     type="number"
//                     name="targetExams"
//                     min="1"
//                     value={goalForm.targetExams}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div className="learning-field">
//                   <label>Số từ vựng cần học</label>
//                   <input
//                     className="learning-input"
//                     type="number"
//                     name="targetVocab"
//                     min="10"
//                     value={goalForm.targetVocab}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="learning-field">
//                 <label>Thời hạn hoàn thành</label>
//                 <input
//                   className="learning-input"
//                   type="date"
//                   name="deadline"
//                   value={goalForm.deadline}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               <div className="learning-actions" style={{ justifyContent: "flex-end" }}>
//                 <button className="learning-btn" type="button" onClick={() => setShowGoalModal(false)}>
//                   Hủy
//                 </button>
//                 <button className="learning-btn primary" type="submit">
//                   Lưu mục tiêu
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserAnalytics;
