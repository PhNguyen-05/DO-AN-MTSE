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

  // async postRegister(req, res) {
  //   try {
  //     const { name, email, password } = req.body;
  //     await authService.register(name, email, password);
      
  //     // Truyền đầy đủ biến để tránh lỗi "success is not defined"
  //     res.render('auth/verify-otp', { 
  //       email, 
  //       message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
  //       error: null,
  //       success: false 
  //     });
  //   } catch (error) {
  //     res.render('auth/register', { 
  //       errors: [{ msg: error.message }], 
  //       oldData: req.body 
  //     });
  //   }
  // }


  async postRegister(req, res) {
  try {
    const { name, email, password, confirmPassword, gender, dateOfBirth } = req.body;

    // Kiểm tra confirm password
    if (password !== confirmPassword) {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu xác nhận không khớp"
        });
      }
      return res.render('auth/register', { 
        errors: [{ msg: "Mật khẩu xác nhận không khớp" }], 
        oldData: req.body 
      });
    }

    await authService.register(name, email, password);

    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) ||
      req.is('application/json');

    if (wantsJson) {
      return res.status(200).json({
        success: true,
        message: "Đăng ký tài khoản thành công!",
        data: {
          email: email,
          message: "Vui lòng kiểm tra email để lấy mã OTP kích hoạt tài khoản."
        }
      });
    }

    // Render trang Verify OTP nếu là form web
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
        message: error.message
      });
    }

    res.render('auth/register', { 
      errors: [{ msg: error.message }], 
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
          message: error.message
        });
      }

      res.render('auth/verify-otp', { 
        email: req.body.email || '', 
        message: null, 
        error: error.message,
        success: false 
      });
    }
  }
}

module.exports = new AuthController();


// const authService = require('../services/authService');

// class AuthController {

//   // GET Form Đăng ký (cho web)
//   getRegister(req, res) {
//     res.render('auth/register', { errors: [], oldData: {} });
//   }

//   // GET Form Verify OTP (cho web)
//   getVerifyOTP(req, res) {
//     res.render('auth/verify-otp', { 
//       email: req.query.email || '', 
//       message: null, 
//       error: null, 
//       success: false 
//     });
//   }

//   // POST Register - Trả JSON
//   async postRegister(req, res) {
//     try {
//       const { name, email, password, confirmPassword, gender, dateOfBirth } = req.body;

//       if (password !== confirmPassword) {
//         return res.status(400).json({
//           success: false,
//           message: "Mật khẩu xác nhận không khớp"
//         });
//       }

//       const user = await authService.register(name, email, password);

//       res.status(200).json({
//         success: true,
//         message: "Đăng ký tài khoản thành công!",
//         data: {
//           email: email,
//           message: "Vui lòng kiểm tra email để lấy mã OTP kích hoạt tài khoản."
//         }
//       });

//     } catch (error) {
//       console.error(error);
//       res.status(400).json({
//         success: false,
//         message: error.message || "Đăng ký thất bại"
//       });
//     }
//   }

//   // POST Verify OTP - Trả JSON
//   async verifyOTP(req, res) {
//     try {
//       const { email, otp } = req.body;

//       if (!email || !otp) {
//         return res.status(400).json({
//           success: false,
//           message: "Email và mã OTP là bắt buộc"
//         });
//       }

//       await authService.verifyOTP(email, otp);

//       res.status(200).json({
//         success: true,
//         message: "Xác thực tài khoản thành công!",
//         email: email
//       });

//     } catch (error) {
//       console.error(error);
//       res.status(400).json({
//         success: false,
//         message: error.message || "Xác thực OTP thất bại"
//       });
//     }
//   }
// }

// module.exports = new AuthController();