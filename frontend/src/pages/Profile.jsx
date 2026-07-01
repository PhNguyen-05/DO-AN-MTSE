import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import apiInstance from "../utils/axiosInstance";
import { resolveMediaUrl, getAvatarFallback } from "../utils/mediaUrl";

function Profile() {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = ["Admin", "Manager", "Employee"].includes(user?.role);
  const editPath = isAdmin ? "/admin/profile/edit" : "/profile/edit";

  const [profileData, setProfileData] = useState({
    fullName: "",
    phoneNumber: "",
    scoreTarget: 0,
    avatarUrl: "",
    email: "",
    accountType: "Thường",
    accumulatedPoints: 0,
    voucherCount: 0,
    premiumExpiresAt: null,
    role: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiInstance
      .get("/api/profile")
      .then((res) => {
        const d = res.data.data;
        setProfileData({
          fullName: d.fullName || "",
          phoneNumber: d.phoneNumber || "Chưa cập nhật",
          scoreTarget: d.scoreTarget || 0,
          avatarUrl: d.avatarUrl || "",
          email: d.email || "",
          accountType: d.accountType || "Thường",
          accumulatedPoints: d.accumulatedPoints || 0,
          voucherCount: d.voucherCount || 0,
          premiumExpiresAt: d.premiumExpiresAt || null,
          role: d.role || user?.role || "",
        });
      })
      .catch(() => toast.error("Không thể tải thông tin cá nhân."))
      .finally(() => setLoading(false));
  }, []);

  const avatarSrc = resolveMediaUrl(profileData.avatarUrl) || getAvatarFallback(profileData.fullName || "U", 150);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  /* ─── ADMIN / MANAGER LAYOUT ─── */
  if (isAdmin) {
    return (
      <>
        <div className="bg-light min-vh-100 pb-5 pt-4">
          <div className="container-fluid px-4" style={{ maxWidth: 900 }}>
            {/* Topbar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <p className="text-muted small mb-0">Trang chủ / Hồ sơ</p>
                <h4 className="fw-bold mb-0">Hồ sơ cá nhân</h4>
              </div>
              <Link to={editPath} className="btn btn-primary">
                <i className="bi bi-pencil-square me-1" /> Chỉnh sửa hồ sơ
              </Link>
            </div>

            {/* Card avatar + info */}
            <div className="row g-4">
              <div className="col-md-4">
                <div className="dashboard-card text-center py-4">
                  <div
                    style={{
                      display: "inline-block",
                      padding: 4,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                      boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
                      marginBottom: "1rem",
                    }}
                  >
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getAvatarFallback(profileData.fullName || "U", 200);
                      }}
                      style={{
                        width: 160,
                        height: 160,
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "4px solid #fff",
                        display: "block",
                      }}
                    />
                  </div>
                  <h5 className="fw-bold mb-1">{profileData.fullName}</h5>
                  <p className="text-muted small mb-2">{profileData.email}</p>
                  <span className="badge bg-danger px-3 py-2">
                    <i className="bi bi-shield-lock-fill me-1" />
                    {profileData.role}
                  </span>
                </div>
              </div>

              <div className="col-md-8">
                <div className="dashboard-card">
                  <h6
                    className="fw-bold mb-4 border-bottom pb-2 text-muted text-uppercase"
                    style={{ fontSize: "0.78rem", letterSpacing: 1 }}
                  >
                    <i className="bi bi-person-lines-fill me-2" />
                    Thông tin tài khoản
                  </h6>
                  <div className="row g-3">
                    {[
                      {
                        label: "Họ và tên",
                        icon: "bi-person-fill",
                        value: profileData.fullName,
                      },
                      {
                        label: "Email",
                        icon: "bi-envelope-fill",
                        value: profileData.email,
                      },
                      {
                        label: "Số điện thoại",
                        icon: "bi-telephone-fill",
                        value: profileData.phoneNumber,
                      },
                      {
                        label: "Vai trò",
                        icon: "bi-shield-fill",
                        value: profileData.role,
                      },
                    ].map((item) => (
                      <div className="col-md-6" key={item.label}>
                        <div
                          className="p-3 rounded-3"
                          style={{
                            background: "#f8f9ff",
                            border: "1px solid #e8e8f0",
                          }}
                        >
                          <div className="text-muted small mb-1">
                            <i className={`bi ${item.icon} me-1`} />
                            {item.label}
                          </div>
                          <div className="fw-semibold">{item.value || "—"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ─── USER LAYOUT ─── */
  return (
    <>
      <div className="bg-light min-vh-100 pb-5 pt-4">
        <div className="container" style={{ maxWidth: 720 }}>
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/user/home" className="text-decoration-none">
                  Trang Chủ
                </Link>
              </li>
              <li className="breadcrumb-item active">Hồ sơ cá nhân</li>
            </ol>
          </nav>

          <div className="dashboard-card">
            <div className="d-flex justify-content-end mb-3">
              <Link to={editPath} className="btn btn-primary btn-sm px-4">
                <i className="bi bi-pencil-square me-1" />
                Chỉnh sửa hồ sơ
              </Link>
            </div>

            {/* Avatar + tên */}
            <div className="text-center mb-4">
              <div
                style={{
                  display: "inline-block",
                  padding: 4,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                  boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
                  marginBottom: "1rem",
                }}
              >
                <img
                  src={avatarSrc}
                  alt="avatar"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getAvatarFallback(profileData.fullName || "U", 200);
                  }}
                  style={{
                    width: 160,
                    height: 160,
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "4px solid #fff",
                    display: "block",
                  }}
                />
              </div>
              <h5 className="fw-bold mb-1" style={{ fontSize: "1.2rem" }}>
                {profileData.fullName}
              </h5>
              <p className="text-muted small mb-2">{profileData.email}</p>
              <div className="d-flex justify-content-center gap-2">
                <span
                  className={`badge ${
                    profileData.accountType === "Premium"
                      ? "bg-warning text-dark"
                      : "bg-secondary"
                  } px-3 py-2`}
                >
                  {profileData.accountType}
                </span>
                <span className="badge bg-primary px-3 py-2">{user?.role}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="row g-3 border-top pt-4">
              {[
                {
                  icon: "bi-telephone-fill",
                  color: "primary",
                  label: "Số điện thoại",
                  value: profileData.phoneNumber,
                },
                {
                  icon: "bi-bullseye",
                  color: "primary",
                  label: "Mục tiêu TOEIC",
                  value: `${profileData.scoreTarget} điểm`,
                },
                {
                  icon: "bi-star-fill",
                  color: "warning",
                  label: "Điểm tích lũy",
                  value: profileData.accumulatedPoints,
                },
                {
                  icon: "bi-ticket-perforated-fill",
                  color: "success",
                  label: "Ví Voucher",
                  value: `${profileData.voucherCount} mã`,
                },
              ].map((item) => (
                <div className="col-6" key={item.label}>
                  <div
                    className={`bg-${item.color} bg-opacity-10 rounded-3 p-3 text-center`}
                  >
                    <i
                      className={`bi ${item.icon} text-${item.color} mb-1 d-block`}
                      style={{ fontSize: "1.4rem" }}
                    />
                    <div className="text-muted small mb-1">{item.label}</div>
                    <div className={`fw-bold text-${item.color}`}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
