const mongoose = require("mongoose");
const User = require("../models/User");
const UserSession = require("../models/UserSession");

class AdminService {
  async listUsers({ search, role, status, page = 1, limit = 20 }) {
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    };
  }

  async changeUserRole(userId, newRole) {
    const validRoles = ['Admin', 'Manager', 'Employee', 'User'];
    if (!validRoles.includes(newRole)) {
      throw new Error("Vai trò không hợp lệ.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    user.role = newRole;
    await user.save();

    // Revoke sessions to force relogin and apply new role
    await UserSession.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });

    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;
    return updatedUser;
  }

  async toggleUserStatus(userId, reason) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    if (user.status === 'Bị khóa') {
      user.status = 'Đang hoạt động';
    } else {
      user.status = 'Bị khóa';
      // Revoke sessions to immediately kick user out
      await UserSession.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;
    return updatedUser;
  }
}

module.exports = new AdminService();
