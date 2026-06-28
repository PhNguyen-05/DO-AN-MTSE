import React, { useState, useEffect } from "react";

// ─── Icons (Bootstrap Icons via className) ───────────────────
// Requires: bootstrap-icons already imported in main.jsx

// ─── Mock Data ────────────────────────────────────────────────
const USER = {
  name: "Nguyễn Minh Tâm",
  avatar: null,
  targetScore: 950,
  currentScore: 780,
  streak: 14,
  joinDate: "01/2024",
  isPremium: true,
};

const ROADMAP = [
  {
    id: 1,
    title: "Chặng 1: Nền tảng 450–550",
    desc: "Phát âm cơ bản, Từ vựng đời sống, Thì hiện tại đơn & hoàn thành.",
    status: "done",
    progress: 100,
  },
  {
    id: 2,
    title: "Chặng 2: Tăng tốc 650–750",
    desc: "Listening Part 3–4, Kỹ thuật đọc lướt Part 7, Mệnh đề quan hệ & Câu bị động.",
    status: "active",
    progress: 72,
  },
  {
    id: 3,
    title: "Chặng 3: Về đích 850–950+",
    desc: "Quản lý thời gian áp lực cao, Từ vựng chuyên sâu Tài chính–Kinh doanh.",
    status: "locked",
    progress: 0,
  },
];

const DAILY_TASKS = [
  { id: 1, title: "Ôn tập Part 5: Mệnh đề quan hệ", meta: "15 câu • 10 phút", done: true },
  { id: 2, title: "Listening Part 3: Chiến thuật keywords", meta: "5 đoạn hội thoại • 15 phút", done: false },
  { id: 3, title: "Flashcard: 20 từ vựng Unit 12", meta: "Học từ mới • 5 phút", done: false },
  { id: 4, title: "Mini Test: Part 6 điền câu", meta: "4 đoạn văn • 8 phút", done: false },
];

const SKILL_BARS = [
  { label: "Listening", value: 82, color: "#0b57c5" },
  { label: "Reading", value: 68, color: "#16a34a" },
  { label: "Vocabulary", value: 74, color: "#f59e0b" },
  { label: "Grammar", value: 55, color: "#dc2626" },
];

const RECENT_SCORES = [
  { date: "02/06", score: 710 },
  { date: "09/06", score: 730 },
  { date: "16/06", score: 750 },
  { date: "23/06", score: 780 },
];

const WEEKLY_STUDY = [
  { day: "T2", hours: 1.5 },
  { day: "T3", hours: 2 },
  { day: "T4", hours: 0.5 },
  { day: "T5", hours: 2.5 },
  { day: "T6", hours: 1 },
  { day: "T7", hours: 3 },
  { day: "CN", hours: 1.5 },
];

const REVIEW_QUESTIONS = [
  { id: 1, part: 5, text: "The committee members have reached a ___.", correct: "C", userAnswer: "A" },
  { id: 2, part: 3, text: "Why is the woman calling?", correct: "B", userAnswer: "B" },
  { id: 3, part: 7, text: "What is the main purpose of the memo?", correct: "A", userAnswer: "C" },
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "bi-grid-1x2" },
  { id: "roadmap", label: "Lộ trình", icon: "bi-map" },
  { id: "coach", label: "AI Coach", icon: "bi-robot" },
  { id: "review", label: "Ôn tập", icon: "bi-journal-bookmark" },
  { id: "analytics", label: "Phân tích", icon: "bi-graph-up-arrow" },
  { id: "vocabulary", label: "Từ vựng", icon: "bi-translate" },
];

// ─── Sub-components ──────────────────────────────────────────

const ScoreChart = ({ scores }) => {
  const maxScore = 990;
  const w = 400, h = 140, padX = 36, padY = 16;
  const points = scores.map((s, i) => {
    const x = padX + i * ((w - padX * 2) / Math.max(scores.length - 1, 1));
    const y = h - padY - (s.score / maxScore) * (h - padY * 2);
    return { x, y, ...s };
  });
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 140 }}>
      {[300, 600, 900].map((v) => {
        const y = h - padY - (v / maxScore) * (h - padY * 2);
        return (
          <g key={v}>
            <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="#e5ebf4" strokeWidth="1" />
            <text x={padX - 4} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{v}</text>
          </g>
        );
      })}
      {scores.length > 1 && (
        <polyline fill="none" stroke="#0b57c5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={polyline} />
      )}
      {points.map((p) => (
        <g key={p.date}>
          <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#0b57c5" strokeWidth="2.5" />
          <text x={p.x} y={p.y - 10} fill="#0b57c5" fontSize="11" fontWeight="700" textAnchor="middle">{p.score}</text>
          <text x={p.x} y={h - 2} fill="#94a3b8" fontSize="10" textAnchor="middle">{p.date}</text>
        </g>
      ))}
    </svg>
  );
};

const RadarChart = ({ skills }) => {
  const cx = 80, cy = 80, r = 60;
  const n = skills.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, ratio) => ({
    x: cx + r * ratio * Math.cos(angle(i)),
    y: cy + r * ratio * Math.sin(angle(i)),
  });
  const grid = [0.33, 0.66, 1].map((ratio) =>
    skills.map((_, i) => pt(i, ratio)).map((p) => `${p.x},${p.y}`).join(" ")
  );
  const dataPoints = skills.map((s, i) => pt(i, s.value / 100));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 160 160" style={{ width: "100%", maxWidth: 160 }}>
      {grid.map((pts, gi) => (
        <polygon key={gi} points={pts} fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
      ))}
      {skills.map((_, i) => {
        const end = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e2e8f0" strokeWidth="0.8" />;
      })}
      <polygon points={dataPath} fill="rgba(11,87,197,0.15)" stroke="#0b57c5" strokeWidth="2" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#0b57c5" />
      ))}
      {skills.map((s, i) => {
        const lp = pt(i, 1.22);
        return (
          <text key={i} x={lp.x} y={lp.y} fontSize="9" fill="#475569" textAnchor="middle" dominantBaseline="middle" fontWeight="700">
            {s.label}
          </text>
        );
      })}
    </svg>
  );
};

// ─── Page Sections ────────────────────────────────────────────

const DashboardPage = ({ tasks, setTasks }) => {
  const doneCount = tasks.filter((t) => t.done).length;
  const todayProgress = Math.round((doneCount / tasks.length) * 100);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* AI Coach Banner */}
      <div style={{
        background: "linear-gradient(135deg, #e9f0ff 0%, #f0f3ff 100%)",
        border: "1px solid #b7cdf9",
        borderLeft: "4px solid #0b57c5",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          right: -20,
          top: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(11,87,197,0.06)",
        }} />
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#0b57c5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(11,87,197,0.3)",
        }}>
          <i className="bi bi-robot" style={{ color: "#fff", fontSize: "1.25rem" }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 4px", fontSize: "0.78rem", fontWeight: 750, color: "#0b57c5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            AI Coach · Phân tích hôm nay
          </p>
          <p style={{ margin: "0 0 12px", color: "#1e3a6e", fontSize: "1rem", lineHeight: 1.55 }}>
            Kỹ năng Listening của bạn tăng <strong>15%</strong> tuần qua — rất tốt! Tuy nhiên <strong>Grammar Part 5</strong> (mệnh đề quan hệ) vẫn cần chú ý. Tôi đã thêm 3 bài tập bổ trợ vào nhiệm vụ hôm nay.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{
              background: "#0b57c5",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}>
              <i className="bi bi-eye" style={{ marginRight: 6 }} />Chi tiết lỗi sai
            </button>
            <button style={{
              background: "transparent",
              color: "#64748b",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}>
              Bỏ qua
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { icon: "bi-trophy-fill", color: "#f59e0b", bg: "#fff3d6", label: "Điểm hiện tại", value: USER.currentScore, sub: "/ 990" },
          { icon: "bi-bullseye", color: "#0b57c5", bg: "#e9f0ff", label: "Mục tiêu", value: USER.targetScore, sub: "+ điểm" },
          { icon: "bi-fire", color: "#ef4444", bg: "#fff0f0", label: "Streak", value: `${USER.streak}`, sub: "ngày liên tiếp" },
          { icon: "bi-check2-circle", color: "#16a34a", bg: "#eaf8ef", label: "Hôm nay", value: `${doneCount}/${tasks.length}`, sub: "nhiệm vụ xong" },
        ].map((s) => (
          <article key={s.label} style={{
            background: "#fff",
            border: "1px solid #e5ebf4",
            borderRadius: 12,
            padding: "18px 16px",
            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: s.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
            }}>
              <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: "1.1rem" }} />
            </div>
            <div style={{ fontSize: "1.65rem", fontWeight: 850, color: "#10233f", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{s.sub}</div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginTop: 4 }}>{s.label}</div>
          </article>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 }}>
        {/* Left: Score Chart + Skills */}
        <div style={{ display: "grid", gap: 18 }}>
          {/* Score trend */}
          <div style={{ background: "#fff", border: "1px solid #e5ebf4", borderRadius: 12, padding: "20px 22px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Biểu đồ tiến bộ</h2>
                <p style={{ margin: "3px 0 0", fontSize: "0.82rem", color: "#64748b" }}>4 lần làm đề gần nhất</p>
              </div>
              <span style={{
                background: "#eaf8ef",
                color: "#087443",
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: "0.75rem",
                fontWeight: 750,
              }}>
                <i className="bi bi-arrow-up" /> +70 điểm / tháng
              </span>
            </div>
            <ScoreChart scores={RECENT_SCORES} />
          </div>

          {/* Skill mastery bars */}
          <div style={{ background: "#fff", border: "1px solid #e5ebf4", borderRadius: 12, padding: "20px 22px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Mức độ thành thạo</h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <RadarChart skills={SKILL_BARS} />
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {SKILL_BARS.map((s) => (
                <div key={s.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#334155" }}>{s.label}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: s.color }}>{s.value}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, background: s.color, width: `${s.value}%`, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Daily Tasks */}
        <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
          {/* Daily tasks */}
          <div style={{ background: "#fff", border: "1px solid #e5ebf4", borderRadius: 12, padding: "20px 20px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Nhiệm vụ hôm nay</h2>
              <span style={{ fontSize: "0.72rem", fontWeight: 750, color: "#0b57c5", background: "#e9f0ff", borderRadius: 999, padding: "2px 9px" }}>
                AI gợi ý
              </span>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: "0.78rem", color: "#64748b" }}>Tiến độ: {todayProgress}% · {doneCount}/{tasks.length} hoàn thành</p>
            {/* Progress */}
            <div style={{ height: 6, borderRadius: 999, background: "#f1f5f9", marginBottom: 16, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #0b57c5, #16a34a)", width: `${todayProgress}%`, transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done: !t.done } : t))}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1px solid ${task.done ? "#b7f3c8" : "#e5ebf4"}`,
                    background: task.done ? "#f0fff4" : "#f8fafc",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `2px solid ${task.done ? "#16a34a" : "#b0bec5"}`,
                    background: task.done ? "#16a34a" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                    transition: "all 0.2s",
                  }}>
                    {task.done && <i className="bi bi-check2" style={{ color: "#fff", fontSize: "0.75rem" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: task.done ? 500 : 700, color: task.done ? "#64748b" : "#1e293b", textDecoration: task.done ? "line-through" : "none" }}>
                      {task.title}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>{task.meta}</p>
                  </div>
                </div>
              ))}
            </div>
            <button style={{
              width: "100%",
              marginTop: 14,
              background: "#0b57c5",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px",
              fontSize: "0.88rem",
              fontWeight: 750,
              cursor: "pointer",
            }}>
              <i className="bi bi-play-circle" style={{ marginRight: 6 }} />Bắt đầu học ngay
            </button>
          </div>

          {/* Weekly study heatmap */}
          <div style={{ background: "#fff", border: "1px solid #e5ebf4", borderRadius: 12, padding: "18px 20px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Nhịp học tuần này</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
              {WEEKLY_STUDY.map((d) => (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%",
                    height: Math.max(10, d.hours * 22),
                    borderRadius: 4,
                    background: d.hours >= 2 ? "#0b57c5" : d.hours >= 1 ? "#93c5fd" : "#dbeafe",
                    transition: "height 0.5s",
                  }} title={`${d.hours}h`} />
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoadmapPage = () => (
  <div style={{ display: "grid", gap: 18 }}>
    <div>
      <p style={{ margin: "0 0 4px", fontSize: "0.72rem", fontWeight: 750, color: "#0b57c5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Lộ trình học tập
      </p>
      <h1 style={{ margin: "0 0 6px", fontSize: "1.6rem", fontWeight: 850, color: "#10233f" }}>Lộ trình cá nhân hóa của bạn</h1>
      <p style={{ margin: 0, color: "#64748b" }}>AI đã tối ưu hóa các chặng dựa trên hiệu suất làm bài để giúp bạn đạt {USER.targetScore}+ nhanh nhất.</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>
      {/* Timeline */}
      <div style={{ background: "#fff", border: "1px solid #e5ebf4", borderRadius: 12, padding: "24px 28px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div style={{ position: "relative", paddingLeft: 32 }}>
          {/* Line */}
          <div style={{
            position: "absolute",
            left: 10,
            top: 12,
            bottom: 12,
            width: 2,
            background: "repeating-linear-gradient(180deg, #0b57c5 0 4px, transparent 4px 8px)",
            opacity: 0.25,
          }} />

          {ROADMAP.map((step, idx) => (
            <div key={step.id} style={{ position: "relative", marginBottom: idx < ROADMAP.length - 1 ? 32 : 0 }}>
              {/* Node */}
              <div style={{
                position: "absolute",
                left: -32,
                top: 2,
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: step.status === "done" ? "#16a34a" : step.status === "active" ? "#0b57c5" : "#cbd5e1",
                boxShadow: step.status === "active" ? "0 0 0 4px rgba(11,87,197,0.15)" : "none",
                animation: step.status === "active" ? "pulse 2s infinite" : "none",
              }}>
                <i
                  className={`bi ${step.status === "done" ? "bi-check2" : step.status === "active" ? "bi-play-fill" : "bi-lock-fill"}`}
                  style={{ color: "#fff", fontSize: "0.75rem" }}
                />
              </div>

              <div style={{
                background: step.status === "done" ? "#f8fafb" : step.status === "active" ? "#e9f0ff" : "transparent",
                border: `1px solid ${step.status === "done" ? "#e5ebf4" : step.status === "active" ? "#b7cdf9" : "#e5ebf4"}`,
                borderStyle: step.status === "locked" ? "dashed" : "solid",
                borderRadius: 10,
                padding: "16px 18px",
                opacity: step.status === "locked" ? 0.55 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: step.status === "active" ? "#0b57c5" : "#334155" }}>
                    {step.title}
                  </h3>
                  <span style={{
                    fontSize: "0.72rem",
                    fontWeight: 750,
                    color: step.status === "done" ? "#087443" : step.status === "active" ? "#0b57c5" : "#94a3b8",
                    flexShrink: 0,
                    marginLeft: 8,
                  }}>
                    {step.status === "done" ? "✓ Hoàn thành" : step.status === "active" ? `Đang học · ${step.progress}%` : "Chưa mở"}
                  </span>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: "0.84rem", color: "#64748b", lineHeight: 1.55 }}>{step.desc}</p>
                {step.status !== "locked" && (
                  <div style={{ height: 6, borderRadius: 999, background: "#e8edf6", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: step.status === "done" ? "#16a34a" : "#0b57c5", width: `${step.progress}%`, borderRadius: 999 }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
        <div style={{ background: "#fff", border: "1px solid #e5ebf4", borderRadius: 12, padding: "18px 20px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "0.95rem", fontWeight: 800, color: "#10233f" }}>Tiến độ tổng thể</h3>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <svg viewBox="0 0 80 80" style={{ width: 80, height: 80 }}>
              <circle cx="40" cy="40" r="30" fill="none" stroke="#e8edf6" strokeWidth="8" />
              <circle cx="40" cy="40" r="30" fill="none" stroke="#0b57c5" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - 0.64)}`}
                transform="rotate(-90 40 40)" />
              <text x="40" y="44" textAnchor="middle" fill="#10233f" fontSize="14" fontWeight="800">64%</text>
            </svg>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              { label: "Chặng hoàn thành", value: "1/3" },
              { label: "Ngày còn lại", value: "~42" },
              { label: "Tốc độ tăng điểm", value: "+35/tháng" },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>{r.label}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 750, color: "#10233f" }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#e9f0ff", border: "1px solid #b7cdf9", borderRadius: 12, padding: "16px 18px" }}>
          <p style={{ margin: "0 0 4px", fontSize: "0.75rem", fontWeight: 750, color: "#0b57c5" }}>💡 Gợi ý AI</p>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "#1e3a6e", lineHeight: 1.55 }}>
            Nếu duy trì tốc độ hiện tại, bạn sẽ đạt <strong>780 điểm</strong> vào cuối tháng 7. Để về đích 950+, hãy tập trung Grammar Part 5 và Reading Part 7 trong 3 tuần tới.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const CoachPage = () => {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Xin chào! Tôi là AI Coach của bạn. Hôm nay bạn muốn ôn tập phần nào?" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", text: input },
      { from: "ai", text: `Tôi sẽ giúp bạn về "${input}". Hãy thử bài tập Part 5 ngay nhé!` },
    ]);
    setInput("");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18 }}>
      <div style={{ background: "#fff", border: "1px solid #e5ebf4", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", height: 520, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0b57c5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="bi bi-robot" style={{ color: "#fff" }} />
          </div>
          <div>
            <strong style={{ fontSize: "0.95rem", color: "#10233f" }}>AI Coach</strong>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#16a34a" }}>● Đang hoạt động</p>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "72%",
                padding: "10px 14px",
                borderRadius: m.from === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background: m.from === "user" ? "#0b57c5" : "#f8fafc",
                border: m.from === "ai" ? "1px solid #e5ebf4" : "none",
                color: m.from === "user" ? "#fff" : "#334155",
                fontSize: "0.9rem",
                lineHeight: 1.5,
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8 }}>
          <input
            style={{
              flex: 1,
              border: "1px solid #e5ebf4",
              borderRadius: 8,
              padding: "9px 12px",
              fontSize: "0.88rem",
              color: "#10233f",
              outline: "none",
            }}
            placeholder="Hỏi AI Coach bất cứ điều gì..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send} style={{
            background: "#0b57c5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "9px 16px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "0.88rem",
          }}>
            Gửi
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
        <div style={{ background: "#fff", border: "1px solid #e5ebf4", borderRadius: 12, padding: "18px 20px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 800, color: "#10233f" }}>Chủ đề gợi ý</h3>
          {["Giải thích mệnh đề quan hệ", "Chiến lược Part 7 đọc nhanh", "Top 50 từ vựng tài chính", "Phân tích lỗi sai tuần này"].map((t) => (
            <button key={t} onClick={() => setInput(t)} style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background: "#f8fafc",
              border: "1px solid #e5ebf4",
              borderRadius: 8,
              padding: "9px 12px",
              fontSize: "0.84rem",
              color: "#334155",
              cursor: "pointer",
              marginBottom: 8,
              fontWeight: 600,
            }}>
              <i className="bi bi-lightning-charge" style={{ color: "#0b57c5", marginRight: 6 }} />{t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReviewPage = () => (
  <div style={{ display: "grid", gap: 14 }}>
    <div>
      <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 850, color: "#10233f" }}>Ôn tập câu hỏi đã bookmark</h1>
      <p style={{ margin: 0, color: "#64748b" }}>Xem lại đáp án đúng và lời giải chi tiết.</p>
    </div>
    {REVIEW_QUESTIONS.map((q) => {
      const isCorrect = q.userAnswer === q.correct;
      return (
        <div key={q.id} style={{ background: "#fff", border: "1px solid #e5ebf4", borderRadius: 12, padding: "18px 20px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <span style={{ background: "#e9f0ff", color: "#0b57c5", borderRadius: 999, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 750 }}>Part {q.part}</span>
            <span style={{
              background: isCorrect ? "#eaf8ef" : "#fff0f0",
              color: isCorrect ? "#087443" : "#b42318",
              borderRadius: 999,
              padding: "2px 10px",
              fontSize: "0.75rem",
              fontWeight: 750,
            }}>
              <i className={`bi ${isCorrect ? "bi-check-circle" : "bi-x-circle"}`} style={{ marginRight: 4 }} />
              {isCorrect ? "Đúng" : "Sai"}
            </span>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: "0.95rem", fontWeight: 700, color: "#10233f" }}>{q.text}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Bạn chọn: <strong style={{ color: isCorrect ? "#087443" : "#b42318" }}>{q.userAnswer}</strong></span>
            {!isCorrect && <span style={{ fontSize: "0.82rem", color: "#64748b" }}>· Đáp án đúng: <strong style={{ color: "#087443" }}>{q.correct}</strong></span>}
          </div>
        </div>
      );
    })}
  </div>
);

const AnalyticsPage = () => (
  <div style={{ display: "grid", gap: 18 }}>
    <div>
      <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 850, color: "#10233f" }}>Phân tích hiệu suất</h1>
      <p style={{ margin: 0, color: "#64748b" }}>Thống kê chi tiết theo từng kỹ năng và phần thi.</p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <div style={{ background: "#fff", border: "1px solid #e5ebf4", borderRadius: 12, padding: "20px 22px" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Accuracy theo Part</h2>
        {[
          { label: "Part 1 – Mô tả tranh", value: 90 },
          { label: "Part 2 – Hỏi đáp", value: 75 },
          { label: "Part 3 – Hội thoại", value: 68 },
          { label: "Part 4 – Bài nói", value: 72 },
          { label: "Part 5 – Điền từ", value: 55 },
          { label: "Part 6 – Điền đoạn", value: 60 },
          { label: "Part 7 – Đọc hiểu", value: 62 },
        ].map((p) => (
          <div key={p.label} style={{ display: "grid", gridTemplateColumns: "160px 1fr 40px", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: "0.82rem", color: "#475569", fontWeight: 600 }}>{p.label}</span>
            <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                background: p.value >= 75 ? "#16a34a" : p.value >= 60 ? "#f59e0b" : "#dc2626",
                width: `${p.value}%`,
                borderRadius: 999,
              }} />
            </div>
            <span style={{ fontSize: "0.82rem", fontWeight: 750, color: "#10233f", textAlign: "right" }}>{p.value}%</span>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e5ebf4", borderRadius: 12, padding: "20px 22px" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Biểu đồ tăng trưởng điểm</h2>
        <ScoreChart scores={RECENT_SCORES} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
          {[
            { label: "Đề đã làm", value: "12" },
            { label: "Điểm TB", value: "752" },
            { label: "Giờ học", value: "42h" },
            { label: "Streak tốt nhất", value: "14 ngày" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: "1.35rem", fontWeight: 850, color: "#10233f" }}>{s.value}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const VocabularyPage = () => {
  const words = [
    { word: "negotiate", phonetic: "/nɪˈɡoʊ.ʃi.eɪt/", type: "Verb", meaning: "Đàm phán, thương lượng", status: "Đang học" },
    { word: "significant", phonetic: "/sɪɡˈnɪf.ɪ.kənt/", type: "Adjective", meaning: "Quan trọng, đáng kể", status: "Đã thuộc" },
    { word: "implement", phonetic: "/ˈɪm.plə.ment/", type: "Verb", meaning: "Thực hiện, triển khai", status: "Đang học" },
    { word: "revenue", phonetic: "/ˈrev.ən.juː/", type: "Noun", meaning: "Doanh thu, thu nhập", status: "Đã thuộc" },
  ];
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 850, color: "#10233f" }}>VocabularyHub</h1>
        <p style={{ margin: 0, color: "#64748b" }}>Từ vựng TOEIC theo chủ đề — Business, Office, Travel...</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {words.map((w) => (
          <div key={w.word} style={{
            background: "#fff",
            border: `1px solid ${w.status === "Đã thuộc" ? "#b7f3c8" : "#e5ebf4"}`,
            borderLeft: `4px solid ${w.status === "Đã thuộc" ? "#16a34a" : "#0b57c5"}`,
            borderRadius: 10,
            padding: "16px 18px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: "1.15rem", fontWeight: 850, color: "#10233f" }}>{w.word}</h3>
                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>{w.phonetic}</span>
              </div>
              <span style={{
                background: w.status === "Đã thuộc" ? "#eaf8ef" : "#e9f0ff",
                color: w.status === "Đã thuộc" ? "#087443" : "#0b57c5",
                borderRadius: 999,
                padding: "2px 9px",
                fontSize: "0.72rem",
                fontWeight: 750,
              }}>{w.status}</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <span style={{ background: "#fff3d6", color: "#a15c00", borderRadius: 999, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 750 }}>{w.type}</span>
              <p style={{ margin: "6px 0 0", fontSize: "0.9rem", fontWeight: 700, color: "#334155" }}>{w.meaning}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const PremiumDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [tasks, setTasks] = useState(DAILY_TASKS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const doneCount = tasks.filter((t) => t.done).length;

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage tasks={tasks} setTasks={setTasks} />;
      case "roadmap": return <RoadmapPage />;
      case "coach": return <CoachPage />;
      case "review": return <ReviewPage />;
      case "analytics": return <AnalyticsPage />;
      case "vocabulary": return <VocabularyPage />;
      default: return <DashboardPage tasks={tasks} setTasks={setTasks} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fb", color: "#10233f", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5ebf4",
        boxShadow: "0 1px 8px rgba(15,23,42,0.05)",
      }}>
        <div style={{
          width: "min(100% - 32px, 1180px)",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          height: 60,
          gap: 16,
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0b57c5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-lightning-charge-fill" style={{ color: "#fff", fontSize: "0.95rem" }} />
            </div>
            <span style={{ fontSize: "1.05rem", fontWeight: 850, color: "#0b57c5", letterSpacing: "-0.02em" }}>TOEIC</span>
            <span style={{ fontSize: "1.05rem", fontWeight: 850, color: "#10233f", letterSpacing: "-0.02em" }}>Master</span>
          </div>

          {/* Nav — desktop */}
          <nav style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 8,
                  background: activePage === item.id ? "#e9f0ff" : "transparent",
                  color: activePage === item.id ? "#0b57c5" : "#475569",
                  fontWeight: activePage === item.id ? 750 : 500,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: "0.9rem" }} />
                {item.label}
                {item.id === "dashboard" && doneCount < tasks.length && (
                  <span style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#0b57c5",
                    color: "#fff",
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {tasks.length - doneCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right: user + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              borderRadius: 999,
              padding: "4px 10px",
            }}>
              <i className="bi bi-gem" style={{ color: "#fff", fontSize: "0.75rem" }} />
              <span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 750 }}>Premium</span>
            </div>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, position: "relative" }}>
              <i className="bi bi-bell" style={{ fontSize: "1.1rem", color: "#64748b" }} />
              <span style={{
                position: "absolute",
                top: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#dc2626",
                border: "1.5px solid #fff",
              }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 8, cursor: "pointer" }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0b57c5, #4f86e8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#fff",
                fontSize: "0.88rem",
              }}>
                {USER.name.charAt(0)}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 750, color: "#10233f", lineHeight: 1.2 }}>{USER.name.split(" ").slice(-1)[0]}</span>
                <span style={{ fontSize: "0.68rem", color: "#64748b" }}>Mục tiêu {USER.targetScore}+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score progress bar */}
        <div style={{ height: 3, background: "#f1f5f9" }}>
          <div style={{
            height: "100%",
            background: "linear-gradient(90deg, #0b57c5 0%, #4f86e8 60%, #f59e0b 100%)",
            width: `${(USER.currentScore / USER.targetScore) * 100}%`,
            transition: "width 1s ease",
          }} />
        </div>
      </header>

      {/* ── PAGE CONTENT ─────────────────────────────────── */}
      <main style={{ width: "min(100% - 32px, 1180px)", margin: "0 auto", padding: "24px 0 48px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            TOEIC Master
          </span>
          <i className="bi bi-chevron-right" style={{ fontSize: "0.65rem", color: "#cbd5e1" }} />
          <span style={{ fontSize: "0.72rem", color: "#0b57c5", fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {NAV_ITEMS.find((n) => n.id === activePage)?.label || "Dashboard"}
          </span>

          {/* Streak badge */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "#fff3d6",
              border: "1px solid #fde68a",
              borderRadius: 999,
              padding: "3px 10px",
              fontSize: "0.75rem",
              fontWeight: 750,
              color: "#a15c00",
            }}>
              <i className="bi bi-fire" />
              {USER.streak} ngày streak
            </span>
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "#e9f0ff",
              border: "1px solid #b7cdf9",
              borderRadius: 999,
              padding: "3px 10px",
              fontSize: "0.75rem",
              fontWeight: 750,
              color: "#0b57c5",
            }}>
              <i className="bi bi-trophy" />
              {USER.currentScore} / {USER.targetScore}
            </span>
          </div>
        </div>

        {renderPage()}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(11,87,197,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(11,87,197,0.05); }
        }
        * { box-sizing: border-box; }
        button:hover { filter: brightness(0.97); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>
    </div>
  );
};

export default PremiumDashboard;


// import React, { useState } from "react";

// const USER = {
//   name: "Nguyễn Minh Tâm",
//   targetScore: 950,
//   currentScore: 780,
//   streak: 14,
//   isPremium: true,
// };

// const ROADMAP = [
//   {
//     id: 1,
//     title: "Chặng 1: Nền tảng 450–550",
//     desc: "Phát âm cơ bản, Từ vựng đời sống, Thì hiện tại đơn & hoàn thành.",
//     status: "done",
//     progress: 100,
//   },
//   {
//     id: 2,
//     title: "Chặng 2: Tăng tốc 650–750",
//     desc: "Listening Part 3–4, Kỹ thuật đọc lướt Part 7, Mệnh đề quan hệ & Câu bị động.",
//     status: "active",
//     progress: 72,
//   },
//   {
//     id: 3,
//     title: "Chặng 3: Về đích 850–950+",
//     desc: "Quản lý thời gian áp lực cao, Từ vựng chuyên sâu Tài chính–Kinh doanh.",
//     status: "locked",
//     progress: 0,
//   },
// ];

// const DAILY_TASKS = [
//   { id: 1, title: "Ôn tập Part 5: Mệnh đề quan hệ", meta: "15 câu • 10 phút", done: true },
//   { id: 2, title: "Listening Part 3: Chiến thuật keywords", meta: "5 đoạn hội thoại • 15 phút", done: false },
//   { id: 3, title: "Flashcard: 20 từ vựng Unit 12", meta: "Học từ mới • 5 phút", done: false },
//   { id: 4, title: "Mini Test: Part 6 điền câu", meta: "4 đoạn văn • 8 phút", done: false },
// ];

// const SKILL_BARS = [
//   { label: "Listening", value: 82, color: "#185FA5" },
//   { label: "Reading", value: 68, color: "#3B6D11" },
//   { label: "Vocabulary", value: 74, color: "#BA7517" },
//   { label: "Grammar", value: 55, color: "#A32D2D" },
// ];

// const RECENT_SCORES = [
//   { date: "02/06", score: 710 },
//   { date: "09/06", score: 730 },
//   { date: "16/06", score: 750 },
//   { date: "23/06", score: 780 },
// ];

// const WEEKLY_STUDY = [
//   { day: "T2", hours: 1.5 },
//   { day: "T3", hours: 2 },
//   { day: "T4", hours: 0.5 },
//   { day: "T5", hours: 2.5 },
//   { day: "T6", hours: 1 },
//   { day: "T7", hours: 3 },
//   { day: "CN", hours: 1.5 },
// ];

// const PART_ACCURACY = [
//   { label: "Part 1 – Mô tả tranh", value: 90 },
//   { label: "Part 2 – Hỏi đáp", value: 75 },
//   { label: "Part 3 – Hội thoại", value: 68 },
//   { label: "Part 4 – Bài nói", value: 72 },
//   { label: "Part 5 – Điền từ", value: 55 },
//   { label: "Part 6 – Điền đoạn", value: 60 },
//   { label: "Part 7 – Đọc hiểu", value: 62 },
// ];

// const s = {
//   page: {
//     background: "#f5f7fb",
//     color: "#10233f",
//     fontFamily: "Inter, system-ui, -apple-system, sans-serif",
//     minHeight: "100vh",
//     padding: "32px 0 60px",
//   },
//   shell: {
//     width: "min(100% - 32px, 1120px)",
//     margin: "0 auto",
//     display: "grid",
//     gap: 24,
//   },
//   card: {
//     background: "#ffffff",
//     border: "1px solid #e5ebf4",
//     borderRadius: 12,
//     padding: "20px 22px",
//     boxShadow: "0 2px 8px rgba(15,23,42,0.045)",
//   },
//   sectionLabel: {
//     fontSize: "0.7rem",
//     fontWeight: 750,
//     color: "#185FA5",
//     textTransform: "uppercase",
//     letterSpacing: "0.09em",
//     margin: "0 0 6px",
//   },
//   sectionTitle: {
//     fontSize: "1.45rem",
//     fontWeight: 850,
//     color: "#10233f",
//     margin: "0 0 4px",
//     letterSpacing: "-0.02em",
//   },
//   sectionSub: {
//     fontSize: "0.88rem",
//     color: "#64748b",
//     margin: 0,
//   },
//   divider: {
//     height: 1,
//     background: "linear-gradient(90deg, #e5ebf4 0%, transparent 100%)",
//     border: "none",
//     margin: "0",
//   },
// };

// const badge = (text, bg, color) => (
//   <span style={{
//     background: bg,
//     color,
//     borderRadius: 999,
//     padding: "3px 10px",
//     fontSize: "0.72rem",
//     fontWeight: 750,
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 4,
//   }}>
//     {text}
//   </span>
// );

// const ScoreChart = ({ scores }) => {
//   const maxScore = 990;
//   const w = 520, h = 140, padX = 40, padY = 18;
//   const points = scores.map((s, i) => {
//     const x = padX + i * ((w - padX * 2) / Math.max(scores.length - 1, 1));
//     const y = h - padY - (s.score / maxScore) * (h - padY * 2);
//     return { x, y, ...s };
//   });
//   const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
//   return (
//     <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 130 }}>
//       {[300, 600, 900].map((v) => {
//         const y = h - padY - (v / maxScore) * (h - padY * 2);
//         return (
//           <g key={v}>
//             <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="#e5ebf4" strokeWidth="1" />
//             <text x={padX - 6} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{v}</text>
//           </g>
//         );
//       })}
//       {scores.length > 1 && (
//         <polyline fill="none" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polyline} />
//       )}
//       {points.map((p) => (
//         <g key={p.date}>
//           <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#185FA5" strokeWidth="2.5" />
//           <text x={p.x} y={p.y - 10} fill="#0C447C" fontSize="11" fontWeight="700" textAnchor="middle">{p.score}</text>
//           <text x={p.x} y={h - 3} fill="#94a3b8" fontSize="10" textAnchor="middle">{p.date}</text>
//         </g>
//       ))}
//     </svg>
//   );
// };

// const RadarChart = ({ skills }) => {
//   const cx = 80, cy = 80, r = 58;
//   const n = skills.length;
//   const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
//   const pt = (i, ratio) => ({
//     x: cx + r * ratio * Math.cos(angle(i)),
//     y: cy + r * ratio * Math.sin(angle(i)),
//   });
//   const grid = [0.33, 0.66, 1].map((ratio) =>
//     skills.map((_, i) => pt(i, ratio)).map((p) => `${p.x},${p.y}`).join(" ")
//   );
//   const dataPoints = skills.map((s, i) => pt(i, s.value / 100));
//   const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
//   return (
//     <svg viewBox="0 0 160 160" style={{ width: "100%", maxWidth: 150 }}>
//       {grid.map((pts, gi) => (
//         <polygon key={gi} points={pts} fill="none" stroke="#e5ebf4" strokeWidth="1" />
//       ))}
//       {skills.map((_, i) => {
//         const end = pt(i, 1);
//         return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e5ebf4" strokeWidth="0.8" />;
//       })}
//       <polygon points={dataPath} fill="rgba(24,95,165,0.12)" stroke="#185FA5" strokeWidth="2" />
//       {dataPoints.map((p, i) => (
//         <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#185FA5" />
//       ))}
//       {skills.map((s, i) => {
//         const lp = pt(i, 1.26);
//         return (
//           <text key={i} x={lp.x} y={lp.y} fontSize="9.5" fill="#475569" textAnchor="middle" dominantBaseline="middle" fontWeight="700">
//             {s.label}
//           </text>
//         );
//       })}
//     </svg>
//   );
// };

// export default function PremiumDashboard() {
//   const [tasks, setTasks] = useState(DAILY_TASKS);
//   const [chatMessages, setChatMessages] = useState([
//     { from: "ai", text: "Kỹ năng Listening của bạn tăng 15% tuần qua — rất tốt! Ngữ pháp Part 5 (mệnh đề quan hệ) vẫn cần chú ý. Tôi đã thêm 3 bài tập bổ trợ vào nhiệm vụ hôm nay." },
//   ]);
//   const [chatInput, setChatInput] = useState("");

//   const doneCount = tasks.filter((t) => t.done).length;
//   const todayPct = Math.round((doneCount / tasks.length) * 100);
//   const scorePct = Math.round((USER.currentScore / USER.targetScore) * 100);

//   const sendChat = () => {
//     if (!chatInput.trim()) return;
//     setChatMessages((prev) => [
//       ...prev,
//       { from: "user", text: chatInput },
//       { from: "ai", text: `Tôi sẽ giúp bạn về "${chatInput}". Hãy thử luyện tập theo gợi ý sau!` },
//     ]);
//     setChatInput("");
//   };

//   return (
//     <div style={s.page}>
//       <div style={s.shell}>

//         {/* ── HERO: Chào + Progress Bar ── */}
//         <div style={{
//           ...s.card,
//           background: "linear-gradient(135deg, #0b57c5 0%, #1a6edc 100%)",
//           border: "none",
//           padding: "28px 28px 24px",
//           position: "relative",
//           overflow: "hidden",
//         }}>
//           <div style={{ position: "absolute", right: -30, top: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
//           <div style={{ position: "absolute", right: 60, bottom: -50, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
//             <div>
//               <p style={{ margin: "0 0 6px", fontSize: "0.75rem", fontWeight: 750, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
//                 Tài khoản Premium
//               </p>
//               <h1 style={{ margin: "0 0 6px", fontSize: "1.7rem", fontWeight: 850, color: "#fff", letterSpacing: "-0.02em" }}>
//                 Xin chào, {USER.name.split(" ").slice(-1)[0]} 👋
//               </h1>
//               <p style={{ margin: "0 0 18px", fontSize: "0.9rem", color: "rgba(255,255,255,0.75)" }}>
//                 Bạn đang sử dụng gói Premium với đầy đủ quyền lợi.
//               </p>
//               <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                 {["Toàn bộ đề thi", "Tất cả bộ từ vựng", "Phân tích nâng cao", "Audio chất lượng cao"].map((f) => (
//                   <span key={f} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 650, color: "#fff", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)" }}>
//                     {f}
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <div style={{ flexShrink: 0, textAlign: "right" }}>
//               <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.35rem", fontWeight: 850, color: "#fff", marginLeft: "auto", marginBottom: 8, border: "2px solid rgba(255,255,255,0.3)" }}>
//                 {USER.name.charAt(0)}
//               </div>
//               <p style={{ margin: "0 0 2px", fontSize: "0.78rem", fontWeight: 750, color: "#fff" }}>{USER.name}</p>
//               <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(255,255,255,0.6)" }}>Hết hạn: 15/06/2026</p>
//             </div>
//           </div>

//           <div style={{ marginTop: 20 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
//               <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.75)", fontWeight: 650 }}>Tiến độ đến mục tiêu {USER.targetScore}+</span>
//               <span style={{ fontSize: "0.78rem", fontWeight: 750, color: "#fff" }}>{USER.currentScore} / {USER.targetScore} điểm</span>
//             </div>
//             <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
//               <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #93c5fd, #fff)", width: `${scorePct}%`, transition: "width 1s ease" }} />
//             </div>
//           </div>
//         </div>

//         {/* ── STATS ROW ── */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
//           {[
//             { icon: "bi-collection", color: "#185FA5", bg: "#e9f0ff", label: "Đề đã làm", value: "47", sub: "/ 365 ngày" },
//             { icon: "bi-trophy-fill", color: "#ba7517", bg: "#fff3d6", label: "Điểm cao nhất", value: "820", sub: "/ 990" },
//             { icon: "bi-clock-history", color: "#3B6D11", bg: "#eaf3de", label: "Tổng giờ học", value: "62h", sub: "tích lũy" },
//             { icon: "bi-fire", color: "#e34948", bg: "#fff0f0", label: "Ngày streak", value: `${USER.streak}`, sub: "ngày liên tiếp" },
//           ].map((stat) => (
//             <div key={stat.label} style={s.card}>
//               <div style={{ width: 36, height: 36, borderRadius: 8, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
//                 <i className={`bi ${stat.icon}`} style={{ color: stat.color, fontSize: "1rem" }} />
//               </div>
//               <div style={{ fontSize: "1.75rem", fontWeight: 850, color: "#10233f", lineHeight: 1 }}>{stat.value}</div>
//               <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 2 }}>{stat.sub}</div>
//               <div style={{ fontSize: "0.78rem", fontWeight: 650, color: "#475569", marginTop: 5 }}>{stat.label}</div>
//             </div>
//           ))}
//         </div>

//         {/* ── AI COACH BANNER ── */}
//         <div style={{
//           ...s.card,
//           background: "#e9f0ff",
//           border: "1px solid #b7cdf9",
//           borderLeft: "4px solid #185FA5",
//           padding: "18px 22px",
//           display: "flex",
//           gap: 16,
//           alignItems: "flex-start",
//         }}>
//           <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//             <i className="bi bi-robot" style={{ color: "#fff", fontSize: "1.1rem" }} />
//           </div>
//           <div style={{ flex: 1 }}>
//             <p style={{ margin: "0 0 3px", fontSize: "0.7rem", fontWeight: 750, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.07em" }}>AI Coach · Phân tích hôm nay</p>
//             <p style={{ margin: "0 0 12px", fontSize: "0.92rem", color: "#1e3a6e", lineHeight: 1.6 }}>
//               Kỹ năng Listening của bạn tăng <strong>15%</strong> tuần qua — rất tốt! Tuy nhiên <strong>Ngữ pháp Part 5</strong> (mệnh đề quan hệ) vẫn cần chú ý. Tôi đã thêm 3 bài tập bổ trợ vào nhiệm vụ hôm nay.
//             </p>
//             <div style={{ display: "flex", gap: 8 }}>
//               <button style={{ background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
//                 <i className="bi bi-eye" style={{ marginRight: 5 }} />Chi tiết lỗi sai
//               </button>
//               <button style={{ background: "transparent", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
//                 Bỏ qua
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* ── DAILY TASKS + SCORE CHART ── */}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
//           {/* Tasks */}
//           <div style={s.card}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
//               <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Nhiệm vụ hôm nay</h2>
//               <span style={{ background: "#e9f0ff", color: "#185FA5", borderRadius: 999, padding: "2px 9px", fontSize: "0.7rem", fontWeight: 750 }}>AI gợi ý</span>
//             </div>
//             <p style={{ margin: "0 0 12px", fontSize: "0.77rem", color: "#64748b" }}>Tiến độ: {todayPct}% · {doneCount}/{tasks.length} hoàn thành</p>
//             <div style={{ height: 5, borderRadius: 999, background: "#f1f5f9", marginBottom: 14, overflow: "hidden" }}>
//               <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #185FA5, #3B6D11)", width: `${todayPct}%`, transition: "width 0.5s" }} />
//             </div>
//             <div style={{ display: "grid", gap: 8 }}>
//               {tasks.map((task) => (
//                 <div
//                   key={task.id}
//                   onClick={() => setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done: !t.done } : t))}
//                   style={{
//                     display: "flex",
//                     alignItems: "flex-start",
//                     gap: 10,
//                     padding: "10px 12px",
//                     borderRadius: 8,
//                     border: `1px solid ${task.done ? "#b7f3c8" : "#e5ebf4"}`,
//                     background: task.done ? "#f0fff4" : "#f8fafc",
//                     cursor: "pointer",
//                     transition: "all 0.2s",
//                   }}
//                 >
//                   <div style={{ width: 19, height: 19, borderRadius: 5, border: `2px solid ${task.done ? "#16a34a" : "#b0bec5"}`, background: task.done ? "#16a34a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.2s" }}>
//                     {task.done && <i className="bi bi-check2" style={{ color: "#fff", fontSize: "0.7rem" }} />}
//                   </div>
//                   <div style={{ flex: 1 }}>
//                     <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: task.done ? 500 : 700, color: task.done ? "#64748b" : "#1e293b", textDecoration: task.done ? "line-through" : "none" }}>
//                       {task.title}
//                     </p>
//                     <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>{task.meta}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <button style={{ width: "100%", marginTop: 14, background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: "0.88rem", fontWeight: 750, cursor: "pointer" }}>
//               <i className="bi bi-play-circle" style={{ marginRight: 6 }} />Bắt đầu học ngay
//             </button>
//           </div>

//           {/* Score chart + weekly */}
//           <div style={{ display: "grid", gap: 14 }}>
//             <div style={s.card}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
//                 <div>
//                   <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Biểu đồ tiến bộ</h2>
//                   <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#64748b" }}>4 lần làm đề gần nhất</p>
//                 </div>
//                 <span style={{ background: "#eaf3de", color: "#3B6D11", borderRadius: 999, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 750 }}>
//                   <i className="bi bi-arrow-up" /> +70 điểm / tháng
//                 </span>
//               </div>
//               <ScoreChart scores={RECENT_SCORES} />
//             </div>
//             <div style={s.card}>
//               <h2 style={{ margin: "0 0 12px", fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Nhịp học tuần này</h2>
//               <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 70 }}>
//                 {WEEKLY_STUDY.map((d) => (
//                   <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
//                     <div style={{ width: "100%", height: Math.max(8, d.hours * 20), borderRadius: 3, background: d.hours >= 2 ? "#185FA5" : d.hours >= 1 ? "#93c5fd" : "#dbeafe" }} title={`${d.hours}h`} />
//                     <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>{d.day}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── LỘ TRÌNH + MỨC ĐỘ THÀNH THẠO ── */}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18 }}>
//           {/* Roadmap */}
//           <div style={s.card}>
//             <p style={s.sectionLabel}>Lộ trình học tập</p>
//             <h2 style={{ ...s.sectionTitle, fontSize: "1.2rem", marginBottom: 18 }}>Chặng đường chinh phục</h2>

//             <div style={{ position: "relative", paddingLeft: 32 }}>
//               <div style={{ position: "absolute", left: 10, top: 12, bottom: 12, width: 2, background: "repeating-linear-gradient(180deg, #185FA5 0 4px, transparent 4px 9px)", opacity: 0.25 }} />
//               {ROADMAP.map((step, idx) => (
//                 <div key={step.id} style={{ position: "relative", marginBottom: idx < ROADMAP.length - 1 ? 24 : 0 }}>
//                   <div style={{
//                     position: "absolute",
//                     left: -32,
//                     top: 3,
//                     width: 22,
//                     height: 22,
//                     borderRadius: "50%",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     background: step.status === "done" ? "#16a34a" : step.status === "active" ? "#185FA5" : "#cbd5e1",
//                     boxShadow: step.status === "active" ? "0 0 0 4px rgba(24,95,165,0.15)" : "none",
//                   }}>
//                     <i className={`bi ${step.status === "done" ? "bi-check2" : step.status === "active" ? "bi-play-fill" : "bi-lock-fill"}`} style={{ color: "#fff", fontSize: "0.72rem" }} />
//                   </div>
//                   <div style={{
//                     background: step.status === "done" ? "#f8fafb" : step.status === "active" ? "#e9f0ff" : "transparent",
//                     border: `1px ${step.status === "locked" ? "dashed" : "solid"} ${step.status === "active" ? "#b7cdf9" : "#e5ebf4"}`,
//                     borderRadius: 10,
//                     padding: "14px 16px",
//                     opacity: step.status === "locked" ? 0.55 : 1,
//                   }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
//                       <h3 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: step.status === "active" ? "#185FA5" : "#334155" }}>{step.title}</h3>
//                       <span style={{ fontSize: "0.7rem", fontWeight: 750, color: step.status === "done" ? "#087443" : step.status === "active" ? "#185FA5" : "#94a3b8", flexShrink: 0, marginLeft: 8 }}>
//                         {step.status === "done" ? "✓ Hoàn thành" : step.status === "active" ? `Đang học · ${step.progress}%` : "Chưa mở"}
//                       </span>
//                     </div>
//                     <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: "#64748b", lineHeight: 1.55 }}>{step.desc}</p>
//                     {step.status !== "locked" && (
//                       <div style={{ height: 5, borderRadius: 999, background: "#e8edf6", overflow: "hidden" }}>
//                         <div style={{ height: "100%", background: step.status === "done" ? "#16a34a" : "#185FA5", width: `${step.progress}%`, borderRadius: 999 }} />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* AI insight box */}
//             <div style={{ marginTop: 18, background: "#f0f7ff", border: "1px solid #b7cdf9", borderRadius: 10, padding: "14px 16px" }}>
//               <p style={{ margin: "0 0 4px", fontSize: "0.7rem", fontWeight: 750, color: "#185FA5" }}>💡 Gợi ý AI</p>
//               <p style={{ margin: 0, fontSize: "0.84rem", color: "#1e3a6e", lineHeight: 1.55 }}>
//                 Nếu duy trì tốc độ hiện tại, bạn sẽ đạt <strong>780 điểm</strong> cuối tháng 7. Để về đích 950+, hãy tập trung <strong>Grammar Part 5</strong> và <strong>Reading Part 7</strong> trong 3 tuần tới.
//               </p>
//             </div>
//           </div>

//           {/* Skills + Summary */}
//           <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
//             <div style={s.card}>
//               <h2 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Mức độ thành thạo</h2>
//               <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
//                 <RadarChart skills={SKILL_BARS} />
//               </div>
//               <div style={{ display: "grid", gap: 10 }}>
//                 {SKILL_BARS.map((s_) => (
//                   <div key={s_.label}>
//                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//                       <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155" }}>{s_.label}</span>
//                       <span style={{ fontSize: "0.8rem", fontWeight: 700, color: s_.color }}>{s_.value}%</span>
//                     </div>
//                     <div style={{ height: 6, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
//                       <div style={{ height: "100%", borderRadius: 999, background: s_.color, width: `${s_.value}%`, transition: "width 0.8s ease" }} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Dự báo điểm */}
//             <div style={s.card}>
//               <h2 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Dự báo điểm TOEIC</h2>
//               <div style={{ textAlign: "center", marginBottom: 12 }}>
//                 <div style={{ fontSize: "2.4rem", fontWeight: 850, color: "#185FA5", lineHeight: 1 }}>780–830</div>
//                 <p style={{ margin: "4px 0 10px", fontSize: "0.75rem", color: "#64748b" }}>Ước tính hiện tại</p>
//                 <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#eaf3de", borderRadius: 999, padding: "3px 10px" }}>
//                   <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B6D11", display: "block" }} />
//                   <span style={{ fontSize: "0.72rem", fontWeight: 750, color: "#3B6D11" }}>Độ tin cậy 92%</span>
//                 </div>
//               </div>
//               <div style={{ height: 5, borderRadius: 999, background: "#e8edf6", marginBottom: 8, overflow: "hidden" }}>
//                 <div style={{ height: "100%", background: "#185FA5", width: `${scorePct}%`, borderRadius: 999 }} />
//               </div>
//               <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8", textAlign: "center" }}>
//                 Dựa trên sự ổn định 5 đề gần nhất
//               </p>
//             </div>

//             {/* Tiến độ sử dụng */}
//             <div style={s.card}>
//               <h2 style={{ margin: "0 0 12px", fontSize: "1rem", fontWeight: 800, color: "#10233f" }}>Tiến độ sử dụng</h2>
//               {[
//                 { label: "Đề đã làm", current: 47, total: "∞", pct: 13 },
//                 { label: "Từ vựng đã thuộc", current: 312, total: 2000, pct: 16 },
//                 { label: "Giờ học tích lũy", current: 62, total: 200, pct: 31 },
//               ].map((item) => (
//                 <div key={item.label} style={{ marginBottom: 10 }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//                     <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 650 }}>{item.label}</span>
//                     <span style={{ fontSize: "0.8rem", fontWeight: 750, color: "#10233f" }}>{item.current}{typeof item.total === "number" ? `/${item.total}` : ""}</span>
//                   </div>
//                   <div style={{ height: 5, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
//                     <div style={{ height: "100%", background: "#185FA5", width: `${item.pct}%`, borderRadius: 999 }} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* ── ACCURACY THEO PART ── */}
//         <div style={s.card}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
//             <div>
//               <p style={s.sectionLabel}>Phân tích hiệu suất</p>
//               <h2 style={{ ...s.sectionTitle, fontSize: "1.2rem" }}>Accuracy theo từng Part</h2>
//               <p style={s.sectionSub}>Tổng hợp từ tất cả lần làm bài của bạn.</p>
//             </div>
//             <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//               {badge("Cần cải thiện: Part 5, 6, 7", "#fff0f0", "#a32d2d")}
//             </div>
//           </div>
//           <div style={{ display: "grid", gap: 12 }}>
//             {PART_ACCURACY.map((p) => {
//               const barColor = p.value >= 75 ? "#3B6D11" : p.value >= 60 ? "#BA7517" : "#A32D2D";
//               return (
//                 <div key={p.label} style={{ display: "grid", gridTemplateColumns: "180px 1fr 44px", gap: 12, alignItems: "center" }}>
//                   <span style={{ fontSize: "0.84rem", color: "#475569", fontWeight: 650 }}>{p.label}</span>
//                   <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
//                     <div style={{ height: "100%", background: barColor, width: `${p.value}%`, borderRadius: 999, transition: "width 0.8s ease" }} />
//                   </div>
//                   <span style={{ fontSize: "0.82rem", fontWeight: 750, color: barColor, textAlign: "right" }}>{p.value}%</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* ── AI COACH CHAT ── */}
//         <div style={s.card}>
//           <p style={s.sectionLabel}>AI Coach</p>
//           <h2 style={{ ...s.sectionTitle, fontSize: "1.2rem", marginBottom: 6 }}>Hỏi AI Coach bất cứ điều gì</h2>
//           <p style={{ ...s.sectionSub, marginBottom: 18 }}>Giải thích ngữ pháp, chiến lược thi, phân tích lỗi sai...</p>

//           <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 18 }}>
//             <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
//               <div style={{ background: "#f8fafc", borderRadius: "10px 10px 0 0", border: "1px solid #e5ebf4", borderBottom: "none", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, minHeight: 200, maxHeight: 280, overflowY: "auto" }}>
//                 {chatMessages.map((m, i) => (
//                   <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
//                     <div style={{
//                       maxWidth: "75%",
//                       padding: "9px 13px",
//                       borderRadius: m.from === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
//                       background: m.from === "user" ? "#185FA5" : "#fff",
//                       border: m.from === "ai" ? "1px solid #e5ebf4" : "none",
//                       color: m.from === "user" ? "#fff" : "#334155",
//                       fontSize: "0.87rem",
//                       lineHeight: 1.5,
//                     }}>
//                       {m.text}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div style={{ display: "flex", gap: 8, border: "1px solid #e5ebf4", borderTop: "none", borderRadius: "0 0 10px 10px", background: "#fff", padding: "10px 12px" }}>
//                 <input
//                   style={{ flex: 1, border: "1px solid #e5ebf4", borderRadius: 8, padding: "8px 12px", fontSize: "0.87rem", color: "#10233f", outline: "none", background: "#f8fafc" }}
//                   placeholder="Hỏi AI Coach bất cứ điều gì..."
//                   value={chatInput}
//                   onChange={(e) => setChatInput(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && sendChat()}
//                 />
//                 <button onClick={sendChat} style={{ background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
//                   Gửi
//                 </button>
//               </div>
//             </div>

//             <div>
//               <p style={{ margin: "0 0 10px", fontSize: "0.78rem", fontWeight: 750, color: "#475569" }}>Chủ đề gợi ý</p>
//               <div style={{ display: "grid", gap: 8 }}>
//                 {["Giải thích mệnh đề quan hệ", "Chiến lược Part 7 đọc nhanh", "Top 50 từ vựng tài chính", "Phân tích lỗi sai tuần này"].map((t) => (
//                   <button key={t} onClick={() => setChatInput(t)} style={{ background: "#f8fafc", border: "1px solid #e5ebf4", borderRadius: 8, padding: "9px 12px", fontSize: "0.82rem", color: "#334155", cursor: "pointer", fontWeight: 600, textAlign: "left" }}>
//                     <i className="bi bi-lightning-charge" style={{ color: "#185FA5", marginRight: 6 }} />{t}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── GIA HẠN PREMIUM ── */}
//         <div style={{ ...s.card, background: "#f8faff", border: "1px solid #d6e4f7", padding: "22px 24px" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
//             <div>
//               <p style={s.sectionLabel}>Gia hạn gói Premium</p>
//               <h2 style={{ ...s.sectionTitle, fontSize: "1.15rem" }}>Còn 47 ngày — gia hạn sớm để không gián đoạn học tập.</h2>
//             </div>
//             <span style={{ background: "#fff3d6", color: "#a15c00", borderRadius: 999, padding: "4px 12px", fontSize: "0.72rem", fontWeight: 750, whiteSpace: "nowrap" }}>
//               ⏰ 47 ngày còn lại
//             </span>
//           </div>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
//             {[
//               { period: "1 tháng", price: "99.000đ", popular: false, save: null },
//               { period: "6 tháng", price: "499.000đ", popular: true, save: "Tiết kiệm 17%" },
//               { period: "12 tháng", price: "899.000đ", popular: false, save: "Tiết kiệm 25%" },
//             ].map((plan) => (
//               <div key={plan.period} style={{
//                 border: `${plan.popular ? "2px solid #185FA5" : "1px solid #d6e4f7"}`,
//                 borderRadius: 10,
//                 padding: "14px 16px",
//                 background: plan.popular ? "#e9f0ff" : "#fff",
//                 textAlign: "center",
//                 position: "relative",
//               }}>
//                 {plan.popular && (
//                   <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#185FA5", color: "#fff", borderRadius: 999, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 750, whiteSpace: "nowrap" }}>Phổ biến</span>
//                 )}
//                 <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: 4 }}>{plan.period}</div>
//                 <div style={{ fontSize: "1.3rem", fontWeight: 850, color: "#10233f" }}>{plan.price}</div>
//                 {plan.save && <div style={{ fontSize: "0.7rem", color: "#3B6D11", fontWeight: 650, marginTop: 2 }}>{plan.save}</div>}
//               </div>
//             ))}
//           </div>
//           <button style={{ width: "100%", background: "#185FA5", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: "0.92rem", fontWeight: 750, cursor: "pointer" }}>
//             <i className="bi bi-arrow-repeat" style={{ marginRight: 6 }} />Tiến hành gia hạn ↗
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }