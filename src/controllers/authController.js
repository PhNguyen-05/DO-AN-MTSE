const authService = require('../services/authService');

class AuthController {
  getRegister(req, res) {
    res.render('auth/register', { errors: [], oldData: {} });
  }

  getVerifyOTP(req, res) {
    const { email, message, error } = req.query;
    res.render('auth/verify-otp', {
      email: email || '',
      message: message || null,
      error: error || null,
      success: false
    });
  }

  async postRegister(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
          return res.status(400).json({
            success: false,
            message: 'Mật khẩu xác nhận không khớp'
          });
        }

        return res.render('auth/register', {
          errors: [{ msg: 'Mật khẩu xác nhận không khớp' }],
          oldData: req.body
        });
      }

      await authService.register(name, email, password);

      const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) ||
        req.is('application/json');

      if (wantsJson) {
        return res.status(200).json({
          success: true,
          message: 'Đăng ký tài khoản thành công! Vui lòng kiểm tra email để lấy mã OTP kích hoạt tài khoản.',
        });
      }

      res.render('auth/verify-otp', {
        email,
        message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
        error: null,
        success: false
      });
    } catch (error) {
      console.error(error);
      const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) ||
        req.is('application/json');

      if (wantsJson) {
        return res.status(400).json({
          success: false,
          message: error.message || 'Đăng ký thất bại'
        });
      }

      res.render('auth/register', {
        errors: [{ msg: error.message || 'Đăng ký thất bại' }],
        oldData: req.body
      });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      await authService.verifyOTP(email, otp);

      const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) ||
        req.is('application/json');

      if (wantsJson) {
        return res.status(200).json({
          success: true,
          message: 'Xác thực tài khoản thành công!',
          email
        });
      }

      res.render('auth/verify-otp', {
        email,
        message: '✅ Xác thực tài khoản thành công!',
        error: null,
        success: true
      });
    } catch (error) {
      const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) ||
        req.is('application/json');

      if (wantsJson) {
        return res.status(400).json({
          success: false,
          message: error.message || 'Xác thực OTP thất bại'
        });
      }

      res.render('auth/verify-otp', {
        email: req.body.email || '',
        message: null,
        error: error.message || 'Xác thực OTP thất bại',
        success: false
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginService(email, password);

      const redirectUrl = result.user.role === 'admin' ? '/admin/dashboard' : '/profile';

      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công!',
        accessToken: result.accessToken,
        user: result.user,
        redirectUrl
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Đăng nhập thất bại'
      });
    }
  }
}

module.exports = new AuthController();