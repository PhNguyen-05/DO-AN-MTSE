import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import apiInstance from "../utils/axiosInstance";

function ManagerHome() {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiInstance.get("/api/admin/users", {
        params: { search, role: roleFilter, status: statusFilter, page: pagination.page, limit: pagination.limit }
      });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await apiInstance.patch(`/api/admin/users/${userId}/role`, { newRole });
      toast.success(res.data.message);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật quyền.");
    }
  };

  const handleStatusToggle = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn thay đổi trạng thái tài khoản này?")) return;
    try {
      const res = await apiInstance.patch(`/api/admin/users/${userId}/status`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái.");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  return (
    <div className="bg-light min-vh-100 pb-5 pt-4">
      <div className="container-fluid px-4 dashboard-container">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h3 className="fw-bold mb-1">Quản lý Người Dùng</h3>
            <p className="text-muted mb-0">Quản lý quyền hạn và trạng thái tài khoản trên hệ thống</p>
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
                  <th className="py-3">Loại Tài Khoản</th>
                  <th className="py-3">Trạng Thái</th>
                  <th className="text-end pe-4 py-3">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
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
                            src={u.avatarUrl ? (u.avatarUrl.startsWith('http') ? u.avatarUrl : `http://localhost:3000${u.avatarUrl}`) : "https://via.placeholder.com/40"}
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
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={user.role !== "Admin" || u._id === user.id}
                          >
                            <option value="Manager">Manager</option>
                            <option value="Employee">Employee</option>
                            <option value="User">User</option>
                          </select>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${u.accountType === 'Premium' ? 'bg-warning text-dark' : 'bg-secondary'} rounded-pill px-3`}>
                          {u.accountType}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'Đang hoạt động' ? 'badge-active' : u.status === 'Bị khóa' ? 'badge-blocked' : 'bg-secondary'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className={`btn btn-sm ${u.status === 'Bị khóa' ? 'btn-outline-success' : 'btn-outline-danger'}`}
                          onClick={() => handleStatusToggle(u._id)}
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
    </div>
  );
}

export default ManagerHome;
