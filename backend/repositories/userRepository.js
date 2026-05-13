const User = require("../models/User");

async function findUserById(userId) {
  return await User.findById(userId);
}

async function persistChanges(userId, updatedFields) {
  return await User.findByIdAndUpdate(
    userId,
    updatedFields,
    { new: true }
  );
}

module.exports = {
  findUserById,
  persistChanges
};