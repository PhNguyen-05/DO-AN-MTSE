const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 }).withMessage('Tên phải có ít nhất 2 ký tự')
    .escape(),

  body('email')
    .isEmail().normalizeEmail().withMessage('Email không hợp lệ')
    .trim()
    .escape(),

  body('password')
    .isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/[a-z]/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)')
    .matches(/[A-Z]/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)')
    .matches(/\d/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ số (0-9)')
    .matches(/[@$!%*?&]/).withMessage('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)')
    .trim(),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      return true;
    }),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  const isApiRequest = (req.headers.accept && req.headers.accept.includes('application/json')) ||
    req.is('application/json');

  if (!errors.isEmpty()) {
    if (isApiRequest) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    return res.render('auth/register', {
      errors: errors.array(),
      oldData: req.body
    });
  }

  next();
};

const validateLogin = [
  body('email')
    .isEmail().withMessage('Email không hợp lệ.')
    .normalizeEmail()
    .trim(),
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống.'),
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

module.exports = { registerValidation, validate, validateLogin, validateLoginHandler };
