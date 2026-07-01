
const bcrypt = require("bcryptjs");
const User = require("../models/User");


const sanitizeUser = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };


  delete data.passwordHash;

  return {
    fullName:    data.fullName    || "",
    email:       data.email       || "",
    phoneNumber: data.phoneNumber || "",
    avatarUrl:   data.avatarUrl   || "",
    role:        data.role        || "User",
    gender:      data.gender      || "",
    dateOfBirth: data.dateOfBirth || null,
    status:      data.status      || "Chưa kích hoạt",
    accountType:      data.accountType      || "Thường",
    premiumExpiresAt: data.premiumExpiresAt || null,
  };
};

async function getProfileData(userId) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  return sanitizeUser(user);
}

async function updateProfileData(userId, updatedFields) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  // Only update fields that are provided
  if (updatedFields.fullName    !== undefined) user.fullName    = updatedFields.fullName;
  if (updatedFields.phoneNumber !== undefined) user.phoneNumber = updatedFields.phoneNumber;
  if (updatedFields.avatarUrl   !== undefined) user.avatarUrl   = updatedFields.avatarUrl;
  if (updatedFields.gender      !== undefined) {
    const genderMap = { male: 'Nam', female: 'Nữ', other: 'Khác' };
    const g = updatedFields.gender;
    user.gender = genderMap[g] || g;
  }
  if (updatedFields.dateOfBirth !== undefined) user.dateOfBirth = updatedFields.dateOfBirth || undefined;

  await user.save();
  return sanitizeUser(user);
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  if (!user.passwordHash) throw { status: 500, message: "Tài khoản này không có mật khẩu (đăng nhập qua Google)." };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw { status: 400, message: "Mật khẩu hiện tại không đúng." };

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();
}

module.exports = {
  getProfileData,
  updateProfileData,
  changePassword

};
