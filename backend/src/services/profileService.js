const User = require("../models/User");
const UserSession = require("../models/UserSession");
const bcrypt = require("bcryptjs");

class ProfileService {
  async getProfileData(userId) {
    const user = await User.findById(userId).select("-passwordHash -__v -createdAt -updatedAt");
    if (!user) {
      const error = new Error("Không tìm thấy người dùng.");
      error.status = 404;
      throw error;
    }
    return user;
  }

  async updateProfileData(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Không tìm thấy người dùng.");
      error.status = 404;
      throw error;
    }

    if (updateData.fullName) user.fullName = updateData.fullName;
    if (updateData.phoneNumber) user.phoneNumber = updateData.phoneNumber;
    if (updateData.scoreTarget) user.scoreTarget = updateData.scoreTarget;
    if (updateData.avatarUrl) user.avatarUrl = updateData.avatarUrl;

    await user.save();
    
    // Return sanitized user
    const savedUser = user.toObject();
    delete savedUser.passwordHash;
    return savedUser;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    // If user has no password (e.g. only logged in via Google), they can't change it this way
    if (!user.passwordHash) {
      throw new Error("Tài khoản của bạn được đăng ký thông qua Google. Vui lòng sử dụng tính năng quên mật khẩu nếu muốn đặt mật khẩu.");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error("Mật khẩu hiện tại không chính xác.");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new Error("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    // Invalidate sessions so user must login again
    await UserSession.deleteMany({ userId });

    return true;
  }
}

module.exports = new ProfileService();
