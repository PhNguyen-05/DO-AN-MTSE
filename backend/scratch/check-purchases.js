const mongoose = require("mongoose");
require("dotenv").config();
const Order = require("../src/models/Order");
const Purchase = require("../src/models/Purchase");
const User = require("../src/models/User");

async function check() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/toeic_db");
  console.log("Connected to MongoDB");

  const users = await User.find({ accountType: "Premium" });
  console.log("Premium Users count:", users.length);
  users.forEach(u => console.log(`- ${u.email} (${u.fullName})`));

  const purchases = await Purchase.find({});
  console.log("All Purchases count:", purchases.length);
  purchases.forEach(p => console.log(`- User: ${p.user}, Exam: ${p.exam}, packageType: ${p.packageType}, status: ${p.status}`));

  const orders = await Order.find({});
  console.log("All Orders count:", orders.length);
  orders.forEach(o => console.log(`- Code: ${o.orderCode}, status: ${o.paymentStatus}, method: ${o.paymentMethod}, user: ${o.userId}`));

  await mongoose.disconnect();
}

check();
