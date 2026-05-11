const { body, validationResult } = require("express-validator");

const validateProfileUpdate = [
  body("name").optional().isString().withMessage("Name must be a string"),
  body("phone").optional().isMobilePhone().withMessage("Invalid phone number"),
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required to update profile"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateProfileUpdate
};
