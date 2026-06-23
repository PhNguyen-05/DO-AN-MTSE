const User = require("../models/User");

const findUserById = (userId) => (
  User.findById(userId)
);

const persistChanges = (userId, dataUpdate) => (
  User.findByIdAndUpdate(
    userId,
    dataUpdate,
    { new: true, runValidators: true }
  ).select("-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires")
);

module.exports = {
  findUserById,
  persistChanges
};
