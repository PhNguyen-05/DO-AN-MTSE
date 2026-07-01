const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const User = require("../models/User");
const Exam = require("../models/Exam");
const Purchase = require("../models/Purchase");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const { recordIncomePayment } = require("../services/revenueService");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/toeic_db");
};

const seedRevenue = async () => {
  await connectDB();

  const user = await User.findOne({ role: "User" });
  if (!user) {
    console.error("Không tìm thấy học viên (role User). Hãy chạy seed tài khoản trước.");
    process.exit(1);
  }

  let exam = await Exam.findOne({ isHidden: { $ne: true } });
  if (!exam) {
    exam = await Exam.create({
      name: "TOEIC Practice Test 2026",
      releaseYear: 2026,
      difficulty: "medium",
      priceBundle: 199000,
      priceListening: 99000,
      priceReading: 99000,
      durationMinutes: 120,
      isHidden: false
    });
    console.log("Đã tạo đề thi mẫu cho dữ liệu doanh thu.");
  }

  const year = new Date().getFullYear();
  const monthlyAmounts = [1200000, 980000, 1450000, 1320000, 1560000, 1780000, 1650000, 1890000, 2100000, 1980000, 2250000, 2400000];

  await Payment.deleteMany({ status: "success", type: "income" });
  await Purchase.deleteMany({ user: user._id, exam: exam._id });
  await Order.deleteMany({ orderCode: /^SEED-REV-/ });

  for (let month = 0; month < 12; month += 1) {
    const paidAt = new Date(year, month, 15, 10, 0, 0);
    const amount = monthlyAmounts[month];

    const purchase = await Purchase.create({
      user: user._id,
      exam: exam._id,
      packageType: "bundle",
      amount,
      status: "paid",
      paidAt
    });

    await recordIncomePayment({
      userId: user._id,
      amount,
      purchaseId: purchase._id,
      paidAt
    });

    await Order.create({
      orderCode: `SEED-REV-${year}-${String(month + 1).padStart(2, "0")}`,
      userId: user._id,
      totalAmount: Math.round(amount * 0.15),
      paymentMethod: "Ví điện tử",
      paymentStatus: "SUCCESS",
      createdAt: paidAt,
      updatedAt: paidAt
    });
  }

  const total = monthlyAmounts.reduce((sum, value) => sum + value, 0) +
    monthlyAmounts.reduce((sum, value) => sum + Math.round(value * 0.15), 0);

  console.log(`✅ Đã seed doanh thu mẫu năm ${year}.`);
  console.log(`   - 12 giao dịch Purchase + Payment`);
  console.log(`   - 12 đơn hàng Order bổ sung`);
  console.log(`   - Tổng doanh thu ước tính: ${total.toLocaleString("vi-VN")} đ`);
  process.exit(0);
};

seedRevenue().catch((error) => {
  console.error("❌ Lỗi seed doanh thu:", error);
  process.exit(1);
});
