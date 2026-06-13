const { body, validationResult } = require("express-validator");

const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2 }).withMessage("Name must contain at least 2 characters.")
    .escape(),
  body("email")
    .isEmail().withMessage("Email is invalid.")
    .normalizeEmail()
    .trim(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must contain at least 8 characters.")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter.")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
    .matches(/\d/).withMessage("Password must contain at least one number.")
    .matches(/[@$!%*?&]/).withMessage("Password must contain at least one special character.")
    .trim(),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match.");
      }
      return true;
    })
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  next();
};

const validateLogin = [
  body("email")
    .isEmail().withMessage("Email is invalid.")
    .normalizeEmail()
    .trim(),
  body("password")
    .notEmpty().withMessage("Password is required.")
];

const validateLoginHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  next();
};

// Validation for forgot password
const validateForgotPassword = [
  body("email")
    .isEmail().withMessage("Email is invalid.")
    .normalizeEmail()
    .trim()
];

// Validation for OTP verification
const validateVerifyOtp = [
  body("email")
    .isEmail().withMessage("Email is invalid.")
    .normalizeEmail()
    .trim(),
  body("otp")
    .trim()
    .isLength({ min: 4, max: 6 }).withMessage("OTP must be 4-6 characters.")
];

// Validation for reset password
const validateResetPassword = [
  body("email")
    .isEmail().withMessage("Email is invalid.")
    .normalizeEmail()
    .trim(),
  body("otp")
    .trim()
    .isLength({ min: 4, max: 6 }).withMessage("OTP must be 4-6 characters."),
  body("newPassword")
    .isLength({ min: 8 }).withMessage("Password must contain at least 8 characters.")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter.")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
    .matches(/\d/).withMessage("Password must contain at least one number.")
    .matches(/[@$!%*?&]/).withMessage("Password must contain at least one special character.")
    .trim()
];

const validateHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  next();
};

module.exports = {
  registerValidation,
  validate,
  validateLogin,
  validateLoginHandler,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
  validateHandler
};
