const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/uploadMiddleware");
const { apiLimiter } = require("../middlewares/rateLimiter");

const {
  handleGetProfile,
  handleProfileUpdate,
  handleChangePassword
} = require("../controllers/profileController");

router.get(
  "/profile",
  authMiddleware,
  handleGetProfile
);

router.put(
  "/profile",
  authMiddleware,
  apiLimiter,
  upload.single("avatar"),
  handleProfileUpdate
);

router.put(
  "/profile/change-password",
  authMiddleware,
  apiLimiter,
  handleChangePassword
);

module.exports = router;
