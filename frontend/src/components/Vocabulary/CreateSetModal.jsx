import React, { useState } from "react";

const CreateSetModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: "", description: "", category: "general" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Vui lòng nhập tên bộ từ."); return; }

    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/vocabulary/sets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tạo bộ từ thất bại.");
      onCreated(data);
      onClose();
    } catch (err) {
      // Nếu backend chưa có endpoint, tạo local
      onCreated({
        id: `local_${Date.now()}`,
        title: form.name,
        description: form.description,
        category: form.category,
        owned: true,
        total: 0,
        learned: 0,
        isLocal: true,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="learning-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="learning-modal">
        <div className="learning-modal-head">
          <h2 className="exam-title" style={{ fontSize: "1.2rem" }}>
            <i className="bi bi-folder-plus" style={{ marginRight: 8 }} />
            Tạo bộ từ mới
          </h2>
          <button className="learning-btn ghost" onClick={onClose} title="Đóng">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <form className="learning-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fff0f0", color: "#b42318", fontSize: "0.88rem" }}>
              {error}
            </div>
          )}

          <div className="learning-field">
            <label>Tên bộ từ *</label>
            <input
              className="learning-input"
              name="name"
              value={form.name}
              onChange={update}
              placeholder="VD: TOEIC Part 5, Business Emails..."
              autoFocus
              required
            />
          </div>

          <div className="learning-field">
            <label>Mô tả (tuỳ chọn)</label>
            <textarea
              className="learning-input"
              name="description"
              value={form.description}
              onChange={update}
              placeholder="Mô tả ngắn về bộ từ này..."
              rows={2}
              style={{ resize: "none" }}
            />
          </div>

          <div className="learning-field">
            <label>Chủ đề</label>
            <select className="learning-input" name="category" value={form.category} onChange={update}>
              <option value="general">Từ vựng chung</option>
              <option value="business">Business / Office</option>
              <option value="toeic">Luyện TOEIC</option>
              <option value="academic">Academic</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
          </div>

          <div className="learning-actions" style={{ justifyContent: "flex-end" }}>
            <button className="learning-btn" type="button" onClick={onClose}>Hủy</button>
            <button className="learning-btn primary" type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo bộ từ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSetModal;