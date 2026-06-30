const nodemailer = require('nodemailer');
require('dotenv').config();

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

console.log('EMAIL_USER:', user);
console.log('EMAIL_PASS length:', pass ? pass.length : 'NOT SET');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass },
  tls: { rejectUnauthorized: false }
});

transporter.sendMail({
  from: user,
  to: user,
  subject: 'TEST OTP he thong TOEIC',
  text: 'Ma OTP cua ban la: 123456. Het han sau 10 phut.'
}, (err, info) => {
  if (err) {
    console.log('LOI GUI EMAIL:', err.message);
    console.log('Full error:', JSON.stringify(err, null, 2));
  } else {
    console.log('GUI EMAIL THANH CONG:', info.messageId);
    console.log('Response:', info.response);
  }
  process.exit(0);
});
