const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const conflictedFiles = [
  'backend/package-lock.json',
  'backend/package.json',
  'backend/src/controllers/adminController.js',
  'backend/src/controllers/authController.js',
  'backend/src/models/Coupon.js',
  'backend/src/models/Question.js',
  'backend/src/models/User.js',
  'backend/src/models/VocabularySet.js',
  'backend/src/routes/adminRoutes.js',
  'backend/src/seed/profileSeed.js',
  'backend/src/services/profileService.js',
  'frontend/src/App.jsx',
  'frontend/src/pages/AdminDashboard.jsx',
  'package-lock.json'
];

for (const file of conflictedFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  console.log(`Resolving ${file}...`);

  if (file.includes('package-lock.json')) {
    // Luôn ưu tiên bản của nhánh hiện tại cho lockfile, sau đó npm install lại sẽ fix
    execSync(`git checkout --ours "${file}"`);
    execSync(`git add "${file}"`);
    continue;
  }

  if (file === 'backend/package.json') {
    // package.json thường nên giữ cả 2 hoặc ưu tiên THEIRS nếu họ thêm nhiều thư viện
    execSync(`git checkout --theirs "${file}"`);
    execSync(`git add "${file}"`);
    continue;
  }

  // Đọc nội dung file
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (file.includes('adminController.js') || file.includes('adminRoutes.js') || file.includes('models/')) {
    // Tran_Module2 code thêm rất nhiều module mới (Coupon, Question, Vocabulary, Blog). Ta chọn THEIRS.
    execSync(`git checkout --theirs "${file}"`);
  } 
  else if (file === 'backend/src/controllers/authController.js') {
    // Giữ code của HEAD (vì có deviceIdentifier và role viết hoa)
    execSync(`git checkout --ours "${file}"`);
  }
  else if (file === 'frontend/src/App.jsx') {
    // Giữ code của HEAD cho App.jsx (vì có giao diện layout mới, ChatWidget, ProtectedRoute nâng cao)
    execSync(`git checkout --ours "${file}"`);
  }
  else {
    // Mặc định: Giữ code của nhánh Tran_Module2 đối với những file thêm mới tính năng
    execSync(`git checkout --theirs "${file}"`);
  }

  execSync(`git add "${file}"`);
  console.log(`✅ Đã xử lý xong: ${file}`);
}

console.log("Hoàn tất tự động giải quyết xung đột!");
