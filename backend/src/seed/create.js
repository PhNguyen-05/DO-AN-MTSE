const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import Models
const User = require('../models/User');
const Vocabulary = require('../models/Vocabulary');
const VocabularySet = require('../models/VocabularySet');
const Question = require('../models/Question');
const ExamPaper = require('../models/ExamPaper');
const Coupon = require('../models/Coupon');
const ArticleNews = require('../models/ArticleNews');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/toeic_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  await connectDB();

  try {
    console.log('🔄 Đang dọn dẹp dữ liệu cũ...');
    await User.deleteMany({});
    await Vocabulary.deleteMany({});
    await VocabularySet.deleteMany({});
    await Question.deleteMany({});
    await ExamPaper.deleteMany({});
    await Coupon.deleteMany({});
    await ArticleNews.deleteMany({});
    console.log('✅ Đã dọn dẹp xong.');

    // 1. Tạo Users (đủ các Role)
    console.log('🔄 Đang tạo tài khoản test (Mật khẩu: 123456@Aa)...');
    const passwordHash = await bcrypt.hash('123456@Aa', 10);
    const usersData = [
      {
        fullName: 'Quản trị viên (Admin)',
        email: 'admin@gmail.com',
        passwordHash,
        role: 'Admin',
        status: 'Đang hoạt động',
      },
      {
        fullName: 'Quản lý (Manager)',
        email: 'manager@gmail.com',
        passwordHash,
        role: 'Manager',
        status: 'Đang hoạt động',
      },
      {
        fullName: 'Nhân viên (Employee)',
        email: 'employee@gmail.com',
        passwordHash,
        role: 'Employee',
        status: 'Đang hoạt động',
      },
      {
        fullName: 'Học viên Premium',
        email: 'premium@gmail.com',
        passwordHash,
        role: 'User',
        accountType: 'Premium',
        status: 'Đang hoạt động',
        premiumExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      },
      {
        fullName: 'Học viên Thường',
        email: 'user@gmail.com',
        passwordHash,
        role: 'User',
        accountType: 'Thường',
        status: 'Đang hoạt động',
      }
    ];
    
    const createdUsers = await User.insertMany(usersData);
    const adminUser = createdUsers.find(u => u.role === 'Admin');
    console.log(`✅ Đã tạo ${createdUsers.length} tài khoản.`);

    // 2. Tạo Exam Papers
    console.log('🔄 Đang tạo Đề thi...');
    const examPapersData = [
      {
        title: 'Đề thi thử TOEIC 2024 - Test 1',
        year: 2024,
        difficultyLevel: 'Trung bình',
        priceFull: 50000,
        isFree: true,
      },
      {
        title: 'Đề thi thử TOEIC 2024 - Test 2',
        year: 2024,
        difficultyLevel: 'Khó',
        priceFull: 100000,
        isFree: false,
      }
    ];
    await ExamPaper.insertMany(examPapersData);
    console.log('✅ Đã tạo Đề thi.');

    // 3. Tạo Coupons
    console.log('🔄 Đang tạo Mã giảm giá...');
    const couponsData = [
      {
        code: 'WELCOME100',
        title: 'Giảm 100% cho người mới',
        discountType: 'PERCENTAGE',
        discountValue: 100,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        maxUses: 1000,
      },
      {
        code: 'TET2024',
        title: 'Lì xì Tết 50k',
        discountType: 'FIXED_AMOUNT',
        discountValue: 50000,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        maxUses: 500,
      }
    ];
    await Coupon.insertMany(couponsData);
    console.log('✅ Đã tạo Mã giảm giá.');

    // 4. Tạo Article News
    console.log('🔄 Đang tạo Bài viết/Tin tức...');
    const articlesData = [
      {
        title: 'Bí kíp đạt 900+ TOEIC trong 3 tháng',
        content: 'Bài viết chia sẻ phương pháp học từ vựng và luyện nghe hiệu quả...',
        type: 'Bài viết',
        status: 'APPROVED',
        authorId: adminUser._id,
      },
      {
        title: 'Cập nhật cấu trúc đề thi TOEIC mới nhất',
        content: 'Tin tức về những thay đổi trong cấu trúc đề thi TOEIC...',
        type: 'Tin tức',
        status: 'APPROVED',
        authorId: adminUser._id,
      }
    ];
    await ArticleNews.insertMany(articlesData);
    console.log('✅ Đã tạo Bài viết/Tin tức.');

    // 5. Tạo Vocabulary Set & Vocabulary
    console.log('🔄 Đang tạo Bộ Từ vựng & Từ vựng...');
    const vocabSet = await VocabularySet.create({
      title: 'Từ vựng TOEIC cơ bản',
      description: 'Các từ vựng phổ biến nhất trong đề thi TOEIC',
      thumbnailUrl: '',
      price: 0,
      accessType: 'Miễn phí',
      isVisible: true
    });

    const vocabulariesData = [
      {
        vocabSetId: vocabSet._id,
        word: 'Implement',
        phonetic: '/ˈɪmplɪmənt/',
        wordType: 'Verb',
        meaning: 'Triển khai, thực hiện',
        example: 'The company plans to implement a new policy.',
        exampleTranslation: 'Công ty có kế hoạch triển khai một chính sách mới.',
      }
    ];
    await Vocabulary.insertMany(vocabulariesData);
    console.log('✅ Đã tạo Bộ Từ vựng & Từ vựng.');

    console.log('\n🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC KHỞI TẠO THÀNH CÔNG!');
    console.log('Danh sách tài khoản (mật khẩu chung: 123456@Aa):');
    usersData.forEach(u => console.log(`- ${u.email} (${u.role})`));
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu:', error);
    process.exit(1);
  }
};

seedDatabase();
