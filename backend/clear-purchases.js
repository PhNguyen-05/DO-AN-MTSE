/**
 * Script xóa purchase records sai của user tran@gmail.com
 * Run: node clear-purchases.js (từ thư mục backend/)
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  console.log('🔗 Đang kết nối MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Kết nối thành công!\n');

  const db = mongoose.connection.db;
  const purchases = db.collection('purchases');
  const users = db.collection('users');

  // Tìm user tran@gmail.com
  const user = await users.findOne({ email: 'tran@gmail.com' });
  if (!user) {
    console.log('❌ Không tìm thấy user tran@gmail.com');
    await mongoose.disconnect();
    return;
  }

  console.log(`👤 User: ${user.email} (ID: ${user._id})`);

  // Liệt kê purchases
  const userPurchases = await purchases.find({ user: user._id }).toArray();
  console.log(`📋 Tìm thấy ${userPurchases.length} purchase records của user này:\n`);
  userPurchases.forEach(p => {
    console.log(`  - ID: ${p._id} | Exam: ${p.exam} | PackageType: ${p.packageType} | Status: ${p.status}`);
  });

  if (userPurchases.length === 0) {
    console.log('✅ Không có gì cần xóa!');
    await mongoose.disconnect();
    return;
  }

  // Xóa tất cả purchase records của user này
  const result = await purchases.deleteMany({ user: user._id });
  console.log(`\n🗑️  Đã xóa ${result.deletedCount} purchase records của tran@gmail.com`);
  console.log('✅ Xong! User tran@gmail.com hiện không có giao dịch nào.');

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
