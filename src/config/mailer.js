// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// const sendOTPEmail = async (email, otp) => {
//   await transporter.sendMail({
//     from: `"TOEIC Luyện Thi" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: 'Mã OTP kích hoạt tài khoản TOEIC',
//     html: `
//       <h2>Xin chào,</h2>
//       <p>Mã OTP của bạn là: <strong style="font-size:28px;color:#007bff;">${otp}</strong></p>
//       <p>Mã này sẽ hết hạn sau 10 phút.</p>
//       <p>Trân trọng,<br>Đội ngũ TOEIC Luyện Thi</p>
//     `
//   });
// };

// module.exports = { sendOTPEmail };


const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"TOEIC Luyện Thi" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Mã OTP kích hoạt tài khoản TOEIC - Hiệu lực 10 phút',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0d6efd, #0b5ed7); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 40px 30px; line-height: 1.7; color: #333; }
          .otp-box { 
            background: #f8f9fa; 
            border: 2px dashed #0d6efd; 
            border-radius: 12px; 
            padding: 20px; 
            text-align: center; 
            margin: 25px 0; 
          }
          .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #0d6efd; 
            letter-spacing: 8px; 
          }
          .footer { 
            background: #f8f9fa; 
            padding: 25px; 
            text-align: center; 
            font-size: 14px; 
            color: #666; 
          }
          .btn { 
            display: inline-block; 
            background: #0d6efd; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin-top: 15px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔐 Xác thực tài khoản TOEIC</h2>
          </div>
          
          <div class="content">
            <p>Xin chào <strong>${email}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>TOEIC Luyện Thi</strong>.</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #555;">Mã OTP của bạn là:</p>
              <div class="otp-code">${otp}</div>
            </div>

            <p><strong>Mã này sẽ hết hạn sau 10 phút.</strong></p>
            <p>Vui lòng không chia sẻ mã OTP với bất kỳ ai để đảm bảo an toàn tài khoản.</p>
            
            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
          </div>

          <div class="footer">
            <p>Trân trọng,<br><strong>Đội ngũ TOEIC Luyện Thi</strong></p>
            <p>© 2026 TOEIC Luyện Thi - All Rights Reserved</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

module.exports = { sendOTPEmail };
