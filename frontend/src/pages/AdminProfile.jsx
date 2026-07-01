import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logout } from "../redux/authSlice.js";
import apiInstance from "../utils/axiosInstance";
import { resolveMediaUrl, getAvatarFallback } from "../utils/mediaUrl";

function calcStrength(v) {
  let s = 0;
  if (v.length >= 8) s += 25;
  if (/[A-Z]/.test(v)) s += 25;
  if (/[a-z]/.test(v) && /\d/.test(v)) s += 25;
  if (/[@$!%*?&]/.test(v)) s += 25;
  return s;
}

function strengthLabel(pwStrength) {
  if (pwStrength === 0) return { text: "", color: "bg-secondary" };
  if (pwStrength <= 25) return { text: "Yếu", color: "bg-danger" };
  if (pwStrength <= 50) return { text: "Trung bình", color: "bg-warning" };
  if (pwStrength <= 75) return { text: "Khá", color: "bg-info" };
  return { text: "Mạnh", color: "bg-success" };
}

export default function AdminProfile() {
  const { user: reduxUser } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: "", phoneNumber: "", avatarUrl: "",
    email: "", role: "", gender: "", dateOfBirth: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmNewPassword: "",
  });
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwStrength, setPwStrength] = useState(0);

  // Active tab: "info" | "password"
  const [tab, setTab] = useState("info");

  const avatarSrc = avatarPreview
    || resolveMediaUrl(profileData.avatarUrl)
    || getAvatarFallback(profileData.fullName || reduxUser?.name || "U", 200);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await apiInstance.get("/api/profile");
      const d = res.data.data;
      setProfileData({
        fullName: d.fullName || "",
        phoneNumber: d.phoneNumber || "",
        avatarUrl: d.avatarUrl || "",
        email: d.email || "",
        role: d.role || reduxUser?.role || "",
        gender: d.gender || "",
        dateOfBirth: d.dateOfBirth ? d.dateOfBirth.slice(0, 10) : "",
      });
    } catch {
      toast.error("Không thể tải thông tin cá nhân.");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e) =>
    setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (name === "newPassword") setPwStrength(calcStrength(value));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("fullName", profileData.fullName);
      fd.append("phoneNumber", profileData.phoneNumber);
      if (profileData.gender) fd.append("gender", profileData.gender);
      if (profileData.dateOfBirth) fd.append("dateOfBirth", profileData.dateOfBirth);
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await apiInstance.put("/api/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message || "Cập nhật hồ sơ thành công.");
      setAvatarFile(null);
      setAvatarPreview(null);
      await fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật hồ sơ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword)
      return toast.warning("Mật khẩu xác nhận không khớp.");
    if (pwStrength < 100)
      return toast.warning("Mật khẩu chưa đủ mạnh (cần đủ 4 tiêu chí).");
    try {
      setIsChangingPw(true);
      const res = await apiInstance.put("/api/profile/change-password", passwordData);
      toast.success(res.data.message || "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      setTimeout(() => { dispatch(logout()); navigate("/login"); }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setIsChangingPw(false);
    }
  };

  const togglePw = (field) => setShowPw((p) => ({ ...p, [field]: !p[field] }));
  const sl = strengthLabel(pwStrength);

  if (profileLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="row g-4">
      {/* ── Left: Avatar card ── */}
      <div className="col-md-4 col-lg-3">
        <div className="dashboard-card text-center py-4 h-100">
          {/* Clickable avatar */}
          <div
            className="position-relative d-inline-block mb-3"
            style={{
              cursor: "pointer",
              padding: 4,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
              boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
            }}
            onClick={() => fileInputRef.current.click()}
            title="Nhấp để thay đổi ảnh đại diện"
          >
            <img
              src={avatarSrc}
              alt="avatar"
              style={{
                width: 160,
                height: 160,
                objectFit: "cover",
                borderRadius: "50%",
                border: "4px solid #fff",
                display: "block",
              }}
            />
            <div
              className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: 34, height: 34, border: "2px solid #fff", bottom: 6, right: 6 }}
            >
              <i className="bi bi-camera-fill" style={{ fontSize: "0.9rem" }} />
            </div>
            <input
              type="file"
              className="d-none"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>

          <h5 className="fw-bold mb-1">{profileData.fullName || "—"}</h5>
          <p className="text-muted small mb-2">{profileData.email}</p>
          <span className="badge bg-danger px-3 py-2 mb-3">
            <i className="bi bi-shield-lock-fill me-1" />
            {profileData.role}
          </span>

          {avatarFile && (
            <div className="mt-2">
              <p className="text-success small mb-1">
                <i className="bi bi-check-circle me-1" />Ảnh mới đã chọn
              </p>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
              >
                Hủy ảnh
              </button>
            </div>
          )}

          {!avatarFile && (
            <p className="text-muted" style={{ fontSize: "0.78rem" }}>
              Nhấp vào ảnh để thay đổi
            </p>
          )}

          {/* Quick info */}
          <div className="mt-3 text-start border-top pt-3 px-2">
            {[
              { icon: "bi-envelope-fill", label: profileData.email },
              { icon: "bi-telephone-fill", label: profileData.phoneNumber || "Chưa cập nhật" },
              { icon: profileData.gender === "Nam" ? "bi-gender-male" : profileData.gender === "Nữ" ? "bi-gender-female" : "bi-person-fill", label: profileData.gender || "Chưa cập nhật" },
            ].map((item) => (
              <div key={item.icon} className="d-flex align-items-center gap-2 mb-2 small text-muted">
                <i className={`bi ${item.icon} text-primary`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Tabs ── */}
      <div className="col-md-8 col-lg-9">
        {/* Tab nav */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${tab === "info" ? "active fw-semibold" : ""}`}
              onClick={() => setTab("info")}
            >
              <i className="bi bi-person-lines-fill me-1" />
              Thông tin cá nhân
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${tab === "password" ? "active fw-semibold" : ""}`}
              onClick={() => setTab("password")}
            >
              <i className="bi bi-shield-lock-fill me-1" />
              Đổi mật khẩu
            </button>
          </li>
        </ul>

        {/* ─ Tab: Info ─ */}
        {tab === "info" && (
          <div className="dashboard-card">
            <h6
              className="fw-bold mb-4 border-bottom pb-2 text-muted text-uppercase"
              style={{ fontSize: "0.78rem", letterSpacing: 1 }}
            >
              <i className="bi bi-person-badge-fill me-2" />
              Chỉnh sửa thông tin
            </h6>
            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">
                    Email <small className="text-muted">(Không thể thay đổi)</small>
                  </label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={profileData.email}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Giới tính</label>
                  <select
                    className="form-select"
                    name="gender"
                    value={profileData.gender}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Ngày sinh</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={saving}
                  >
                    {saving
                      ? <><span className="spinner-border spinner-border-sm me-2" />Đang lưu...</>
                      : <><i className="bi bi-check-lg me-1" />Lưu thay đổi</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ─ Tab: Password ─ */}
        {tab === "password" && (
          <div className="dashboard-card">
            <h6
              className="fw-bold mb-4 border-bottom pb-2 text-muted text-uppercase"
              style={{ fontSize: "0.78rem", letterSpacing: 1 }}
            >
              <i className="bi bi-shield-lock-fill me-2 text-danger" />
              Đổi mật khẩu
            </h6>
            <form onSubmit={handlePasswordSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold small">Mật khẩu hiện tại</label>
                  <div className="input-group">
                    <input
                      type={showPw.current ? "text" : "password"}
                      className="form-control"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePwChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => togglePw("current")}
                    >
                      <i className={`bi ${showPw.current ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Mật khẩu mới</label>
                  <div className="input-group">
                    <input
                      type={showPw.new ? "text" : "password"}
                      className="form-control"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePwChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => togglePw("new")}
                    >
                      <i className={`bi ${showPw.new ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="progress" style={{ height: 5 }}>
                        <div
                          className={`progress-bar ${sl.color}`}
                          style={{ width: `${pwStrength}%`, transition: "width .3s" }}
                        />
                      </div>
                      <small className={`text-${sl.color.replace("bg-", "")}`}>{sl.text}</small>
                    </div>
                  )}
                  <small className="text-muted d-block mt-1">
                    ≥ 8 ký tự, chữ hoa, thường, số &amp; ký tự đặc biệt.
                  </small>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Xác nhận mật khẩu mới</label>
                  <div className="input-group">
                    <input
                      type={showPw.confirm ? "text" : "password"}
                      className="form-control"
                      name="confirmNewPassword"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePwChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => togglePw("confirm")}
                    >
                      <i className={`bi ${showPw.confirm ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-danger px-4"
                    disabled={isChangingPw}
                  >
                    {isChangingPw
                      ? <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</>
                      : <><i className="bi bi-shield-check me-1" />Cập nhật mật khẩu</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
