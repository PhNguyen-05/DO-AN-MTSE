const adminService = require("../services/adminService");

async function listUsers(req, res) {
  try {
    const { search, role, status, page, limit } = req.query;
    
    const result = await adminService.listUsers({ search, role, status, page, limit });

    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
}

async function changeUserRole(req, res) {
  try {
    const { id } = req.params;
    const { newRole } = req.body;

    const updatedUser = await adminService.changeUserRole(id, newRole);

    res.json({
      success: true,
      message: "Cập nhật vai trò thành công. Phiên làm việc của người dùng đã bị hủy để cập nhật quyền.",
      data: updatedUser
    });
  } catch (err) {
    res.status(err.status || 400).json({
      success: false,
      message: err.message
    });
  }
}

async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Optional block reason

    const updatedUser = await adminService.toggleUserStatus(id, reason);

    res.json({
      success: true,
      message: updatedUser.status === 'Bị khóa' 
        ? "Tài khoản đã bị khóa. Các phiên đăng nhập hiện tại đã bị vô hiệu hóa." 
        : "Tài khoản đã được mở khóa.",
      data: updatedUser
    });
  } catch (err) {
    res.status(err.status || 400).json({
      success: false,
      message: err.message
    });
  }
}

module.exports = {
  listUsers,
  changeUserRole,
  toggleUserStatus
};
