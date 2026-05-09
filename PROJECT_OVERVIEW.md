# EditProfile Project - Tổng Quan

## 📋 Mô tả dự án
Dự án **EditProfile** là một ứng dụng full-stack cho phép người dùng cập nhật hồ sơ cá nhân bao gồm:
- Họ tên, email, số điện thoại
- Ảnh đại diện (avatar)
- Xác thực qua mật khẩu

---

## 🏗️ Kiến trúc Backend

### Công nghệ sử dụng
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token)
- **File Upload**: Multer
- **Password Hashing**: bcrypt

### Cấu trúc thư mục Backend
```
backend/
├── models/
│   └── User.js           # Schema MongoDB cho User
├── controllers/
│   └── profileController.js  # Xử lý logic update profile
├── services/
│   └── profileService.js    # Business logic (validate, update)
├── repositories/
│   └── userRepository.js    # Tương tác với database
├── middleware/
│   ├── authMiddleware.js    # JWT authentication
│   └── upload.js           # Multer configuration
├── uploads/              # Thư mục lưu ảnh upload
├── server.js            # Entry point
├── seed.js              # Script tạo user mẫu
└── package.json
```

---

## 🎯 API Endpoint

### PUT /api/profile
**Mô tả**: Cập nhật hồ sơ người dùng

#### Headers yêu cầu:
```
Authorization: <JWT_TOKEN>
Content-Type: multipart/form-data
```

#### Request Body (FormData):
- `name` (string): Họ tên người dùng
- `email` (string): Email (phải có @)
- `phone` (string): Số điện thoại
- `password` (string): Mật khẩu hiện tại (để xác thực)
- `avatar` (file, optional): Ảnh đại diện

#### Response thành công (200):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Nguyen Van A",
    "email": "newemail@gmail.com",
    "phone": "0987654321",
    "avatar": "1747891234567-profile.jpg",
    "__v": 0
  }
}
```

#### Response lỗi:
- `401 Unauthorized`: Không có token
- `403 Forbidden`: Token không hợp lệ hoặc mật khẩu sai
- `400 Bad Request`: Email không hợp lệ
- `404 Not Found`: Không tìm thấy user

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,           // Họ tên
  email: String,          // Email (unique)
  phone: String,          // Số điện thoại
  avatar: String,         // Đường dẫn ảnh
  password: String        // Mật khẩu (hash)
}
```

---

## 🎨 Frontend

### Công nghệ
- React.js
- Axios (HTTP client)

### Thành phần chính
- **App.js**: Component chính
- **EditProfile.js**: Form cập nhật hồ sơ
  - Nhập thông tin cá nhân
  - Upload ảnh đại diện
  - Gửi FormData đến API với JWT token từ localStorage

---

## 🚀 Hướng dẫn Chạy Ứng dụng

### ✅ Yêu cầu tiên quyết
1. **Node.js** >= 14.0
2. **MongoDB** chạy trên `localhost:27017`
3. **npm** hoặc **yarn**

### 📦 Bước 1: Cài đặt Dependencies

#### Backend
```bash
cd backend
npm install
```

Packages sẽ cài:
- express
- mongoose
- jsonwebtoken
- bcrypt
- multer

#### Frontend (nếu cần)
```bash
cd frontend
npm install
```

### 🌱 Bước 2: Seed dữ liệu (Tạo user mẫu)

```bash
cd backend
node seed.js
```

**Output mong đợi**:
```
Seed user created: {
  _id: ObjectId(...),
  name: "Nguyen Van A",
  email: "a@gmail.com",
  phone: "0123456789",
  avatar: "",
  password: "$2b$10$...",
  __v: 0
}
```

**User mẫu**:
- Email: `a@gmail.com`
- Password: `123`
- ID: (lấy từ output)

### 🔑 Bước 3: Tạo JWT Token

Trước khi gọi API, bạn cần token. Sử dụng Postman hoặc script Node.js:

**Tạo token bằng Node.js**:
```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 'USER_ID' }, 'your-secret-key');
console.log(token);
```

> **Lưu ý**: File `server.js` không có authentication endpoint để tạo token. 
> Bạn cần thêm endpoint login hoặc tạo token trực tiếp bằng code.

### 🌍 Bước 4: Chạy Backend Server

```bash
cd backend
npm start
```

**Output mong đợi**:
```
Server running on port 5000
```

Server sẽ lắng nghe trên: `http://localhost:5000`

### 💻 Bước 5: Chạy Frontend (tuỳ chọn)

```bash
cd frontend
npm start
```

Frontend sẽ chạy trên `http://localhost:3000`

---

## 🧪 Kiểm tra API với Postman

### Cách 1: Import Postman Collection
1. Mở Postman
2. Click **Import** → Chọn file `EditProfile.postman_collection.json`
3. Các request đã được cấu hình sẵn

### Cách 2: Tạo Request thủ công

**PUT Request to Update Profile**
```
URL: http://localhost:5000/api/profile

Headers:
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Body (form-data):
- name: "Tran Van B"
- email: "b@gmail.com"
- phone: "0987654321"
- password: "123"
- avatar: (select file)
```

---

## ⚠️ Vấn đề cần lưu ý

1. **JWT Secret không được định nghĩa**: File `authMiddleware.js` sử dụng `process.env.JWT_SECRET` nhưng không được set
   - Thêm `.env` file hoặc export biến môi trường
   
2. **Không có endpoint login**: Cần thêm POST /api/login endpoint
   
3. **Upload folder không tồn tại**: Tạo thư mục `uploads/` trước khi chạy
   ```bash
   mkdir backend/uploads
   ```

---

## 📝 Ghi chú

- Avatar được lưu dưới tên: `{timestamp}-{original-filename}`
- Mật khẩu không bao giờ được cập nhật qua API này (chỉ xác thực)
- Email phải unique và phải chứa ký tự `@`
- Token có thể hết hạn (cần implement refresh token)

