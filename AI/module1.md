# Module 1: Quản lý Tài khoản, Phân quyền & Profile
*Báo cáo tiến độ hoàn thành tính năng Auth - Profile - Admin User Management*

---

## 1. Những phần AI đã hoàn thiện (100%)

### Backend (API & Cơ sở dữ liệu)
- **Database (MongoDB)**: Đã cấu hình các Collection `User` (Bám sát document: `accountType`, `status`, `premiumExpiresAt`, `accumulatedPoints`, `scoreTarget`) và `UserSession` (quản lý session/chống đăng nhập nhiều thiết bị).
- **Luồng Guest (Khách)**: 
  - Đăng ký tài khoản (validate mật khẩu mạnh), sinh mã OTP gửi qua Email (Nodemailer).
  - Kích hoạt tài khoản bằng OTP.
  - Đăng nhập (Email/Password).
  - Đăng ký/Đăng nhập bằng Google (Tự động tạo tài khoản nếu email mới).
  - Quên mật khẩu & Đặt lại mật khẩu (OTP flow).
- **Luồng User (Thường/Premium)**:
  - API GET Profile: Trả về đầy đủ thông tin cá nhân.
  - API PUT Profile: Cập nhật thông tin (Tên, SĐT, Mục tiêu) và hỗ trợ Upload Avatar (Multer).
  - API Đổi mật khẩu.
- **Luồng Admin**:
  - API GET Users: Danh sách người dùng (hỗ trợ search, pagination, filter theo Role và Status).
  - API Đổi quyền (Role): Tự động xóa phiên đăng nhập cũ trên thiết bị của người được đổi quyền để ép đăng nhập lại.
  - API Khóa/Mở khóa tài khoản: Tự động đăng xuất (logout) ngay lập tức nếu tài khoản bị khóa.
- **Bảo mật**: Sử dụng JWT để cấp token, kiểm tra chặt chẽ tính hợp lệ của token thông qua collection `UserSession`.

### Frontend (Giao diện React & Redux)
- **Giao diện Premium (Glassmorphism)**: Tích hợp thư viện Bootstrap 5 kết hợp tự viết Custom CSS để giao diện đẹp, hiện đại.
- **Màn hình Khách (Guest)**: 
  - `Login.jsx` & `Register.jsx`: Form chuẩn, nút Google OAuth2 đẹp mắt. Có thanh progress đo độ mạnh mật khẩu.
  - `VerifyOtp.jsx`: Giao diện 6 ô vuông nhập mã OTP, tự động nhảy ô và có đồng hồ đếm ngược.
  - `ForgotPassword.jsx`: Form khôi phục 3 bước (Nhập mail -> Nhập OTP -> Đặt mật khẩu).
- **Màn hình User (`EditProfile.jsx`)**: Dashboard cá nhân cho phép bấm vào Avatar để thay đổi ảnh, hiển thị Mức Rank, Điểm tích lũy, Mục tiêu TOEIC và form đổi mật khẩu.
- **Màn hình Admin (`AdminDashboard.jsx`)**: Bảng quản lý người dùng với Dropdown đổi quyền và Badge hiển thị trạng thái sinh động.
- **Tích hợp hệ thống**: 
  - Cấu hình Axios Interceptor tự động gắn `Bearer token` vào mọi request.
  - Redux Toolkit (`authSlice.js`) quản lý trạng thái Đăng nhập, Loading và Thông báo lỗi.
  - Thông báo Toast (`react-toastify`) xuất hiện mượt mà cho mọi hành động.

---

## 2. Những thứ BẠN (User) cần bổ sung/điền vào

Để hệ thống hoạt động hoàn hảo 100%, bạn cần hoàn tất các thao tác điền key bí mật sau:

### A. Cấu hình Backend (`backend/.env`)
Mở file `backend/.env` và đảm bảo bạn đã điền các thông số thật (đặc biệt là Google và Email):

```env
# Port & Database
PORT=3000
MONGODB_URI=mongodb://localhost:27017/toeic_practice

# JWT Secret Key
JWT_SECRET=mot_chuoi_bi_mat_bat_ky_cua_ban
JWT_EXPIRES_IN=30d

# Nodemailer (Dùng để gửi mã OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth2 (Lấy từ Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```
*(Lưu ý: Đối với `EMAIL_PASS`, bạn cần dùng **Mật khẩu ứng dụng (App Password)** của Gmail, không phải mật khẩu đăng nhập bình thường)*.

### B. Cấu hình Frontend (`frontend/src/main.jsx`)
Mở file `frontend/src/main.jsx`, tìm dòng số 12:
```javascript
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; 
```
Thay thế `"YOUR_GOOGLE_CLIENT_ID"` bằng Client ID Google thực tế của bạn để nút Đăng nhập Google sáng lên và hoạt động.

---

## 3. Cần cài thêm thư viện nào nữa không?

**KHÔNG CẦN CÀI THÊM THƯ VIỆN GÌ CẢ**. Tôi đã tự động chạy lệnh cài đặt toàn bộ các thư viện cần thiết trong lúc code:
- Backend: Đã có `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `nodemailer`, `multer`, `google-auth-library`.
- Frontend: Đã cài thêm `@react-oauth/google` và `react-toastify`.

---

## 4. Hướng dẫn khởi chạy

Chỉ cần mở 2 Terminal và chạy:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Giao diện sẽ chạy ở `http://localhost:5173`. Bạn có thể bắt đầu đăng ký một tài khoản và trải nghiệm luồng làm việc!
