const profileService = require("../services/profileService");

async function handleGetProfile(req, res) {
  try {
    const profile = await profileService.getProfileData(req.userId);
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function handleProfileUpdate(req, res) {
  try {
    const updatedProfile = await profileService.updateProfileData(req.userId, {
      fullName:    req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      scoreTarget: req.body.scoreTarget,
      gender:      req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      avatarUrl:   req.file ? `/uploads/avatar/${req.file.filename}` : undefined
    });

    res.json({ success: true, message: "Cập nhật hồ sơ thành công.", data: updatedProfile });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function handleChangePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin." });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu xác nhận không khớp." });
    }

    await profileService.changePassword(req.userId, currentPassword, newPassword);

    res.json({ success: true, message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
}

module.exports = {
  handleGetProfile,
  handleProfileUpdate,
  handleChangePassword
};