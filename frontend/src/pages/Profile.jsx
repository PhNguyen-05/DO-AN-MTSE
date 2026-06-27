import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import apiInstance from "../utils/axiosInstance";

function Profile() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const isAdmin = ["Admin", "Manager", "Employee"].includes(user?.role);

  const editPath   = isAdmin ? "/admin/profile/edit" : "/profile/edit";
  const homePath   = user?.role === "Admin"
    ? "/admin/home"
    : ["Manager", "Employee"].includes(user?.role)
      ? "/manager/home"
      : "/user/home";

  const [profileData, setProfileData] = useState({
    fullName: "", phoneNumber: "", scoreTarget: 0, avatarUrl: "",
    email: "", accountType: "Thường", accumulatedPoints: 0,
    voucherCount: 0, premiumExpiresAt: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiInstance.get("/api/profile")
      .then((res) => {
        const d = res.data.user;
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
        });
      })
      .catch(() => toast.error("Không thể tải thông tin cá nhân."))
      .finally(() => setLoading(false));
  }, []);

  const avatarSrc = profileData.avatarUrl
    ? (profileData.avatarUrl.startsWith("http") ? profileData.avatarUrl : `http://localhost:3000${profileData.avatarUrl}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName || "U")}&size=150&background=4f46e5&color=fff`;

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary" role="status" />
    </div>
  );

  return (
    <div className="bg-light min-vh-100 pb-5 pt-4">
      <div className="container" style={{ maxWidth: 720 }}>

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to={homePath} className="text-decoration-none">Trang Chủ</Link>
            </li>
            <li className="breadcrumb-item active">Hồ sơ cá nhân</li>
          </ol>
        </nav>

        <div className="dashboard-card">
          {/* Nút chỉnh sửa */}
          <div className="d-flex justify-content-end mb-3">
            <Link to={editPath} className="btn btn-primary btn-sm px-4">
              <i className="bi bi-pencil-square me-1"></i>Chỉnh sửa hồ sơ
            </Link>
          </div>

          {/* Avatar + tên */}
          <div className="text-center mb-4">
            <img src={avatarSrc} alt="avatar"
                 className="rounded-circle border border-3 shadow mb-3"
                 style={{ width: 130, height: 130, objectFit: 'cover' }} />
            <h4 className="fw-bold mb-1">{profileData.fullName}</h4>
            <p className="text-muted mb-2">{profileData.email}</p>
            <div className="d-flex justify-content-center gap-2">
              <span className={`badge ${profileData.accountType === 'Premium' ? 'bg-warning text-dark' : 'bg-secondary'} px-3 py-2`}>
                {profileData.accountType}
              </span>
              <span className="badge bg-primary px-3 py-2">{user?.role}</span>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="row g-3 border-top pt-4">
            {[
              { icon: 'bi-telephone-fill',            color: 'primary',  label: 'Số điện thoại',   value: profileData.phoneNumber },
              { icon: 'bi-bullseye',                   color: 'primary',  label: 'Mục tiêu TOEIC',  value: `${profileData.scoreTarget} điểm` },
              { icon: 'bi-star-fill',                  color: 'warning',  label: 'Điểm tích lũy',   value: profileData.accumulatedPoints },
              { icon: 'bi-ticket-perforated-fill',    color: 'success',  label: 'Ví Voucher',       value: `${profileData.voucherCount} mã` },
            ].map((item) => (
              <div className="col-6" key={item.label}>
                <div className={`bg-${item.color} bg-opacity-10 rounded-3 p-3 text-center`}>
                  <i className={`bi ${item.icon} text-${item.color} mb-1 d-block`} style={{ fontSize: '1.5rem' }}></i>
                  <div className="text-muted small mb-1">{item.label}</div>
                  <div className={`fw-bold text-${item.color}`}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
