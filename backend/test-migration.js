const mongoose = require('mongoose');
const BlogPost = require('./src/models/BlogPost');
require('dotenv').config();

async function test() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Đã kết nối MongoDB');

    const total = await BlogPost.countDocuments({});
    const withoutThumbnail = await BlogPost.countDocuments({ thumbnailUrl: { $exists: false } });
    
    console.log(`Tổng bài viết: ${total}`);
    console.log(`Thiếu thumbnailUrl: ${withoutThumbnail}`);

    if (withoutThumbnail > 0) {
      console.log('Đang cập nhật...');
      const result = await BlogPost.updateMany(
        { thumbnailUrl: { $exists: false } },
        { $set: { thumbnailUrl: '' } }
      );
      console.log(`Đã cập nhật ${result.modifiedCount} bài viết`);
    } else {
      console.log('Tất cả bài viết đã có thumbnailUrl');
    }

    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error.message);
    process.exit(1);
  }
}

test();
