const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log("EMAIL_USER/EMAIL_PASS chua cau hinh. OTP test se hien o day:");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
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
    from: `"Forgot Password Demo" <${emailUser}>`,
    to,
    subject,
    text
  });
};

module.exports = sendEmail;
