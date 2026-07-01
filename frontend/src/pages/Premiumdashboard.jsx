import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { analyticsApi } from "../services/userApi";

const partLabels = {
  1: "Part 1 – Mô tả tranh",
  2: "Part 2 – Hỏi đáp",
  3: "Part 3 – Hội thoại",
  4: "Part 4 – Bài nói",
  5: "Part 5 – Điền từ",
  6: "Part 6 – Điền đoạn",
  7: "Part 7 – Đọc hiểu",
};

const s = {
  page: {
    background: "#f5f7fb",
    color: "#10233f",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    minHeight: "100vh",
    padding: "32px 0 60px",
  },
  shell: {
    width: "min(100% - 32px, 1120px)",
    margin: "0 auto",
    display: "grid",
    gap: 24,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5ebf4",
    borderRadius: 12,
    padding: "20px 22px",
    boxShadow: "0 2px 8px rgba(15,23,42,0.045)",
  },
  sectionLabel: {
    fontSize: "0.7rem",
    fontWeight: 750,
    color: "#185FA5",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    margin: "0 0 6px",
  },
  sectionTitle: {
    fontSize: "1.45rem",
    fontWeight: 850,
    color: "#10233f",
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  sectionSub: {
    fontSize: "0.88rem",
    color: "#64748b",
    margin: 0,
  },
};

/* ── Mini SVG Score Chart ── */
const ScoreChart = ({ scores }) => {
  if (!scores || scores.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: "0.85rem" }}>
        Chưa có dữ liệu điểm số
      </div>
    );
  }
  const maxScore = 990;
  const w = 520, h = 140, padX = 40, padY = 18;
  const points = scores.map((s, i) => {
    const x = padX + i * ((w - padX * 2) / Math.max(scores.length - 1, 1));
    const y = h - padY - (s.score / maxScore) * (h - padY * 2);
    return { x, y, ...s };
  });
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 130 }}>
      {[300, 600, 900].map((v) => {
        const y = h - padY - (v / maxScore) * (h - padY * 2);
        return (
          <g key={v}>
            <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="#e5ebf4" strokeWidth="1" />
            <text x={padX - 6} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{v}</text>
          </g>
        );
      })}
      {scores.length > 1 && (
        <polyline fill="none" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polyline} />
      )}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#185FA5" strokeWidth="2.5" />
          <text x={p.x} y={p.y - 10} fill="#0C447C" fontSize="11" fontWeight="700" textAnchor="middle">{p.score}</text>
          <text x={p.x} y={h - 3} fill="#94a3b8" fontSize="10" textAnchor="middle">{p.date}</text>
        </g>
      ))}
    </svg>
  );
};

/* ── Skeleton loader ── */
const Skeleton = ({ w = "100%", h = 20, r = 6, mb = 0 }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: "linear-gradient(90deg, #e5ebf4 25%, #f0f4f9 50%, #e5ebf4 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    marginBottom: mb,
  }} />
);

export default function PremiumDashboard() {
  const { user } = useSelector((state) => state.auth || {});
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const firstName = useMemo(() => {
    const name = user?.fullName || user?.name || "bạn";
    return name.split(" ").slice(-1)[0];
  }, [user]);

  const avatarLetter = useMemo(() => {
    const name = user?.fullName || user?.name || "?";
    return name.charAt(0).toUpperCase();
  }, [user]);

  useEffect(() => {
    analyticsApi.get()
      .then((data) => setAnalytics(data))
      .catch((err) => setError(err.message || "Không thể tải dữ liệu."))
      .finally(() => setLoading(false));
  }, []);

  const overview = analytics?.overview || {};
  const recentScores = analytics?.recentScores || [];
  const weeklyStudy = analytics?.weeklyStudy || [];
  const accuracyByPart = analytics?.accuracyByPart || {};
  const goal = analytics?.learningGoal || {};

  const bestScore = goal.currentBestScore || overview.averageScore || 0;
  const targetScore = goal.targetScore || 850;
  const scorePct = Math.min(100, Math.round((bestScore / targetScore) * 100));

  const partAccuracy = Object.entries(accuracyByPart).map(([part, value]) => ({
    label: partLabels[Number(part)] || `Part ${part}`,
    value,
    part: Number(part),
  })).sort((a, b) => a.part - b.part);

  const weakParts = partAccuracy.filter((p) => p.value < 65).map((p) => `Part ${p.part}`);

  const maxWeeklyHours = Math.max(...weeklyStudy.map((d) => d.hours), 0.5);

  const scoreImprovement = recentScores.length >= 2
    ? recentScores[recentScores.length - 1].score - recentScores[0].score
    : null;

  return (
    <div style={s.page}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={s.shell}>

        {/* ── HERO ── */}
        <div style={{
          ...s.card,
          background: "linear-gradient(135deg, #0b57c5 0%, #1a6edc 100%)",
          border: "none",
          padding: "28px 28px 24px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", right: 60, bottom: -50, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: "0.75rem", fontWeight: 750, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
                Tài khoản Premium
              </p>
              <h1 style={{ margin: "0 0 6px", fontSize: "1.7rem", fontWeight: 850, color: "#fff", letterSpacing: "-0.02em" }}>
                Xin chào, {firstName} 👋
              </h1>
              <p style={{ margin: "0 0 18px", fontSize: "0.9rem", color: "rgba(255,255,255,0.75)" }}>
                Bạn đang sử dụng gói Premium với đầy đủ quyền lợi.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Toàn bộ đề thi", "Tất cả bộ từ vựng", "Phân tích nâng cao"].map((f) => (
                  <span key={f} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 650, color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.35rem", fontWeight: 850, color: "#fff", marginLeft: "auto", marginBottom: 8, border: "2px solid rgba(255,255,255,0.3)" }}>
                {avatarLetter}
              </div>
              <p style={{ margin: "0 0 2px", fontSize: "0.78rem", fontWeight: 750, color: "#fff" }}>{user?.fullName || user?.name || "Người dùng"}</p>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(255,255,255,0.6)" }}>
                {user?.email || ""}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.75)", fontWeight: 650 }}>
                Tiến độ đến mục tiêu {targetScore}+
              </span>
              <span style={{ fontSize: "0.78rem", fontWeight: 750, color: "#fff" }}>
                {bestScore} / {targetScore} điểm
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #93c5fd, #fff)", width: `${scorePct}%`, transition: "width 1s ease" }} />
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            {
              icon: "bi-collection",
              color: "#185FA5", bg: "#e9f0ff",
              label: "Đề đã làm",
              value: loading ? "—" : String(overview.totalExamsCompleted || 0),
              sub: "lần làm bài",
            },
            {
              icon: "bi-trophy-fill",
              color: "#ba7517", bg: "#fff3d6",
              label: "Điểm cao nhất",
              value: loading ? "—" : String(bestScore || 0),
              sub: "/ 990",
            },
            {
              icon: "bi-clock-history",
              color: "#3B6D11", bg: "#eaf3de",
              label: "Tổng giờ học",
              value: loading ? "—" : `${overview.totalStudyHours || 0}h`,
              sub: "tích lũy",
            },
            {
              icon: "bi-fire",
              color: "#e34948", bg: "#fff0f0",
              label: "Streak",
              value: loading ? "—" : String(overview.streakDays || 0),
              sub: "ngày liên tiếp",
            },
          ].map((stat) => (
            <div key={stat.label} style={s.card}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <i className={`bi ${stat.icon}`} style={{ color: stat.color, fontSize: "1rem" }} />
              </div>
              {loading
                ? <Skeleton h={28} mb={6} />
                : <div style={{ fontSize: "1.75rem", fontWeight: 850, color: "#10233f", lineHeight: 1 }}>{stat.value}</div>
              }
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 2 }}>{stat.sub}</div>
              <div style={{ fontSize: "0.78rem", fontWeight: 650, color: "#475569", marginTop: 5 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── BIỂU ĐỒ ĐIỂM + NHỊP HỌC ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Biểu đồ tiến bộ điểm</h2>
                <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                  {recentScores.length} lần làm đề gần nhất
                </p>
              </div>
              {scoreImprovement !== null && (
                <span style={{
                  background: scoreImprovement >= 0 ? "#eaf3de" : "#fff0f0",
                  color: scoreImprovement >= 0 ? "#3B6D11" : "#b42318",
                  borderRadius: 999, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 750
                }}>
                  <i className={`bi bi-arrow-${scoreImprovement >= 0 ? "up" : "down"}`} />
                  {" "}{scoreImprovement >= 0 ? "+" : ""}{scoreImprovement} điểm
                </span>
              )}
            </div>
            {loading
              ? <Skeleton h={130} r={8} />
              : <ScoreChart scores={recentScores} />
            }
          </div>

          <div style={s.card}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Nhịp học tuần này</h2>
            {loading
              ? <Skeleton h={70} r={8} />
              : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
                  {weeklyStudy.map((d) => (
                    <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: d.hours > 0 ? "#185FA5" : "#94a3b8" }}>
                        {d.hours > 0 ? `${d.hours}h` : ""}
                      </span>
                      <div style={{
                        width: "100%",
                        height: Math.max(6, (d.hours / maxWeeklyHours) * 60),
                        borderRadius: 4,
                        background: d.hours >= 2 ? "#185FA5" : d.hours >= 1 ? "#93c5fd" : "#dbeafe",
                        transition: "height 0.5s ease",
                      }} />
                      <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>{d.day}</span>
                    </div>
                  ))}
                </div>
              )
            }

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "0.9rem", fontWeight: 750, color: "#334155" }}>Từ vựng cá nhân</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { label: "Đã thuộc", value: overview.vocabLearned || 0, color: "#087443", bg: "#eaf8ef" },
                  { label: "Đang học", value: overview.vocabLearning || 0, color: "#185FA5", bg: "#e9f0ff" },
                  { label: "Tổng sổ tay", value: overview.notebookTotal || 0, color: "#475569", bg: "#f1f5f9" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.82rem", color: "#475569" }}>{item.label}</span>
                    <span style={{ background: item.bg, color: item.color, borderRadius: 999, padding: "2px 10px", fontSize: "0.78rem", fontWeight: 750 }}>
                      {loading ? "—" : item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ACCURACY THEO PART ── */}
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={s.sectionLabel}>Phân tích hiệu suất</p>
              <h2 style={{ ...s.sectionTitle, fontSize: "1.2rem" }}>Accuracy theo từng Part</h2>
              <p style={s.sectionSub}>Tổng hợp từ tất cả lần làm bài của bạn.</p>
            </div>
            {weakParts.length > 0 && (
              <span style={{ background: "#fff0f0", color: "#a32d2d", borderRadius: 999, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 750 }}>
                ⚠ Cần cải thiện: {weakParts.join(", ")}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: "grid", gap: 12 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} h={14} r={4} />)}
            </div>
          ) : partAccuracy.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: "0.88rem" }}>
              Chưa có dữ liệu — hãy làm bài để xem thống kê theo Part
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {partAccuracy.map((p) => {
                const barColor = p.value >= 75 ? "#3B6D11" : p.value >= 60 ? "#BA7517" : "#A32D2D";
                return (
                  <div key={p.part} style={{ display: "grid", gridTemplateColumns: "190px 1fr 44px", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: "0.84rem", color: "#475569", fontWeight: 650 }}>{p.label}</span>
                    <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: barColor, width: `${p.value}%`, borderRadius: 999, transition: "width 0.8s ease" }} />
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 750, color: barColor, textAlign: "right" }}>{p.value}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── QUICK LINKS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { icon: "bi-journal-bookmark", color: "#185FA5", bg: "#e9f0ff", label: "Sổ tay từ vựng", to: "/vocabulary" },
            { icon: "bi-collection-fill", color: "#ba7517", bg: "#fff3d6", label: "Kho đề thi", to: "/practice" },
            { icon: "bi-bookmark-star-fill", color: "#7c3aed", bg: "#f5f3ff", label: "Câu hỏi khó", to: "/bookmarks" },
            { icon: "bi-graph-up-arrow", color: "#3B6D11", bg: "#eaf3de", label: "Thống kê chi tiết", to: "/analytics" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              style={{ textDecoration: "none" }}
            >
              <div style={{
                ...s.card,
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
              }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(15,23,42,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.045)";
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: "1.1rem" }} />
                </div>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#334155" }}>{item.label}</span>
                <i className="bi bi-chevron-right" style={{ color: "#94a3b8", fontSize: "0.78rem", marginLeft: "auto" }} />
              </div>
            </Link>
          ))}
        </div>

        {/* ── ERROR STATE ── */}
        {error && (
          <div style={{
            ...s.card, background: "#fef2f2", border: "1px solid #fecaca",
            textAlign: "center", color: "#b91c1c"
          }}>
            <i className="bi bi-exclamation-circle" style={{ fontSize: "1.5rem", marginBottom: 8, display: "block" }} />
            <p style={{ margin: 0 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 12, background: "#b91c1c", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 700 }}
            >
              Thử lại
            </button>
          </div>
        )}

      </div>
    </div>
  );
}