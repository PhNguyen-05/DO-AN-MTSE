const express = require("express");

const authController = require("../controllers/authController");
const User = require("../models/User");
const { registerLimiter, loginLimiter } = require("../middlewares/rateLimiter");
const {
  registerValidation,
  validate,
  validateLogin,
  validateLoginHandler
} = require("../middlewares/validate");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize");

const router = express.Router();

router.post("/register", registerLimiter, registerValidation, validate, authController.postRegister);
router.post("/verify-otp", authController.verifyOTP);
router.post("/login", loginLimiter, validateLogin, validateLoginHandler, authController.login);

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role phone avatar");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load current user." });
  }
});

router.get("/dashboard", verifyToken, authorize("user", "admin"), (req, res) => {
  res.json({
    success: true,
    message: "Dashboard data loaded.",
    user: req.user
  });
});

router.get("/user/profile/data", verifyToken, authorize("user"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role phone avatar");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({
      success: true,
      message: `Profile data for ${user.name}`,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load user profile." });
  }
});

router.get("/admin/profile/data", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role phone avatar");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({
      success: true,
      message: `Admin profile data for ${user.name || user.email}`,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load admin profile." });
  }
});

module.exports = router;
