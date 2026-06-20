const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const staffUsers = [
  {
    name: process.env.SEED_ADMIN_NAME || "TOEIC Admin",
    email: (process.env.SEED_ADMIN_EMAIL || "admin@gmail.com").trim().toLowerCase(),
    password: process.env.SEED_ADMIN_PASSWORD || "123456",
    role: "admin"
  },
  {
    name: process.env.SEED_MANAGER_NAME || "TOEIC Manager",
    email: (process.env.SEED_MANAGER_EMAIL || "manager@gmail.com").trim().toLowerCase(),
    password: process.env.SEED_MANAGER_PASSWORD || "123456",
    role: "manager"
  }
];

const upsertStaffUser = async ({ name, email, password, role }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true,
      resetPasswordOtp: undefined,
      resetPasswordOtpExpires: undefined,
      resetPasswordOtpVerified: false
    },
    { upsert: true, runValidators: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`${role}: ${email} / ${password}`);
};

const seedStaffUsers = async () => {
  await connectDB();

  for (const staffUser of staffUsers) {
    await upsertStaffUser(staffUser);
  }

  await mongoose.connection.close();
};

seedStaffUsers().catch(async (error) => {
  console.error(error.message);
  await mongoose.connection.close();
  process.exit(1);
});
