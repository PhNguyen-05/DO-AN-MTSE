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

router.post("/google-login", authController.googleLogin);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-otp", authController.verifyResetOTP);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-otp", authController.resendOTP);

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("fullName email role phoneNumber avatarUrl status accountType premiumExpiresAt");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load current user." });
  }
});


module.exports = router;
