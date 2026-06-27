import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logout } from "../redux/authSlice.js";
import apiInstance from "../utils/axiosInstance";

function EditProfile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const isAdmin   = ["Admin", "Manager", "Employee"].includes(user?.role);
  const profilePath = isAdmin ? "/admin/profile"      : "/profile";
  const homePath    = user?.role === "Admin"
    ? "/admin/home"
    : ["Manager", "Employee"].includes(user?.role)
      ? "/manager/home"
      : "/user/home";

  // ── Profile state ──
  const [profileData, setProfileData] = useState({
    fullName: "", phoneNumber: "", scoreTarget: 0,
    avatarUrl: "", email: "", accountType: "",
  });
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading,       setLoading]       = useState(false);
  const fileInputRef = useRef(null);

  // ── Password state ──
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmNewPassword: ""
  });
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // ── Password strength ──
  const [pwStrength, setPwStrength] = useState(0);

  const calcStrength = (v) => {
    let s = 0;
    if (v.length >= 8)           s += 25;
    if (/[A-Z]/.test(v))         s += 25;
    if (/[a-z]/.test(v) && /\d/.test(v)) s += 25;
    if (/[@$!%*?&]/.test(v))     s += 25;
    return s;
  };

  const strengthColor = () => {
    if (pwStrength === 0)   return "bg-light";
    if (pwStrength <= 25)   return "bg-danger";
    if (pwStrength <= 50)   return "bg-warning";
    if (pwStrength <= 75)   return "bg-info";
    return "bg-success";
  };

  // ── Load profile ──
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiInstance.get("/api/profile");
      const d   = res.data.user;
      setProfileData({
        fullName:    d.fullName    || "",
        phoneNumber: d.phoneNumber || "",
        scoreTarget: d.scoreTarget || 0,
        avatarUrl:   d.avatarUrl   || "",
        email:       d.email       || "",
        accountType: d.accountType || "Thường",
      });
    } catch {
      toast.error("Không thể tải thông tin cá nhân.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const avatarSrc = avatarPreview
    || (profileData.avatarUrl
        ? (profileData.avatarUrl.startsWith("http") ? profileData.avatarUrl : `http://localhost:3000${profileData.avatarUrl}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName || "U")}&size=150&background=4f46e5&color=fff`);

  // ── Handlers ──
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
      fd.append("scoreTarget", profileData.scoreTarget);
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await apiInstance.put("/api/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(res.data.message || "Cập nhật hồ sơ thành công.");
      fetchProfile();
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
      return toast.warning("Mật khẩu chưa đủ mạnh (cần chữ hoa, thường, số, ký tự đặc biệt).");
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

  const EyeToggle = ({ field }) => (
    <span className="input-group-text bg-white" style={{ cursor: "pointer" }}
          onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}>
      <i className={`bi ${showPw[field] ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
    </span>
  );

  return (
    <div className="bg-light min-vh-100 pb-5 pt-4">
      <div className="container" style={{ maxWidth: 860 }}>

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to={homePath} className="text-decoration-none">Trang Chủ</Link></li>
            <li className="breadcrumb-item"><Link to={profilePath} className="text-decoration-none">Hồ sơ</Link></li>
            <li className="breadcrumb-item active">Chỉnh sửa</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* ── Left: avatar upload ── */}
          <div className="col-lg-3 text-center">
            <div className="dashboard-card p-4">
              <div className="position-relative d-inline-block" style={{ cursor: "pointer" }}
                   onClick={() => fileInputRef.current.click()}>
                <img src={avatarSrc} alt="avatar"
                     className="rounded-circle border border-3 shadow"
                     style={{ width: 120, height: 120, objectFit: "cover" }} />
                <div className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: 34, height: 34 }}>
                  <i className="bi bi-camera-fill" style={{ fontSize: '0.9rem' }}></i>
                </div>
                <input type="file" className="d-none" ref={fileInputRef}
                       accept="image/*" onChange={handleAvatarChange} />
              </div>
              <p className="text-muted small mt-2 mb-0">Bấm vào ảnh để thay đổi</p>
              <div className="mt-2">
                <span className={`badge ${profileData.accountType === 'Premium' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                  {profileData.accountType}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right ── */}
          <div className="col-lg-9">
            {/* Thông tin cá nhân */}
            <div className="dashboard-card mb-4">
              <h5 className="fw-bold mb-4 border-bottom pb-3">
                <i className="bi bi-person-lines-fill me-2 text-primary"></i>Thông tin cá nhân
              </h5>
              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Họ và tên</label>
                    <input type="text" className="form-control" name="fullName"
                           value={profileData.fullName} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Email <small className="text-muted">(Không thể thay đổi)</small>
                    </label>
                    <input type="email" className="form-control bg-light"
                           value={profileData.email} disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Số điện thoại</label>
                    <input type="text" className="form-control" name="phoneNumber"
                           value={profileData.phoneNumber} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Mục tiêu điểm TOEIC</label>
                    <input type="number" className="form-control" name="scoreTarget"
                           value={profileData.scoreTarget} onChange={handleChange} min="0" max="990" />
                  </div>
                  <div className="col-12 text-end">
                    <Link to={profilePath} className="btn btn-outline-secondary me-2">Hủy</Link>
                    <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2" />Đang lưu...</> : "Lưu Thay Đổi"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Đổi mật khẩu */}
            <div className="dashboard-card">
              <h5 className="fw-bold mb-4 border-bottom pb-3">
                <i className="bi bi-shield-lock-fill me-2 text-danger"></i>Đổi mật khẩu
              </h5>
              <form onSubmit={handlePasswordSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Mật khẩu hiện tại</label>
                    <div className="input-group">
                      <input type={showPw.current ? "text" : "password"}
                             className="form-control border-end-0" name="currentPassword"
                             value={passwordData.currentPassword} onChange={handlePwChange} required />
                      <EyeToggle field="current" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Mật khẩu mới</label>
                    <div className="input-group">
                      <input type={showPw.new ? "text" : "password"}
                             className="form-control border-end-0" name="newPassword"
                             value={passwordData.newPassword} onChange={handlePwChange} required />
                      <EyeToggle field="new" />
                    </div>
                    {passwordData.newPassword && (
                      <div className="progress mt-2" style={{ height: 5 }}>
                        <div className={`progress-bar ${strengthColor()}`}
                             style={{ width: `${pwStrength}%`, transition: 'width .3s' }} />
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
                      <EyeToggle field="confirm" />
                    </div>
                  </div>
                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-danger px-4" disabled={isChangingPw}>
                      {isChangingPw ? <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</> : "Cập Nhật Mật Khẩu"}
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
