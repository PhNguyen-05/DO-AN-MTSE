import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const createEmptyForm = () => ({
  name: "",
  releaseYear: new Date().getFullYear(),
  difficulty: "medium",
  examType: "bundle",
  price: "",
  priceBundle: 0,
  priceListening: 0,
  priceReading: 0,
  pdf: null,
  audios: [],
  hasExistingPdf: false,
  existingPdfUrl: "",
  existingAudioUrls: [],
  removeExistingAudios: false
});

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ""
});

const yearOptions = [2022, 2023, 2024, 2025, 2026, 2027];
const currency = new Intl.NumberFormat("vi-VN");
const examTypeOptions = [
  { value: "bundle", label: "Đề thi trọn gói", priceKey: "priceBundle" },
  { value: "listening", label: "Đề phần Nghe", priceKey: "priceListening" },
  { value: "reading", label: "Đề phần Đọc", priceKey: "priceReading" }
];

const getExamTypeFromExam = (exam) => {
  if (Number(exam.priceListening || 0) > 0) return "listening";
  if (Number(exam.priceReading || 0) > 0) return "reading";
  return "bundle";
};

const getExamDisplayPrice = (exam) => {
  const type = getExamTypeFromExam(exam);
  const option = examTypeOptions.find((item) => item.value === type);
  return exam[option?.priceKey || "priceBundle"];
};
const formatVnd = (value) => `${currency.format(Number(value || 0))} đồng`;

const getFileNameFromUrl = (url) => {
  if (!url) return "";

  try {
    return decodeURIComponent(url.split("/").pop() || url);
  } catch {
    return url.split("/").pop() || url;
  }
};

const getMaterialLabel = (exam) => {
  const materials = [];

  if (exam.pdfUrl) {
    materials.push("PDF");
  }

  if ((exam.audioUrls || []).length > 0) {
    materials.push("MP3");
  }

  return materials.length ? materials.join(" / ") : "Chưa có";
};

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const [activeView, setActiveView] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const maxRevenue = useMemo(() => {
    const values = (stats?.monthlyRevenue || []).map((item) => Number(item.total) || 0);
    return Math.max(...values, 1);
  }, [stats]);

  const completionRate = Number(stats?.completionRate || 0);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const loadAdminData = async () => {
    const [statsResponse, examsResponse] = await Promise.all([
      api.get("/admin/dashboard", { headers: authHeaders }),
      api.get("/admin/exams?includeHidden=true", { headers: authHeaders })
    ]);

    setStats(statsResponse.data);
    setExams(examsResponse.data);
  };

  useEffect(() => {
    loadAdminData().catch(() => {
      setNotice({ type: "danger", message: "Could not load admin data." });
    });
  }, []);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 15000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const changeView = (view) => {
    setActiveView(view);
    setNotice(null);
  };

  const updateField = (event) => {
    const { name, value, files } = event.target;

    if (name === "pdf") {
      setForm((current) => ({ ...current, pdf: files[0] || null }));
      return;
    }

    if (name === "audios") {
      setForm((current) => ({
        ...current,
        audios: Array.from(files || []),
        removeExistingAudios: files?.length ? false : current.removeExistingAudios
      }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setFormResetKey((current) => current + 1);
  };

  const submitExam = async (event) => {
    event.preventDefault();
    setNotice(null);

    const selectedType = examTypeOptions.find((item) => item.value === form.examType) || examTypeOptions[0];
    const selectedPrice = Number(form.price);

    if (!form.name.trim() || !form.releaseYear || !form.difficulty || !form.examType) {
      setNotice({ type: "danger", message: "Vui long nhap day du thong tin de thi." });
      return;
    }

    if (!Number.isFinite(selectedPrice) || selectedPrice <= 0) {
      setNotice({ type: "danger", message: "Vui long nhap gia tien lon hon 0." });
      return;
    }

    if (!editingId && !form.pdf) {
      setNotice({ type: "danger", message: "Vui long tai file de PDF." });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    ["name", "releaseYear", "difficulty"].forEach((key) => {
      formData.append(key, form[key]);
    });
    formData.append("priceBundle", selectedType.priceKey === "priceBundle" ? selectedPrice : 0);
    formData.append("priceListening", selectedType.priceKey === "priceListening" ? selectedPrice : 0);
    formData.append("priceReading", selectedType.priceKey === "priceReading" ? selectedPrice : 0);

    if (form.pdf) {
      formData.append("pdf", form.pdf);
    }

    form.audios.forEach((audio) => formData.append("audios", audio));
    if (form.removeExistingAudios) {
      formData.append("removeAudios", "true");
    }

    try {
      if (editingId) {
        await api.put(`/admin/exams/${editingId}`, formData, { headers: authHeaders });
      } else {
        await api.post("/admin/exams", formData, { headers: authHeaders });
      }

      await loadAdminData();
      resetForm();
      setNotice({ type: "success", message: "Exam saved successfully." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not save exam." });
    } finally {
      setLoading(false);
    }
  };

  const editExam = (exam) => {
    const examType = getExamTypeFromExam(exam);
    setEditingId(exam._id);
    setForm({
      name: exam.name,
      releaseYear: exam.releaseYear,
      difficulty: exam.difficulty,
      examType,
      price: getExamDisplayPrice(exam) || "",
      priceBundle: exam.priceBundle,
      priceListening: exam.priceListening,
      priceReading: exam.priceReading,
      pdf: null,
      audios: [],
      hasExistingPdf: Boolean(exam.pdfUrl),
      existingPdfUrl: exam.pdfUrl || "",
      existingAudioUrls: exam.audioUrls || [],
      removeExistingAudios: false
    });
    setFormResetKey((current) => current + 1);
  };

  const removeExistingAudios = () => {
    setForm((current) => ({
      ...current,
      existingAudioUrls: [],
      audios: [],
      removeExistingAudios: true
    }));
    setFormResetKey((current) => current + 1);
  };

  const removeExam = async (examId) => {
    if (!window.confirm("Delete this exam? Purchased exams will be hidden instead.")) {
      return;
    }

    try {
      const response = await api.delete(`/admin/exams/${examId}`, { headers: authHeaders });
      await loadAdminData();
      setNotice({ type: "info", message: response.data.message });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not delete exam." });
    }
  };

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark">T</span>
          <div>
            <strong>TOEIC Admin</strong>
            <small>{user.role || "staff"}</small>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <button className={activeView === "dashboard" ? "active" : ""} type="button" onClick={() => changeView("dashboard")}>
            <i className="bi bi-grid-1x2" aria-hidden="true" />
            Dashboard
          </button>
          <button className={activeView === "exams" ? "active" : ""} type="button" onClick={() => changeView("exams")}>
            <i className="bi bi-journal-text" aria-hidden="true" />
            Quản lý đề thi
          </button>
          <Link to="/profile">
            <i className="bi bi-person" aria-hidden="true" />
            Hồ sơ
          </Link>
        </nav>

        <button className="admin-logout" type="button" onClick={logout}>
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
          Đăng xuất
        </button>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="admin-breadcrumb">Home / {activeView === "dashboard" ? "Dashboard" : "Quản lý đề thi"}</p>
            <h1>{activeView === "dashboard" ? "Thống kê hệ thống" : "Quản lý Đề thi TOEIC"}</h1>
          </div>
          <div className="admin-account">
            <span>{user.email || "Staff account"}</span>
            <strong>{user.role || "staff"}</strong>
          </div>
        </header>

        {notice && <div className={`alert alert-${notice.type}`}>{notice.message}</div>}

        {activeView === "dashboard" && (
          <div className="dashboard-grid">
            <section className="metric-card primary">
              <div className="metric-icon"><i className="bi bi-people" aria-hidden="true" /></div>
              <span>Tổng số User</span>
              <strong>{stats?.totalUsers ?? 0}</strong>
              <small>Học viên đang có trong hệ thống</small>
            </section>

            <section className="metric-card">
              <div className="metric-icon"><i className="bi bi-file-earmark-text" aria-hidden="true" /></div>
              <span>Tổng số Đề thi</span>
              <strong>{stats?.totalExams ?? 0}</strong>
              <small>Đề thi TOEIC đang hiển thị</small>
            </section>

            <section className="metric-card completion-card">
              <div className="metric-icon"><i className="bi bi-check2-circle" aria-hidden="true" /></div>
              <span>Tỉ lệ hoàn thành bài làm</span>
              <strong>{completionRate}%</strong>
              <div className="completion-track" aria-label={`Completion rate ${completionRate}%`}>
                <span style={{ width: `${Math.min(100, completionRate)}%` }} />
              </div>
              <small>{stats?.completedAttempts ?? 0}/{stats?.totalAttempts ?? 0} lượt làm đã hoàn thành</small>
            </section>

            <section className="admin-panel chart-panel">
              <div className="panel-heading">
                <div>
                  <h2>Biểu đồ tổng quan</h2>
                </div>
              </div>
              <div className="system-bars">
                {[
                  { label: "User", value: stats?.totalUsers ?? 0 },
                  { label: "Đề thi", value: stats?.totalExams ?? 0 },
                  { label: "Hoàn thành", value: completionRate }
                ].map((item) => (
                  <div className="system-bar" key={item.label}>
                    <span>{item.label}</span>
                    <div><span style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }} /></div>
                    <strong>{item.value}{item.label === "Hoàn thành" ? "%" : ""}</strong>
                  </div>
                ))}
              </div>
            </section>

            {user.role === "admin" && (
              <section className="admin-panel revenue-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Doanh thu dòng tiền</h2>
                  </div>
                  <strong>{formatVnd(stats?.revenue)}</strong>
                </div>
                <div className="revenue-chart">
                  {(stats?.monthlyRevenue || []).map((item) => (
                    <div className="revenue-bar" key={item.month}>
                      <span style={{ height: `${Math.max(10, (Number(item.total) / maxRevenue) * 100)}%` }} />
                      <small>{item.month}</small>
                    </div>
                  ))}
                  {!(stats?.monthlyRevenue || []).length && (
                    <p className="empty-chart">Chưa có dữ liệu doanh thu.</p>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {activeView === "exams" && (
          <div className="exam-management-grid">
            <form className="admin-panel exam-form" key={formResetKey} onSubmit={submitExam}>
              <div className="panel-heading">
                <div>
                  <h2>{editingId ? "Chỉnh sửa đề thi" : "Thêm mới đề thi"}</h2>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="name">Tên đề</label>
                <input className="form-control" id="name" name="name" value={form.name} onChange={updateField} required />
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="releaseYear">Năm phát hành</label>
                  <select className="form-select" id="releaseYear" name="releaseYear" value={form.releaseYear} onChange={updateField}>
                    {yearOptions.map((year) => <option value={year} key={year}>{year}</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="difficulty">Mức độ khó</label>
                  <select className="form-select" id="difficulty" name="difficulty" value={form.difficulty} onChange={updateField}>
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>

              <div className="price-grid">
                <label>
                  <span>Loại đề thi</span>
                  <select className="form-select" name="examType" value={form.examType} onChange={updateField} required>
                    {examTypeOptions.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Giá tiền</span>
                  <input className="form-control" name="price" type="number" min="1" value={form.price} onChange={updateField} required />
                  <small>{formatVnd(form.price)}</small>
                </label>
              </div>

              <div className="upload-zone">
                <label htmlFor="pdf">
                  <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                  <span>Tải file đề .pdf</span>
                  <input id="pdf" name="pdf" type="file" accept="application/pdf" onChange={updateField} required={!editingId && !form.hasExistingPdf} />
                  {form.existingPdfUrl && !form.pdf && (
                    <small className="current-file">Hiện có: {getFileNameFromUrl(form.existingPdfUrl)}</small>
                  )}
                  {form.pdf && (
                    <small className="current-file">Mới: {form.pdf.name}</small>
                  )}
                </label>
                <label htmlFor="audios">
                  <i className="bi bi-music-note-beamed" aria-hidden="true" />
                  <span>Tải file nghe .mp3</span>
                  <input id="audios" name="audios" type="file" accept="audio/mpeg,audio/mp3" multiple onChange={updateField} />
                  {(form.existingAudioUrls.length > 0 || form.audios.length > 0) && (
                    <div className="current-files">
                      {form.existingAudioUrls.length > 0 && !form.audios.length && (
                        <small>Hiện có: {form.existingAudioUrls.map(getFileNameFromUrl).join(", ")}</small>
                      )}
                      {form.audios.length > 0 && (
                        <small>Mới: {form.audios.map((audio) => audio.name).join(", ")}</small>
                      )}
                      {form.existingAudioUrls.length > 0 && (
                        <button className="link-button danger" type="button" onClick={removeExistingAudios}>
                          Bỏ file nghe
                        </button>
                      )}
                    </div>
                  )}
                </label>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu đề thi"}
                </button>
                {editingId && (
                  <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>
                    Hủy
                  </button>
                )}
              </div>
            </form>

            <section className="admin-panel exam-list-panel">
              <div className="panel-heading">
                <div>
                  <h2>Danh sách đề thi</h2>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle admin-table">
                  <thead>
                    <tr>
                      <th>Tên đề</th>
                      <th>Năm</th>
                      <th>Độ khó</th>
                      <th>Loại đề</th>
                      <th>Giá tiền</th>
                      <th>Học liệu</th>
                      <th>Trạng thái</th>
                      <th className="text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam) => (
                      <tr key={exam._id}>
                        <td><strong>{exam.name}</strong></td>
                        <td>{exam.releaseYear}</td>
                        <td><span className="soft-badge">{exam.difficulty}</span></td>
                        <td>{examTypeOptions.find((option) => option.value === getExamTypeFromExam(exam))?.label}</td>
                        <td>{formatVnd(getExamDisplayPrice(exam))}</td>
                        <td>{getMaterialLabel(exam)}</td>
                        <td>{exam.isHidden ? <span className="status-badge hidden">Đã ẩn</span> : <span className="status-badge">Hiển thị</span>}</td>
                        <td className="text-end">
                          <button className="icon-action" type="button" onClick={() => editExam(exam)} title="Chỉnh sửa">
                            <i className="bi bi-pencil-square" aria-hidden="true" />
                          </button>
                          <button className="icon-action danger" type="button" onClick={() => removeExam(exam._id)} title="Xóa đề thi">
                            <i className="bi bi-trash" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!exams.length && (
                      <tr>
                        <td className="text-center text-secondary py-4" colSpan="8">Chưa có đề thi.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
