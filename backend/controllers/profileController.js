const profileService =
  require("../services/profileService");

async function handleGetProfile(
  req,
  res
) {

  try {

    const profile =
      await profileService
        .getProfileData(req.userId);

    res.json({
      success: true,
      data: profile
    });

  }
  catch (err) {

    res.status(
      err.status || 500
    ).json({
      message: err.message
    });
  }
}

async function handleProfileUpdate(
  req,
  res
) {

  try {

    const updatedProfile =
      await profileService
        .updateProfileData(
          req.userId,
          {
            ...req.body,

            avatar: req.file
              ? req.file.filename
              : undefined
          }
        );

    res.json({
      success: true,
      data: updatedProfile
    });

  }
  catch (err) {

    res.status(
      err.status || 500
    ).json({
      message: err.message
    });
  }
}

module.exports = {

  handleGetProfile,

  handleProfileUpdate
};