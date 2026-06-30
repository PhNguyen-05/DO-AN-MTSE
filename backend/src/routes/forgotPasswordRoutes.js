const express = require("express");
const {
  forgotPassword,
  verifyOtp,
  resetPassword
} = require("../controllers/forgotPasswordController");
const { 
  validateForgotPassword, 
  validateVerifyOtp, 
  validateResetPassword,
  validateHandler 
} = require("../middlewares/validate");

const router = express.Router();

router.post(
  "/forgot-password", 
  validateForgotPassword, 
  validateHandler, 
  forgotPassword
);

router.post(
  "/verify-otp", 
  validateVerifyOtp, 
  validateHandler, 
  verifyOtp
);

router.post(
  "/reset-password", 
  validateResetPassword, 
  validateHandler, 
  resetPassword
);

module.exports = router;
