const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const apiLimiter = require("../middleware/rateLimiter");
const { validateProfileUpdate } = require("../middleware/validationMiddleware");
const upload = require("../middleware/upload");
const { handleGetProfile, handleProfileUpdate } = require("../controllers/profileController");

// User Profile Routes
router.get("/profile", authMiddleware, roleMiddleware("user"), handleGetProfile);
router.put("/profile", authMiddleware, roleMiddleware("user"), apiLimiter, upload.single("avatar"), validateProfileUpdate, handleProfileUpdate);

module.exports = router;
