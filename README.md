# Forgot Password API Only

Project này chỉ chứa **API quên mật khẩu bằng OTP gửi qua Gmail**.

Công nghệ sử dụng:

- NodeJS
- ExpressJS
- Mongoose
- MongoDB
- Nodemailer
- BcryptJS

## 1. Cấu trúc thư mục

```txt
forgot-password-api-only/
  src/
    config/db.js
    controllers/forgotPasswordController.js
    middleware/errorMiddleware.js
    models/User.js
    routes/forgotPasswordRoutes.js
    seed/createTestUser.js
    utils/generateOtp.js
    utils/sendEmail.js
    app.js
    server.js
  .env
  .env.example
  package.json
```

## 2. Các API quên mật khẩu

### Gửi OTP

```http
POST http://localhost:5000/api/forgot-password
```

Body:

```json
{
  "email": "test@gmail.com"
}
```

### Xác thực OTP

```http
POST http://localhost:5000/api/verify-otp
```

Body:

```json
{
  "email": "test@gmail.com",
  "otp": "123456"
}
```

### Đặt lại mật khẩu

```http
POST http://localhost:5000/api/reset-password
```

Body:

```json
{
  "email": "test@gmail.com",
  "otp": "123456",
  "newPassword": "654321"
}
```

## 3. Tạo database MongoDB để test

Bạn có thể dùng MongoDB local hoặc MongoDB Atlas.

### Cách 1: MongoDB local

1. Cài MongoDB Community Server:
   <https://www.mongodb.com/try/download/community>
2. Cài MongoDB Compass:
   <https://www.mongodb.com/products/tools/compass>
3. Mở MongoDB Compass.
4. Connect bằng URI:

```txt
mongodb://127.0.0.1:27017
```

5. Project sẽ tự tạo database tên `forgot_password_demo` khi bạn chạy seed hoặc gọi API.

File `.env` đang dùng sẵn URI local:

```env
MONGO_URI=mongodb://127.0.0.1:27017/forgot_password_demo
```

### Cách 2: MongoDB Atlas

1. Vào <https://www.mongodb.com/products/platform/atlas-database>
2. Tạo tài khoản MongoDB Atlas.
3. Tạo cluster miễn phí M0.
4. Vào **Database Access** để tạo database user.
5. Vào **Network Access** để thêm IP. Khi demo có thể dùng `0.0.0.0/0`.
6. Vào **Connect** → **Drivers** để lấy connection string.
7. Sửa `.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/forgot_password_demo
```

## 4. Tạo một tài khoản trong MongoDB để test

Mở file `.env` và sửa thông tin tài khoản test:

```env
SEED_FULL_NAME=Nguyen Van A
SEED_EMAIL=test@gmail.com
SEED_PASSWORD=123456
```

Lưu ý:

- `SEED_EMAIL` nên là Gmail thật của bạn nếu muốn nhận OTP thật.
- Nếu chỉ test nhanh, để email bất kỳ cũng được, OTP sẽ hiện trong terminal khi chưa cấu hình Gmail gửi mail.

Sau đó chạy:

```bash
npm run seed
```

Kết quả mong muốn:

```txt
MongoDB connected
Da tao tai khoan test: test@gmail.com
Mat khau test hien tai: 123456
```

Vào MongoDB Compass sẽ thấy:

```txt
Database: forgot_password_demo
Collection: users
Document: tài khoản test vừa tạo
```

## 5. Cấu hình Gmail để gửi OTP thật

Mở file `.env`:

```env
EMAIL_USER=
EMAIL_PASS=
```

Sửa thành:

```env
EMAIL_USER=gmail_he_thong@gmail.com
EMAIL_PASS=app_password_16_ky_tu
```

Trong đó:

- `EMAIL_USER` là Gmail hệ thống dùng để gửi OTP.
- `EMAIL_PASS` là App Password, không phải mật khẩu Gmail thường.

Cách tạo App Password:

1. Bật xác minh 2 bước cho Gmail.
2. Vào <https://myaccount.google.com/apppasswords>
3. Tạo App Password.
4. Copy mã 16 ký tự dán vào `EMAIL_PASS`.

Nếu chưa cấu hình `EMAIL_USER` và `EMAIL_PASS`, API vẫn chạy. OTP sẽ được in ra terminal để test.

## 6. Cài đặt và chạy project

Cài thư viện:

```bash
npm install
```

Chạy server:

```bash
npm run dev
```

API chạy tại:

```txt
http://localhost:5000
```

## 7. Quy trình test bằng Postman

### Bước 1: Tạo tài khoản test

```bash
npm run seed
```

### Bước 2: Gửi OTP

Gọi:

```http
POST http://localhost:5000/api/forgot-password
```

Body:

```json
{
  "email": "test@gmail.com"
}
```

Nếu chưa cấu hình Gmail, xem OTP trong terminal.

### Bước 3: Xác thực OTP

Gọi:

```http
POST http://localhost:5000/api/verify-otp
```

Body:

```json
{
  "email": "test@gmail.com",
  "otp": "OTP_VUA_NHAN"
}
```

### Bước 4: Đặt lại mật khẩu

Gọi:

```http
POST http://localhost:5000/api/reset-password
```

Body:

```json
{
  "email": "test@gmail.com",
  "otp": "OTP_VUA_NHAN",
  "newPassword": "654321"
}
```

## 8. Push project này lên GitHub

Chỉ push thư mục `forgot-password-api-only`.

```bash
cd forgot-password-api-only
git init
git add .
git commit -m "Add forgot password OTP API"
git branch -M main
git remote add origin https://github.com/USERNAME/forgot-password-api-only.git
git push -u origin main
```

Không push file `.env` vì file này chứa mật khẩu Gmail. `.gitignore` đã chặn `.env`.

Khi nộp bài hoặc chạy trên máy khác, copy `.env.example` thành `.env` rồi điền lại cấu hình.
