# 🚀 Hướng dẫn Setup và Chạy Dự án EditProfile

## 1️⃣ Chuẩn bị môi trường

### Kiểm tra cài đặt
```bash
node --version    # >= 14.0
npm --version     # >= 6.0
```

### Khởi động MongoDB
```bash
# Windows - từ Command Prompt
mongod

# macOS/Linux
brew services start mongodb-community
# hoặc
mongod --config /usr/local/etc/mongod.conf
```

Kiểm tra MongoDB chạy: `mongodb://localhost:27017` phải khả dụng

---

## 2️⃣ Cài đặt Backend

```bash
cd backend

# Cài dependencies
npm install

# Tạo folder uploads (để lưu ảnh)
mkdir uploads
```

### Kiểm tra cài đặt
```bash
ls -la        # Kiểm tra thư mục
cat package.json  # Kiểm tra dependencies
```

---

## 3️⃣ Tạo User Mẫu (Seed)

```bash
# Đang ở trong thư mục backend
node seed.js
```

**Output mong đợi**:
```
Seed user created: {
  _id: new ObjectId("678a8c5efb0428348c000001"),
  name: 'Nguyen Van A',
  email: 'a@gmail.com',
  phone: '0123456789',
  avatar: '',
  password: '$2b$10$...',
  __v: 0
}
```

**Lưu lại User ID**: `678a8c5efb0428348c000001`

---

## 4️⃣ Tạo JWT Token

### Cách 1: Dùng Node.js REPL
```bash
node

# Trong Node REPL
const jwt = require('jsonwebtoken');
const userId = '678a8c5efb0428348c000001';  // Thay bằng ID từ seed.js
const token = jwt.sign({ id: userId }, 'your-secret-key');
console.log(token);
```

**Output sẽ giống như**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OGE4YzVlZmIwNDI4MzQ4YzAwMDAwMSIsImlhdCI6MTczNzAxMjM0NX0.kTVDvQ8sH...
```

**Lưu token này** để dùng trong API requests

### Cách 2: Tạo script token
Tạo file `backend/generateToken.js`:
```javascript
const jwt = require('jsonwebtoken');
const userId = process.argv[2] || '678a8c5efb0428348c000001';
const token = jwt.sign({ id: userId }, 'your-secret-key');
console.log('Token:', token);
```

Chạy:
```bash
node generateToken.js 678a8c5efb0428348c000001
```

---

## 5️⃣ Khởi động Backend Server

```bash
# Đang ở trong thư mục backend
npm start
```

**Output mong đợi**:
```
Server running on port 5000
```

Kiểm tra server: `curl http://localhost:5000` hoặc mở browser

---

## 6️⃣ Test API với Postman

### Import Collection
1. Mở Postman
2. **File** → **Import** → Chọn `EditProfile.postman_collection.json`
3. Set Variables:
   - `jwt_token`: Dán token từ bước 4
   - `base_url`: `localhost:5000`

### Test Manual Request

**PUT Request**:
```
URL: http://localhost:5000/api/profile

Headers:
- Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- Content-Type: multipart/form-data

Body (form-data):
- name: "Tran Van B"
- email: "b@gmail.com"
- phone: "0987654321"
- password: "123"
- avatar: (Select Image File)
```

### Test Cases

#### ✅ Test 1: Update Profile Thành công
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: YOUR_TOKEN" \
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
    "password": "$2b$10$...",
    "__v": 0
  }
}
```

#### ❌ Test 2: Không có Token
```bash
curl -X PUT http://localhost:5000/api/profile \
  -F "name=Tran Van B"
```

**Response** (401):
```json
{
  "message": "Unauthorized"
}
```

#### ❌ Test 3: Email Không Hợp Lệ
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: YOUR_TOKEN" \
  -F "email=invalid-email" \
  -F "password=123"
```

**Response** (400):
```json
{
  "message": "Invalid email format"
}
```

#### ❌ Test 4: Mật Khẩu Sai
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: YOUR_TOKEN" \
  -F "name=Test" \
  -F "password=wrongpassword"
```

**Response** (403):
```json
{
  "message": "Invalid password"
}
```

---

## 7️⃣ Export Kết quả Postman

### Cách 1: Export Collection
1. Trong Postman, click **File** → **Export** 
2. Chọn format **Collection v2.1**
3. Lưu file `results.json`

### Cách 2: Export Test Results từ Postman
1. Chạy collection: Click **>** (Run)
2. Chọn requests cần test
3. Click **Run** hoàn thành
4. Bên phải sẽ hiển thị results
5. Click **Save Results** → Chọn định dạng JSON

### Cách 3: Export cURL Commands
1. Mỗi request → Click **Code** (</>) icon
2. Chọn ngôn ngữ **cURL**
3. Copy command

---

## 8️⃣ Chạy Frontend (Tuỳ chọn)

```bash
cd frontend

# Cài dependencies (nếu chưa cài)
npm install

# Chạy dev server
npm start
```

Frontend sẽ mở tại `http://localhost:3000`

---

## ⚙️ Xử sự cố

### ❌ MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Giải pháp**: Khởi động MongoDB trước backend

### ❌ JWT Error: "Forbidden"
```
"message": "Forbidden"
```
**Giải pháp**: 
- Kiểm tra token hợp lệ
- Kiểm tra JWT_SECRET khớp giữa seed.js và authMiddleware.js

### ❌ ENOENT: No such file or directory '...uploads'
**Giải pháp**: 
```bash
mkdir backend/uploads
```

### ❌ Port 5000 đang bị sử dụng
**Giải pháp**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

---

## 📊 Cấu trúc Files Sau Khi Setup

```
backend/
├── uploads/              ← Tạo khi seed.js
│   └── 1747891234567-image.jpg
├── node_modules/         ← Tạo khi npm install
├── models/
│   └── User.js
├── controllers/
│   └── profileController.js
├── services/
│   └── profileService.js
├── repositories/
│   └── userRepository.js
├── middleware/
│   ├── authMiddleware.js
│   └── upload.js
├── server.js
├── seed.js
└── package.json
```

---

## ✅ Checklist Hoàn thành

- [ ] MongoDB chạy
- [ ] Cài dependencies: `npm install`
- [ ] Tạo folder uploads: `mkdir uploads`
- [ ] Seed user: `node seed.js`
- [ ] Tạo JWT Token
- [ ] Backend server chạy: `npm start`
- [ ] Test API bằng curl hoặc Postman
- [ ] Export results thành JSON

---

## 📞 Ghi chú quan trọng

1. **JWT_SECRET**: File sử dụng `process.env.JWT_SECRET` nhưng không set
   - Hiện tại sử dụng default. Trong production cần set biến môi trường

2. **Không có Login endpoint**: Cần thêm endpoint `POST /api/login` để sinh token
   
3. **Password không update**: API chỉ xác thực password, không thay đổi nó

4. **Avatar upload**: Lưu dưới tên `{timestamp}-{filename}` trong thư mục uploads/

5. **Email unique**: Mỗi email chỉ tạo được 1 user

