const authService = require("../services/authService");

class AuthController {
  async postRegister(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Password confirmation does not match."
        });
      }

      await authService.register(name, email, password);

      return res.status(201).json({
        success: true,
        message: "Account registered successfully. Please check your email for the OTP code.",
        email
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Registration failed."
      });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      await authService.verifyOTP(email, otp);

      return res.status(200).json({
        success: true,
        message: "Account verified successfully.",
        email
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "OTP verification failed."
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginService(email, password);
      const redirectUrl = result.user.role === "admin" ? "/admin/dashboard" : "/profile";

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        accessToken: result.accessToken,
        user: result.user,
        redirectUrl
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || "Login failed."
      });
    }
  }
}

module.exports = new AuthController();
