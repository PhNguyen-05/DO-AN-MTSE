const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");

async function updateProfileData(userId, updatedFields) {

  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw {
      status: 404,
      message: "User not found"
    };
  }

  const validPassword = await bcrypt.compare(
    updatedFields.password,
    user.password
  );

  if (!validPassword) {
    throw {
      status: 403,
      message: "Invalid password"
    };
  }

  if (
    updatedFields.email &&
    !updatedFields.email.includes("@")
  ) {
    throw {
      status: 400,
      message: "Invalid email"
    };
  }

  delete updatedFields.password;

  return await userRepository.persistChanges(
    userId,
    updatedFields
  );
}
async function getProfileData(
  userId
) {

  const user =
    await userRepository
      .findUserById(userId);

  if (!user) {

    throw {
      status: 404,
      message: "User not found"
    };
  }

  return user;
}
module.exports = {
  updateProfileData,
  getProfileData  
};