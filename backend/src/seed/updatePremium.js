const mongoose = require('mongoose');
require('dotenv').config();

const premiumSchema = new mongoose.Schema({}, { strict: false, collection: 'premium' });
const Premium = mongoose.model('Premium', premiumSchema);

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await Premium.findOneAndUpdate(
    {},
    {
      $set: {
        name: 'Gói Premium 1 Năm',
        description: 'Mở khóa toàn bộ nội dung và học tập không giới hạn trong 12 tháng. Trải nghiệm đầy đủ hệ thống luyện thi TOEIC chuyên sâu.',
        price: 1500000,
        currency: 'VND',
        durationMonths: 12,
        buttonText: 'Đăng ký ngay',
        isActive: true,
        features: [
          'Mở khóa 100% bộ đề TOEIC trong hệ thống (bao gồm đề Premium).',
          'Mở khóa 100% bộ từ vựng và bài học chuyên sâu.',
          'Truy cập toàn bộ nội dung trong 12 tháng kể từ ngày kích hoạt.',
          'Luyện thi theo Part không giới hạn với đề mới nhất.',
          'Thống kê tiến độ và phân tích điểm yếu chi tiết.',
          'Sổ tay từ vựng cá nhân & ôn tập câu hỏi khó đã lưu.',
        ]
      }
    },
    { new: true, upsert: true }
  );
  console.log('Updated:', result.name, result.price);
  mongoose.disconnect();
}).catch(e => { console.error(e.message); process.exit(1); });
