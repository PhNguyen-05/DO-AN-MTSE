const userRepository =
  require("../repositories/userRepository");

const bcrypt =
  require("bcrypt");

async function updateProfileData(
  userId,
  updatedFields
) {

  const user =
    await userRepository
      .findUserById(userId);

  if (!user) {

    throw {

      status: 404,

      message:
        "User not found"
    };
  }

  if (
    !updatedFields.password
  ) {

    throw {

      status: 400,

      message:
        "Password is required"
    };
  }

  if (
    !user.password
  ) {

    throw {

      status: 500,

      message:
        "User password missing in database"
    };
  }

  const validPassword =
    await bcrypt.compare(
      updatedFields.password,
      user.password
    );

  if (!validPassword) {

    throw {

      status: 403,

      message:
        "Invalid password"
    };
  }

  if (

    updatedFields.email &&

    !updatedFields.email
      .includes("@")
  ) {

    throw {

      status: 400,

      message:
        "Invalid email"
    };
  }

  const dataUpdate = {

    name:
      updatedFields.name,

    email:
      updatedFields.email,

    phone:
      updatedFields.phone
  };

  if (
    updatedFields.avatar
  ) {

    dataUpdate.avatar =
      updatedFields.avatar;
  }

  return await userRepository
    .persistChanges(

      userId,

      dataUpdate
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

      message:
        "User not found"
    };
  }

  return user;
}

module.exports = {

  updateProfileData,

  getProfileData
};