const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const apiLimiter = require("../middleware/rateLimiter");
const { validateProfileUpdate } = require("../middleware/validationMiddleware");
const upload = require("../middleware/upload");
const { handleGetProfile, handleProfileUpdate } = require("../controllers/profileController");

// Admin Profile Routes
router.get("/profile", authMiddleware, roleMiddleware("admin"), handleGetProfile);
router.put("/profile", authMiddleware, roleMiddleware("admin"), apiLimiter, upload.single("avatar"), validateProfileUpdate, handleProfileUpdate);

module.exports = router;
