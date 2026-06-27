const authService = require("../services/authService");

class AuthController {
  async postRegister(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu xác nhận không khớp."
        });
      }

      await authService.register(name, email, password);

      return res.status(201).json({
        success: true,
        message: "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.",
        email
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Đăng ký thất bại."
      });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      await authService.verifyOTP(email, otp);

      return res.status(200).json({
        success: true,
        message: "Tài khoản đã được xác thực thành công.",
        email
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Xác thực OTP thất bại."
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password, deviceIdentifier } = req.body;
      const result = await authService.loginService(email, password, deviceIdentifier);
      const redirectUrl = ["Admin", "Manager", "Employee"].includes(result.user.role) ? "/admin/dashboard" : "/profile";

      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công.",
        accessToken: result.accessToken,
        user: result.user,
        redirectUrl
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || "Đăng nhập thất bại."
      });
    }
  }

  async googleLogin(req, res) {
    try {
      const { idToken, deviceIdentifier } = req.body;
      const result = await authService.loginWithGoogle(idToken, deviceIdentifier);
      const redirectUrl = ["Admin", "Manager", "Employee"].includes(result.user.role) ? "/admin/dashboard" : "/profile";
      
      return res.status(200).json({
        success: true,
        message: "Đăng nhập Google thành công.",
        accessToken: result.accessToken,
        user: result.user,
        redirectUrl
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || "Đăng nhập Google thất bại."
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      return res.status(200).json({
        success: true,
        message: "Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn."
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Không thể gửi yêu cầu quên mật khẩu."
      });
    }
  }

  async verifyResetOTP(req, res) {
    try {
      const { email, otp } = req.body;
      await authService.verifyResetOTP(email, otp);
      return res.status(200).json({
        success: true,
        message: "Mã OTP hợp lệ. Bạn có thể đổi mật khẩu mới."
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Mã OTP không hợp lệ."
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword, confirmNewPassword } = req.body;
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu xác nhận không khớp."
        });
      }

      await authService.resetPassword(email, otp, newPassword);
      return res.status(200).json({
        success: true,
        message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Đổi mật khẩu thất bại."
      });
    }
  }

  async resendOTP(req, res) {
    try {
      const { email, type } = req.body;
      await authService.resendOTP(email, type);
      return res.status(200).json({
        success: true,
        message: "Mã OTP mới đã được gửi đến email của bạn."
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Không thể gửi lại OTP."
      });
    }
  }
}

module.exports = new AuthController();
