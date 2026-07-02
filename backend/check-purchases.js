/**
 * Script kiểm tra Purchase records
 * Run: node check-purchases.js (từ thư mục backend/)
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
  const exams = db.collection('exams');

  // Lấy tất cả purchase records có status paid
  const allPurchases = await purchases.find({ status: 'paid' }).toArray();
  console.log(`📋 Tổng Purchase records (status=paid): ${allPurchases.length}\n`);

  for (const p of allPurchases) {
    try {
      const userId = p.user;
      const user = userId ? await users.findOne({ _id: userId }) : null;
      
      let exam = null;
      try {
        const examId = p.exam;
        if (examId) {
          const oid = mongoose.Types.ObjectId.isValid(String(examId)) 
            ? new mongoose.Types.ObjectId(String(examId)) 
            : null;
          if (oid) exam = await exams.findOne({ _id: oid });
        }
      } catch (_) {}

      console.log(`Purchase ID: ${p._id}`);
      console.log(`  User email: ${user?.email || '(không tìm thấy)'} | User ID: ${p.user}`);
      console.log(`  Exam: ${exam?.name || '(không tìm thấy)'} | Exam ID: ${p.exam}`);
      console.log(`  PackageType: ${p.packageType} | Status: ${p.status}`);
      console.log(`  CreatedAt: ${p.createdAt}`);
      console.log('');
    } catch (err) {
      console.log(`  ⚠️ Lỗi đọc record ${p._id}: ${err.message}`);
    }
  }

  await mongoose.disconnect();
  console.log('\n✅ Xong!');
}

run().catch(err => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
