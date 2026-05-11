const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const createTestUser = async () => {
  await connectDB();

  const name = process.env.SEED_FULL_NAME || process.env.SEED_NAME || "Nguyen Van A";
  const email = (process.env.SEED_EMAIL || "test@gmail.com").trim().toLowerCase();
  const password = process.env.SEED_PASSWORD || "123456";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    existingUser.name = name;
    existingUser.password = hashedPassword;
    existingUser.resetPasswordOtp = undefined;
    existingUser.resetPasswordOtpExpires = undefined;
    existingUser.resetPasswordOtpVerified = false;
    existingUser.isVerified = true;
    await existingUser.save();
    console.log(`Da cap nhat tai khoan test: ${email}`);
  } else {
    await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true,
      role: "user"
    });
    console.log(`Da tao tai khoan test: ${email}`);
  }

  console.log(`Mat khau test hien tai: ${password}`);
  await mongoose.connection.close();
};

createTestUser().catch(async (error) => {
  console.error(error.message);
  await mongoose.connection.close();
  process.exit(1);
});
