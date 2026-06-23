const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { apiLimiter } = require("../middlewares/rateLimiter");
const { validateProfileUpdate } = require("../middlewares/validationMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { handleGetProfile, handleProfileUpdate } = require("../controllers/profileController");

// User Profile Routes
router.get("/profile", authMiddleware, roleMiddleware("user"), handleGetProfile);
router.put("/profile", authMiddleware, roleMiddleware("user"), apiLimiter, upload.single("avatar"), validateProfileUpdate, handleProfileUpdate);

module.exports = router;
