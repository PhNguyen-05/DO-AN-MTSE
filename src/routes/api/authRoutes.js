const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { registerValidation, validate } = require('../../middlewares/validate');
const { registerLimiter } = require('../../middlewares/rateLimiter');

router.post('/register', registerLimiter, registerValidation, validate, authController.postRegister);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;
