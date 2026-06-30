const nodemailer = require("nodemailer");

const OTP_EMAIL_CONTENT = {
  "Đăng ký": {
    subject: "Mã OTP xác thực đăng ký tài khoản TOEIC",
    heading: "Xác thực đăng ký tài khoản",
    description: "Mã OTP xác thực đăng ký của bạn là:"
  },
  "Quên mật khẩu": {
    subject: "Mã OTP khôi phục mật khẩu TOEIC",
    heading: "Khôi phục mật khẩu",
    description: "Mã OTP khôi phục mật khẩu của bạn là:"
  }
};

const sendOTPEmail = async (email, otp, type = "Đăng ký") => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const content = OTP_EMAIL_CONTENT[type] || OTP_EMAIL_CONTENT["Đăng ký"];

  if (!emailUser || !emailPass) {
    console.log("EMAIL_USER/EMAIL_PASS are not configured. OTP fallback:");
    console.log(`Type: ${type}`);
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const textBody = `${content.heading}\n\n${content.description} ${otp}\n\nMã có hiệu lực trong 10 phút.`;

  try {
    await transporter.sendMail({
      from: `"TOEIC Luyen Thi" <${emailUser}>`,
      to: email,
      subject: content.subject,
      text: textBody,
      html: `
        <h2>TOEIC Luyện Thi</h2>
        <p><strong>${content.heading}</strong></p>
        <p>${content.description}</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${otp}</p>
        <p>Mã có hiệu lực trong 10 phút.</p>
      `
    });
  } catch (error) {
    console.error(`Failed to send OTP email (${type}) to ${email}:`, error.message);
    throw new Error("Không thể gửi email OTP. Vui lòng thử lại sau.");
  }
};

module.exports = { sendOTPEmail };
