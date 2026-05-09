
## 🚀 Hướng Dẫn Chạy Ứng Dụng

### ✅ Bước 1: Chuẩn Bị Môi Trường
```bash
# Kiểm tra Node.js
node --version   # >= 14.0
npm --version    # >= 6.0

# Khởi động MongoDB
mongod
```

### ✅ Bước 2: Cài Đặt Backend
```bash
cd backend
npm install

# Tạo thư mục uploads
mkdir uploads
```

### ✅ Bước 3: Tạo User Mẫu
```bash
node seed.js
```

**Output**:
```
Seed user created: {
  _id: ObjectId("678a8c5efb0428348c000001"),
  name: "Nguyen Van A",
  email: "a@gmail.com",
  phone: "0123456789",
  password: "$2b$10$...",
  __v: 0
}
```

**Lưu lại**:
- User ID: `678a8c5efb0428348c000001`
- Email: `a@gmail.com`
- Password: `123`

### ✅ Bước 4: Tạo JWT Token
```bash
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({id: '678a8c5efb0428348c000001'}, 'your-secret-key'))"
```

**Output** (lưu token này):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OGE4YzVlZmIwNDI4MzQ4YzAwMDAwMSIsImlhdCI6MTczNzAxMjM0NX0.kTVDvQ8sH...
```

### ✅ Bước 5: Khởi Động Backend Server
```bash
npm start
```

**Output**:
```
Server running on port 5000
```

---

## 🧪 Test API

### Cách 1: Dùng cURL
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "name=Tran Van B" \
  -F "email=b@gmail.com" \
  -F "phone=0987654321" \
  -F "password=123"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "678a8c5efb0428348c000001",
    "name": "Tran Van B",
    "email": "b@gmail.com",
    "phone": "0987654321",
    "avatar": "",
    "__v": 0
  }
}
```

### Cách 2: Dùng Postman
1. Import file: `EditProfile.postman_collection.json`
2. Set biến:
   - `jwt_token`: Dán token từ bước 4
   - `base_url`: `localhost:5000`
3. Chạy request **Update Profile**

---

## 📊 Export Kết quả Postman

### Phương pháp 1: Export Collection
1. **File** → **Export** → Format **Collection v2.1**
2. Lưu `EditProfile-export.json`

### Phương pháp 2: Chạy và Export Test Results
```bash
# Cài Newman
npm install -g newman
npm install -g newman-reporter-html

# Chạy tests
newman run EditProfile.postman_collection.json \
  -e environment.json \
  --reporters cli,html,json \
  --reporter-html-export ./reports/report.html \
  --reporter-json-export ./reports/results.json
```

**Output**:
- `reports/report.html` - HTML Report (mở trong browser)
- `reports/results.json` - JSON Results

### Phương pháp 3: Export Responses Samples
Mỗi request trong Postman:
1. **Send**
2. **Save Response** → **Save as example**
3. **File** → **Export**

---

## 📦 Files Được Tạo Ra

Tôi đã tạo các tệp hướng dẫn:

1. **📄 PROJECT_OVERVIEW.md** - Mô tả chi tiết dự án
2. **📄 SETUP_GUIDE.md** - Hướng dẫn setup từng bước  
3. **📄 POSTMAN_EXPORT_GUIDE.md** - Cách export kết quả từ Postman
4. **📄 QUICK_REFERENCE.md** - Card tham chiếu nhanh
5. **📦 EditProfile.postman_collection.json** - Collection Postman sẵn
6. **🌍 environment.json** - Postman environment variables

---

## ⚠️ Vấn đề Cần Lưu Ý

| Vấn đề | Giải Pháp |
|--------|----------|
| JWT_SECRET không được định nghĩa | Set biến môi trường: `export JWT_SECRET=your-secret-key` |
| Không có endpoint login | Tạo JWT thủ công hoặc thêm endpoint POST /api/login |
| uploads folder không tồn tại | Chạy: `mkdir backend/uploads` |
| MongoDB connection error | Khởi động MongoDB: `mongod` |
| Port 5000 bị sử dụng | Kill process: `lsof -i :5000 \| grep LISTEN` → `kill -9 <PID>` |

---

## ✅ Checklist Hoàn Thành

```
□ Cài Node.js >= 14.0
□ Khởi động MongoDB
□ npm install (backend)
□ mkdir uploads
□ node seed.js (tạo user mẫu)
□ Tạo JWT token
□ npm start (backend server)
□ Test API bằng curl/Postman
□ Export kết quả (JSON/HTML)
```

---

## 📞 Thông Tin Nhanh

- **Server Port**: 5000
- **Database**: MongoDB (localhost:27017)
- **Database Name**: toeic
- **API Endpoint**: PUT /api/profile
- **Authentication**: JWT in Authorization header

---

## 🔗 Các Files Liên Quan

```
backend/
├── server.js ........................ Khởi tạo server
├── seed.js .......................... Tạo user mẫu
├── models/User.js ................... Schema MongoDB
├── controllers/profileController.js  Request handler
├── services/profileService.js ....... Business logic
├── repositories/userRepository.js ... Database access
├── middleware/
│   ├── authMiddleware.js ............ JWT verification
│   └── upload.js .................... File upload config
├── uploads/ ......................... Thư mục lưu ảnh
└── package.json

frontend/
└── src/
    ├── App.js ....................... React component
    └── components/EditProfile.js .... Edit form

Documentation/
├── PROJECT_OVERVIEW.md .............. Mô tả dự án
├── SETUP_GUIDE.md ................... Setup từng bước
├── POSTMAN_EXPORT_GUIDE.md .......... Export kết quả
├── QUICK_REFERENCE.md .............. Card tham chiếu
├── EditProfile.postman_collection.json .. Collection
├── environment.json ................. Postman env
└── README.md (file này)
```

---

## 🎓 Học Từ Dự án Này

1. **Express.js**: Tạo REST API
2. **MongoDB + Mongoose**: Database và schema
3. **JWT**: Authentication
4. **Multer**: File upload
5. **bcrypt**: Password hashing
6. **Middleware pattern**: authMiddleware
7. **Repository pattern**: Separate business logic từ database
8. **React**: Form handling và API calls
9. **FormData**: Upload files với form data
10. **Postman**: API testing và documentation

---

Chạy project

Backend:

cd backend
node server.js

Frontend:

cd frontend
npm start


Test token

Mở Console trình duyệt:

localStorage.setItem(
  "token",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmY5MmJiODk0OTczNjFmNDlkODJlYiIsImlhdCI6MTc3ODM2NTcyM30.UQYf30GFVX-P9Dac4JN61mSYiMEogWM4Su4ENLatnl0"
)
 
LẤY MÃ TOKEN 
cd backend
node seed
