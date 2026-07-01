import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logout } from "../redux/authSlice.js";
import apiInstance from "../utils/axiosInstance";
import { resolveMediaUrl, getAvatarFallback } from "../utils/mediaUrl";

function EditProfile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const isAdmin     = ["Admin", "Manager", "Employee"].includes(user?.role);
  const profilePath = isAdmin ? "/admin/profile" : "/profile";

  /* ── Profile state ── */
  const [profileData, setProfileData] = useState({
    fullName: "", phoneNumber: "", scoreTarget: 0,
    avatarUrl: "", email: "", accountType: "", role: "",
    gender: "", dateOfBirth: "",
  });
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading,       setLoading]       = useState(false);
  const fileInputRef = useRef(null);

  /* ── Password state ── */
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmNewPassword: ""
  });
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwStrength, setPwStrength] = useState(0);

  const calcStrength = (v) => {
    let s = 0;
    if (v.length >= 8)                      s += 25;
    if (/[A-Z]/.test(v))                    s += 25;
    if (/[a-z]/.test(v) && /\d/.test(v))   s += 25;
    if (/[@$!%*?&]/.test(v))               s += 25;
    return s;
  };

  const strengthLabel = () => {
    if (pwStrength === 0)   return { text: "", color: "bg-secondary" };
    if (pwStrength <= 25)   return { text: "Yếu", color: "bg-danger" };
    if (pwStrength <= 50)   return { text: "Trung bình", color: "bg-warning" };
    if (pwStrength <= 75)   return { text: "Khá", color: "bg-info" };
    return { text: "Mạnh", color: "bg-success" };
  };

  /* ── Load profile ── */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiInstance.get("/api/profile");
      const d   = res.data.data;
      setProfileData({
        fullName:    d.fullName    || "",
        phoneNumber: d.phoneNumber || "",
        scoreTarget: d.scoreTarget || 0,
        avatarUrl:   d.avatarUrl   || "",
        email:       d.email       || "",
        accountType: d.accountType || "Thường",
        role:        d.role        || user?.role || "",
        gender:      d.gender      || "",
        dateOfBirth: d.dateOfBirth ? d.dateOfBirth.slice(0, 10) : "",
      });
    } catch {
      toast.error("Không thể tải thông tin cá nhân.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const avatarSrc = avatarPreview
    || resolveMediaUrl(profileData.avatarUrl)
    || getAvatarFallback(profileData.fullName || "U", 150);

  /* ── Handlers ── */
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
      setLoading(true);
      const fd = new FormData();
      fd.append("fullName",    profileData.fullName);
      fd.append("phoneNumber", profileData.phoneNumber);
      if (!isAdmin) fd.append("scoreTarget", profileData.scoreTarget);
      if (profileData.gender)      fd.append("gender",      profileData.gender);
      if (profileData.dateOfBirth) fd.append("dateOfBirth", profileData.dateOfBirth);
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await apiInstance.put("/api/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(res.data.message || "Cập nhật hồ sơ thành công.");

      const updatedAvatar = res.data.data?.avatarUrl;
      if (updatedAvatar) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser) {
          storedUser.avatarUrl = updatedAvatar;
          localStorage.setItem("user", JSON.stringify(storedUser));
        }
      }

      fetchProfile();
      setAvatarFile(null);
      // Navigate back to profile view
      navigate(profilePath);
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật hồ sơ thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword)
      return toast.warning("Mật khẩu xác nhận không khớp.");
    if (pwStrength < 100)
      return toast.warning("Mật khẩu chưa đủ mạnh.");
    try {
      setIsChangingPw(true);
      const res = await apiInstance.put("/api/profile/change-password", passwordData);
      toast.success(res.data.message || "Đổi mật khẩu thành công.");
      setTimeout(() => { dispatch(logout()); navigate("/login"); }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setIsChangingPw(false);
    }
  };

  const EyeBtn = ({ field }) => (
    <button type="button" className="btn btn-outline-secondary btn-sm"
      onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}>
      <i className={`bi ${showPw[field] ? "bi-eye-slash" : "bi-eye"}`} />
    </button>
  );

  const sl = strengthLabel();

  /* ════════════════════════ ADMIN LAYOUT ════════════════════════ */
  if (isAdmin) {
    return (
      <div className="bg-light min-vh-100 pb-5 pt-4">
        <div className="container-fluid px-4" style={{ maxWidth: 900 }}>

          {/* Topbar */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <p className="text-muted small mb-0">Trang chủ / Hồ sơ / <strong>Chỉnh sửa</strong></p>
              <h4 className="fw-bold mb-0">Chỉnh sửa hồ sơ</h4>
            </div>
            <Link to={profilePath} className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-1" />Quay lại hồ sơ
            </Link>
          </div>

          <div className="row g-4">
            {/* Avatar card */}
            <div className="col-md-4">
              <div className="dashboard-card text-center py-4">
                <div className="position-relative d-inline-block mb-3" style={{ cursor: "pointer" }}
                  onClick={() => fileInputRef.current.click()}>
                  <img src={avatarSrc} alt="avatar"
                    className="rounded-circle border border-3 shadow"
                    style={{ width: 120, height: 120, objectFit: "cover" }} />
                  <div className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32 }}>
                    <i className="bi bi-camera-fill" style={{ fontSize: "0.85rem" }} />
                  </div>
                  <input type="file" className="d-none" ref={fileInputRef}
                    accept="image/*" onChange={handleAvatarChange} />
                </div>
                <h6 className="fw-bold mb-0">{profileData.fullName || "—"}</h6>
                <p className="text-muted small mb-2">{profileData.email}</p>
                <span className="badge bg-danger px-3 py-2">
                  <i className="bi bi-shield-lock-fill me-1" />{profileData.role}
                </span>
                <p className="text-muted small mt-3 mb-0">Nhấp vào ảnh để thay đổi</p>
              </div>
            </div>

            {/* Info form */}
            <div className="col-md-8">
              <div className="dashboard-card mb-4">
                <h6 className="fw-bold mb-4 border-bottom pb-2 text-muted text-uppercase" style={{ fontSize: "0.78rem", letterSpacing: 1 }}>
                  <i className="bi bi-person-lines-fill me-2" />Thông tin cá nhân
                </h6>
                <form onSubmit={handleProfileSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Họ và tên</label>
                      <input type="text" className="form-control" name="fullName"
                        value={profileData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">
                        Email <small className="text-muted">(Không thể thay đổi)</small>
                      </label>
                      <input type="email" className="form-control bg-light"
                        value={profileData.email} disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Số điện thoại</label>
                      <input type="text" className="form-control" name="phoneNumber"
                        value={profileData.phoneNumber} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Giới tính</label>
                      <select className="form-select" name="gender"
                        value={profileData.gender} onChange={handleChange}>
                        <option value="">-- Chọn --</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Ngày sinh</label>
                      <input type="date" className="form-control" name="dateOfBirth"
                        value={profileData.dateOfBirth} onChange={handleChange} />
                    </div>
                    <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                      <Link to={profilePath} className="btn btn-outline-secondary">Hủy</Link>
                      <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                        {loading
                          ? <><span className="spinner-border spinner-border-sm me-2" />Đang lưu...</>
                          : <><i className="bi bi-check-lg me-1" />Lưu thay đổi</>}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Change password */}
              <div className="dashboard-card">
                <h6 className="fw-bold mb-4 border-bottom pb-2 text-muted text-uppercase" style={{ fontSize: "0.78rem", letterSpacing: 1 }}>
                  <i className="bi bi-shield-lock-fill me-2 text-danger" />Đổi mật khẩu
                </h6>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Mật khẩu hiện tại</label>
                      <div className="input-group">
                        <input type={showPw.current ? "text" : "password"}
                          className="form-control" name="currentPassword"
                          value={passwordData.currentPassword} onChange={handlePwChange} required />
                        <EyeBtn field="current" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Mật khẩu mới</label>
                      <div className="input-group">
                        <input type={showPw.new ? "text" : "password"}
                          className="form-control" name="newPassword"
                          value={passwordData.newPassword} onChange={handlePwChange} required />
                        <EyeBtn field="new" />
                      </div>
                      {passwordData.newPassword && (
                        <div className="mt-2">
                          <div className="progress" style={{ height: 5 }}>
                            <div className={`progress-bar ${sl.color}`}
                              style={{ width: `${pwStrength}%`, transition: "width .3s" }} />
                          </div>
                          <small className={`text-${sl.color.replace("bg-", "")}`}>{sl.text}</small>
                        </div>
                      )}
                      <small className="text-muted d-block mt-1">≥ 8 ký tự, chữ hoa, thường, số & ký tự đặc biệt.</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Xác nhận mật khẩu mới</label>
                      <div className="input-group">
                        <input type={showPw.confirm ? "text" : "password"}
                          className="form-control" name="confirmNewPassword"
                          value={passwordData.confirmNewPassword} onChange={handlePwChange} required />
                        <EyeBtn field="confirm" />
                      </div>
                    </div>
                    <div className="col-12 d-flex justify-content-end">
                      <button type="submit" className="btn btn-danger px-4" disabled={isChangingPw}>
                        {isChangingPw
                          ? <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</>
                          : <><i className="bi bi-shield-check me-1" />Cập nhật mật khẩu</>}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ════════════════════════ USER LAYOUT ════════════════════════ */
  return (
    <div className="bg-light min-vh-100 pb-5 pt-4">
      <div className="container" style={{ maxWidth: 860 }}>

        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/user/home" className="text-decoration-none">Trang Chủ</Link></li>
            <li className="breadcrumb-item"><Link to={profilePath} className="text-decoration-none">Hồ sơ</Link></li>
            <li className="breadcrumb-item active">Chỉnh sửa</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* Avatar */}
          <div className="col-lg-3 text-center">
            <div className="dashboard-card p-4">
              <div className="position-relative d-inline-block" style={{ cursor: "pointer" }}
                onClick={() => fileInputRef.current.click()}>
                <img src={avatarSrc} alt="avatar"
                  className="rounded-circle border border-3 shadow"
                  style={{ width: 120, height: 120, objectFit: "cover" }} />
                <div className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32 }}>
                  <i className="bi bi-camera-fill" style={{ fontSize: "0.85rem" }} />
                </div>
                <input type="file" className="d-none" ref={fileInputRef}
                  accept="image/*" onChange={handleAvatarChange} />
              </div>
              <p className="text-muted small mt-2 mb-1">Nhấp vào ảnh để thay đổi</p>
              <span className={`badge ${profileData.accountType === "Premium" ? "bg-warning text-dark" : "bg-secondary"}`}>
                {profileData.accountType}
              </span>
            </div>
          </div>

          <div className="col-lg-9">
            {/* Thông tin cá nhân */}
            <div className="dashboard-card mb-4">
              <h5 className="fw-bold mb-4 border-bottom pb-3">
                <i className="bi bi-person-lines-fill me-2 text-primary" />Thông tin cá nhân
              </h5>
              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Họ và tên</label>
                    <input type="text" className="form-control" name="fullName"
                      value={profileData.fullName} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Email <small className="text-muted">(Không thể thay đổi)</small>
                    </label>
                    <input type="email" className="form-control bg-light" value={profileData.email} disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Số điện thoại</label>
                    <input type="text" className="form-control" name="phoneNumber"
                      value={profileData.phoneNumber} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Giới tính</label>
                    <select className="form-select" name="gender"
                      value={profileData.gender} onChange={handleChange}>
                      <option value="">-- Chọn --</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Ngày sinh</label>
                    <input type="date" className="form-control" name="dateOfBirth"
                      value={profileData.dateOfBirth} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Mục tiêu điểm TOEIC</label>
                    <input type="number" className="form-control" name="scoreTarget"
                      value={profileData.scoreTarget} onChange={handleChange} min="0" max="990" />
                  </div>
                  <div className="col-12 text-end">
                    <Link to={profilePath} className="btn btn-outline-secondary me-2">Hủy</Link>
                    <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2" />Đang lưu...</>
                        : "Lưu Thay Đổi"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Đổi mật khẩu */}
            <div className="dashboard-card">
              <h5 className="fw-bold mb-4 border-bottom pb-3">
                <i className="bi bi-shield-lock-fill me-2 text-danger" />Đổi mật khẩu
              </h5>
              <form onSubmit={handlePasswordSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Mật khẩu hiện tại</label>
                    <div className="input-group">
                      <input type={showPw.current ? "text" : "password"}
                        className="form-control border-end-0" name="currentPassword"
                        value={passwordData.currentPassword} onChange={handlePwChange} required />
                      <EyeBtn field="current" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Mật khẩu mới</label>
                    <div className="input-group">
                      <input type={showPw.new ? "text" : "password"}
                        className="form-control border-end-0" name="newPassword"
                        value={passwordData.newPassword} onChange={handlePwChange} required />
                      <EyeBtn field="new" />
                    </div>
                    {passwordData.newPassword && (
                      <div className="progress mt-2" style={{ height: 5 }}>
                        <div className={`progress-bar ${sl.color}`}
                          style={{ width: `${pwStrength}%`, transition: "width .3s" }} />
                      </div>
                    )}
                    <small className="text-muted">Cần ≥ 8 ký tự, chữ hoa, thường, số & ký tự đặc biệt.</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Xác nhận mật khẩu mới</label>
                    <div className="input-group">
                      <input type={showPw.confirm ? "text" : "password"}
                        className="form-control border-end-0" name="confirmNewPassword"
                        value={passwordData.confirmNewPassword} onChange={handlePwChange} required />
                      <EyeBtn field="confirm" />
                    </div>
                  </div>
                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-danger px-4" disabled={isChangingPw}>
                      {isChangingPw
                        ? <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</>
                        : "Cập Nhật Mật Khẩu"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
