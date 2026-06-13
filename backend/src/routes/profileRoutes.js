const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middlewares/authMiddleware");

const upload =
  require("../middlewares/uploadMiddleware");

const { apiLimiter } =
  require("../middlewares/rateLimiter");

const { validateProfileUpdate } =
  require("../middlewares/validationMiddleware");

const {
  handleGetProfile,
  handleProfileUpdate
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
  validateProfileUpdate,
  handleProfileUpdate
);

module.exports = router;
