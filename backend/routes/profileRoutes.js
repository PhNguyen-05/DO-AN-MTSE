const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const upload =
  require("../middleware/upload");

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
  upload.single("avatar"),
  handleProfileUpdate
);

module.exports = router;