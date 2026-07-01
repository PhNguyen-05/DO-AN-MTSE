import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import apiInstance from "../utils/axiosInstance";

function AdminQLUser() {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Modal states
  const [confirmModal, setConfirmModal] = useState({ show: false, title: "", message: "", variant: "", onConfirm: null, icon: "" });
  const [resultModal, setResultModal] = useState({ show: false, title: "", message: "", variant: "", icon: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiInstance.get("/api/admin/users", {
        params: { search, role: roleFilter, status: statusFilter, page: pagination.page, limit: pagination.limit }
      });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      showResultModal(
        "Lỗi Tải Dữ Liệu",
        error.response?.data?.message || "Không thể tải danh sách người dùng.",
        "danger",
        "bi-exclamation-triangle-fill"
      );
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Modal helpers ──
  const showConfirm = (title, message, variant, icon, onConfirm) => {
    setConfirmModal({ show: true, title, message, variant, icon, onConfirm });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ show: false, title: "", message: "", variant: "", onConfirm: null, icon: "" });
  };

  const showResultModal = (title, message, variant, icon) => {
    setResultModal({ show: true, title, message, variant, icon });
  };

  const closeResultModal = () => {
    setResultModal({ show: false, title: "", message: "", variant: "", icon: "" });
  };

  // ── Role change ──
  const handleRoleChange = (userId, newRole, userName) => {
    const roleLabels = { Manager: "Quản lý (Manager)", Employee: "Nhân viên (Employee)", User: "Người dùng (User)" };
    showConfirm(
      "Xác Nhận Thay Đổi Quyền",
      `Bạn có chắc chắn muốn thay đổi quyền của <strong>${userName}</strong> thành <strong>${roleLabels[newRole] || newRole}</strong>?<br/><br/><small class="text-muted">Phiên đăng nhập của người dùng sẽ bị hủy để áp dụng quyền mới.</small>`,
      "primary",
      "bi-shield-check",
      async () => {
        setActionLoading(true);
        try {
          const res = await apiInstance.patch(`/api/admin/users/${userId}/role`, { newRole });
          closeConfirmModal();
          showResultModal(
            "Thành Công",
            res.data.message || "Cập nhật quyền thành công.",
            "success",
            "bi-check-circle-fill"
          );
          fetchUsers();
        } catch (error) {
          closeConfirmModal();
          showResultModal(
            "Thất Bại",
            error.response?.data?.message || "Không thể cập nhật quyền.",
            "danger",
            "bi-x-circle-fill"
          );
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  // ── Status toggle ──
  const handleStatusToggle = (targetUser) => {
    const isBlocking = targetUser.status !== "Bị khóa";
    const action = isBlocking ? "KHÓA" : "MỞ KHÓA";
    const variant = isBlocking ? "danger" : "success";
    const icon = isBlocking ? "bi-lock-fill" : "bi-unlock-fill";

    showConfirm(
      `Xác Nhận ${action} Tài Khoản`,
      isBlocking
        ? `Bạn có chắc chắn muốn <strong class="text-danger">KHÓA</strong> tài khoản của <strong>${targetUser.fullName}</strong> (${targetUser.email})?<br/><br/><small class="text-muted">Người dùng sẽ bị đăng xuất ngay lập tức và không thể đăng nhập lại.</small>`
        : `Bạn có chắc chắn muốn <strong class="text-success">MỞ KHÓA</strong> tài khoản của <strong>${targetUser.fullName}</strong> (${targetUser.email})?<br/><br/><small class="text-muted">Người dùng sẽ có thể đăng nhập lại bình thường.</small>`,
      variant,
      icon,
      async () => {
        setActionLoading(true);
        try {
          const res = await apiInstance.patch(`/api/admin/users/${targetUser._id}/status`);
          closeConfirmModal();
          showResultModal(
            "Thành Công",
            res.data.message || (isBlocking ? "Tài khoản đã bị khóa thành công." : "Tài khoản đã được mở khóa thành công."),
            "success",
            "bi-check-circle-fill"
          );
          fetchUsers();
        } catch (error) {
          closeConfirmModal();
          showResultModal(
            "Thất Bại",
            error.response?.data?.message || "Không thể thay đổi trạng thái tài khoản.",
            "danger",
            "bi-x-circle-fill"
          );
        } finally {
          setActionLoading(false);
        }
      }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    } else {
      fetchUsers();
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5 pt-4">
      <div className="container-fluid px-4 dashboard-container">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h3 className="fw-bold mb-1">Quản lý Tài Khoản Người Dùng</h3>
            <p className="text-muted mb-0">Hệ thống phân quyền bổ nhiệm vai trò và khóa/mở khóa tài khoản học viên</p>
          </div>
          <div className="bg-white px-3 py-2 rounded shadow-sm border">
            <span className="fw-bold text-primary-custom fs-5">{pagination.total}</span>
            <span className="text-muted ms-2 small">tổng số tài khoản</span>
          </div>
        </div>

        <div className="dashboard-card mb-4">
          <form className="row g-3 align-items-end" onSubmit={handleSearchSubmit}>
            <div className="col-md-4">
              <label className="form-label fw-semibold small text-muted">Tìm kiếm</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Theo Tên hoặc Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold small text-muted">Lọc theo quyền</label>
              <select className="form-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPagination(prev => ({...prev, page: 1})) }}>
                <option value="">Tất cả quyền</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
                <option value="User">User</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold small text-muted">Lọc theo trạng thái</label>
              <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({...prev, page: 1})) }}>
                <option value="">Tất cả trạng thái</option>
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Bị khóa">Bị khóa</option>
                <option value="Chưa kích hoạt">Chưa kích hoạt</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">Lọc dữ liệu</button>
            </div>
          </form>
        </div>

        <div className="dashboard-card overflow-hidden p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small text-uppercase">
                <tr>
                  <th className="ps-4 py-3">Người Dùng</th>
                  <th className="py-3">Phân Quyền</th>
                  <th className="py-3">Trạng Thái</th>
                  <th className="text-end pe-4 py-3">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                      Không tìm thấy dữ liệu phù hợp
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                          <img
                            src={u.avatarUrl ? (u.avatarUrl.startsWith('http') ? u.avatarUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${u.avatarUrl}`) : "https://via.placeholder.com/40"}
                            alt="Avatar"
                            className="rounded-circle object-fit-cover me-3"
                            style={{ width: "40px", height: "40px" }}
                          />
                          <div>
                            <h6 className="mb-0 fw-bold">{u.fullName}</h6>
                            <small className="text-muted">{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {u.role === "Admin" ? (
                          <span className="badge bg-danger rounded-pill px-3 py-2"><i className="bi bi-shield-lock-fill me-1"></i> Admin</span>
                        ) : (
                          <select
                            className="form-select form-select-sm w-auto"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value, u.fullName)}
                            disabled={user.role !== "Admin" || u._id === user.id}
                          >
                            <option value="Manager">Manager</option>
                            <option value="Employee">Employee</option>
                            <option value="User">User</option>
                          </select>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'Đang hoạt động' ? 'badge-active' : u.status === 'Bị khóa' ? 'badge-blocked' : 'bg-secondary'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className={`btn btn-sm ${u.status === 'Bị khóa' ? 'btn-outline-success' : 'btn-outline-danger'}`}
                          onClick={() => handleStatusToggle(u)}
                          disabled={u._id === user.id || u.role === "Admin" || !["Admin", "Manager"].includes(user?.role)}
                          title={u.status === 'Bị khóa' ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        >
                          <i className={`bi ${u.status === 'Bị khóa' ? 'bi-unlock-fill' : 'bi-lock-fill'}`}></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="card-footer bg-white border-top py-3 d-flex justify-content-between align-items-center px-4">
              <span className="text-muted small">
                Hiển thị trang {pagination.page} / {pagination.pages}
              </span>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}>Trước</button>
                </li>
                {[...Array(pagination.pages)].map((_, idx) => (
                  <li key={idx} className={`page-item ${pagination.page === idx + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPagination(prev => ({...prev, page: idx + 1}))}>{idx + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}>Sau</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ CONFIRM MODAL ══════════════ */}
      {confirmModal.show && (
        <div className="modal-backdrop-custom" onClick={closeConfirmModal}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content-custom">
              <div className={`modal-header-custom bg-${confirmModal.variant}`}>
                <div className="modal-icon-circle">
                  <i className={`bi ${confirmModal.icon} text-${confirmModal.variant}`} style={{ fontSize: "2rem" }}></i>
                </div>
                <h5 className="modal-title-custom text-white mt-2">{confirmModal.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  onClick={closeConfirmModal}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body-custom">
                <p className="mb-0 text-center" dangerouslySetInnerHTML={{ __html: confirmModal.message }}></p>
              </div>
              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={closeConfirmModal}
                  disabled={actionLoading}
                >
                  <i className="bi bi-x-lg me-1"></i> Hủy Bỏ
                </button>
                <button
                  type="button"
                  className={`btn btn-${confirmModal.variant} px-4`}
                  onClick={confirmModal.onConfirm}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i> Xác Nhận
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ RESULT MODAL ══════════════ */}
      {resultModal.show && (
        <div className="modal-backdrop-custom" onClick={closeResultModal}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content-custom">
              <div className={`modal-header-custom bg-${resultModal.variant}`}>
                <div className="modal-icon-circle">
                  <i className={`bi ${resultModal.icon} text-${resultModal.variant}`} style={{ fontSize: "2.5rem" }}></i>
                </div>
                <h5 className="modal-title-custom text-white mt-2">{resultModal.title}</h5>
              </div>
              <div className="modal-body-custom">
                <p className="mb-0 text-center" style={{ fontSize: "1.05rem" }}>{resultModal.message}</p>
              </div>
              <div className="modal-footer-custom justify-content-center">
                <button
                  type="button"
                  className={`btn btn-${resultModal.variant} px-5`}
                  onClick={closeResultModal}
                >
                  <i className="bi bi-check-lg me-1"></i> Đã Hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL STYLES ══════════════ */}
      <style>{`
        .modal-backdrop-custom {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1060;
          animation: fadeIn 0.2s ease;
        }
        .modal-dialog-custom {
          width: 100%;
          max-width: 460px;
          margin: 1rem;
          animation: slideUp 0.3s ease;
        }
        .modal-content-custom {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .modal-header-custom {
          position: relative;
          padding: 2rem 1.5rem 1.5rem;
          text-align: center;
          border-radius: 16px 16px 0 0;
        }
        .modal-header-custom.bg-danger {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
        }
        .modal-header-custom.bg-success {
          background: linear-gradient(135deg, #28a745 0%, #218838 100%) !important;
        }
        .modal-header-custom.bg-primary {
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%) !important;
        }
        .modal-icon-circle {
          width: 70px;
          height: 70px;
          background: rgba(255,255,255,0.95);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .modal-title-custom {
          font-weight: 700;
          margin-bottom: 0;
          font-size: 1.2rem;
        }
        .modal-body-custom {
          padding: 1.5rem 2rem;
          color: #333;
          line-height: 1.7;
        }
        .modal-footer-custom {
          padding: 0.75rem 2rem 1.5rem;
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          border-top: 1px solid #eee;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default AdminQLUser;
