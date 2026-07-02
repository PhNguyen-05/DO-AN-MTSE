/**
 * Script set price = 0 cho Đề TOEIC 1 và Đề TOEIC 2 năm 2023
 * Run: node set-free-exams.js (từ thư mục backend/)
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  console.log('🔗 Đang kết nối MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Kết nối thành công!\n');

  const db = mongoose.connection.db;
  const exams = db.collection('exams');

  // Tìm Đề TOEIC 1 và 2 năm 2023
  const toeicExams = await exams.find({
    name: { $regex: /Đề TOEIC [12] năm 2023/i }
  }).toArray();

  console.log(`📋 Tìm thấy ${toeicExams.length} đề TOEIC 1/2 năm 2023:`);
  toeicExams.forEach(e => {
    console.log(`   - "${e.name}" | priceBundle: ${e.priceBundle} | priceListening: ${e.priceListening} | priceReading: ${e.priceReading}`);
  });

  if (toeicExams.length === 0) {
    // Tìm rộng hơn
    const allExams = await exams.find({}).project({ name: 1, priceBundle: 1 }).toArray();
    console.log('\n📋 Tất cả đề thi trong DB:');
    allExams.forEach(e => console.log(`   - "${e.name}" | priceBundle: ${e.priceBundle}`));
    await mongoose.disconnect();
    return;
  }

  // Set price = 0 cho tất cả
  for (const exam of toeicExams) {
    await exams.updateOne(
      { _id: exam._id },
      { $set: { priceBundle: 0, priceListening: 0, priceReading: 0 } }
    );
    console.log(`   ✅ "${exam.name}" → priceBundle: 0, priceListening: 0, priceReading: 0`);
  }

  console.log('\n🎉 Xong! 2 đề TOEIC 1 và 2 năm 2023 đã được set miễn phí.');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
