const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log("EMAIL_USER/EMAIL_PASS are not configured. Registration OTP:");
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

  await transporter.sendMail({
    from: `"TOEIC Luyen Thi" <${emailUser}>`,
    to: email,
    subject: "TOEIC account verification OTP",
    html: `
      <h2>TOEIC Luyen Thi</h2>
      <p>Your verification OTP is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${otp}</p>
      <p>This code expires in 10 minutes.</p>
    `
  });
};

module.exports = { sendOTPEmail };
