/**
 * Migration script: normalize all User documents with lowercase roles
 * Run: node backend/migrate-roles.js
 */
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

async function run() {
  if (!MONGO_URI) {
    console.error('❌ Không tìm thấy MONGODB_URI trong .env');
    process.exit(1);
  }

  console.log('🔗 Đang kết nối MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Kết nối thành công!\n');

  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  // Find all users with lowercase roles
  const lowercaseRoleUsers = await usersCollection.find({
    role: { $in: ['user', 'admin', 'manager', 'employee'] }
  }).toArray();

  console.log(`📋 Tìm thấy ${lowercaseRoleUsers.length} user có role chữ thường cần sửa:`);
  lowercaseRoleUsers.forEach(u => {
    console.log(`   - ${u.email}: role="${u.role}"`);
  });

  if (lowercaseRoleUsers.length === 0) {
    console.log('\n✅ Không có gì cần migration!');
    await mongoose.disconnect();
    return;
  }

  // Update each user: capitalize role
  let updated = 0;
  for (const u of lowercaseRoleUsers) {
    const newRole = u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase();
    await usersCollection.updateOne(
      { _id: u._id },
      { $set: { role: newRole } }
    );
    console.log(`   ✅ ${u.email}: "${u.role}" → "${newRole}"`);
    updated++;
  }

  console.log(`\n🎉 Migration hoàn tất! Đã cập nhật ${updated} user.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('❌ Lỗi migration:', err.message);
  process.exit(1);
});
