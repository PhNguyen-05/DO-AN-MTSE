const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
const avatarDir = path.join(uploadDir, "avatar");
const questionsDir = path.join(uploadDir, "questions");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "avatar") {
      cb(null, avatarDir);
    } else if (file.fieldname === "questionImage") {
      // Ảnh câu hỏi lưu vào folder riêng
      cb(null, questionsDir);
    } else if (file.mimetype.startsWith("image/")) {
      // Ảnh thumbnail vocabulary, blog, v.v. → avatar dir (dùng chung)
      cb(null, avatarDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

module.exports = upload;
