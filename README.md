# TOEIC Practice - Website Luyện Thi TOEIC

## 📘 Giới thiệu

TOEIC Practice là một web app luyện thi TOEIC toàn diện, được xây dựng với kiến trúc frontend React/Vite và backend Node.js/Express. Ứng dụng hỗ trợ mua đề thi, quản lý giỏ hàng, thanh toán trực tuyến, lịch sử mua hàng, đánh giá sản phẩm và quản lý tài khoản người dùng.

Ứng dụng hướng tới trải nghiệm học tập thân thiện với giao diện hiện đại, xử lý thanh toán, lưu trữ dữ liệu người dùng và các tài nguyên ôn luyện.

## ⚡ Tính năng chính

### Người dùng

- 🛒 Thêm đề thi, từ vựng và gói Premium vào giỏ hàng
- 💳 Thanh toán qua VNPay / giả lập thanh toán thành công
- 📜 Xem lịch sử mua hàng và đơn hàng đã thanh toán
- ⭐ Đánh giá và bình luận sản phẩm sau khi mua
- 🔐 Quản lý thông tin cá nhân, đăng nhập và đăng xuất
- 🧾 Xem kết quả thanh toán thành công

### Hệ thống

- 🔁 Quản lý giỏ hàng và mua sắm
- 🧾 Tạo đơn hàng và lưu lịch sử thanh toán
- 📦 Quản lý trạng thái đơn hàng, tính toán tổng tiền và giảm giá
- 🌐 API REST cho frontend và backend
- 🔒 Bảo mật token, xác thực người dùng

## 🧱 Kiến trúc công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React, Vite, React Router, Bootstrap 5, React Toastify |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcrypt |
| Cơ sở dữ liệu | MongoDB |
| Công cụ | npm, Vite, Nodemon |

## 📂 Cấu trúc thư mục

```
DO-AN-MTSE/
├── backend/            # Backend API, server, controllers, models, routes
├── frontend/           # Frontend React/Vite app
├── README.md           # Tài liệu dự án
├── package.json        # Thư viện root (nếu có dùng chung)
└── ...
```

### Backend

- `backend/src/controllers` - điều khiển các yêu cầu API
- `backend/src/services` - xử lý nghiệp vụ và logic lớp dịch vụ
- `backend/src/models` - định nghĩa schema Mongoose
- `backend/src/routes` - khai báo route API
- `backend/src/utils` - tiện ích, cấu hình axios

### Frontend

- `frontend/src/pages` - các trang React
- `frontend/src/components` - các component chung
- `frontend/src/redux` - state quản lý người dùng
- `frontend/src/services` - cấu hình axios và API client
- `frontend/src/utils` - helper, storage

## 🚀 Cài đặt & chạy dự án

### 1. Cài đặt backend

```bash
cd backend
npm install
```

Tạo file `.env` trong `backend/` với nội dung mẫu:

```env
PORT=3000
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EMAIL_FROM="TOEIC Luyen Thi <noreply@toeic.com>"
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
VITE_API_URL=http://localhost:3000
MONGO_URI=mongodb://username:password@localhost:27017/toeic_db
```

Chạy backend:

```bash
npm run dev
```

### 2. Cài đặt frontend

```bash
cd frontend
npm install
```

Chạy frontend:

```bash
npm run dev
```

### 3. Truy cập ứng dụng

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## 📌 Các lệnh hữu ích

### Backend

- `npm run dev` - chạy server backend với nodemon
- `npm start` - khởi chạy backend sản phẩm
- `npm run seed` - seed dữ liệu người dùng thử
- `npm run seed:staff` - seed dữ liệu staff
- `npm run seed:profile` - seed profile mẫu
- `npm run seed:revenue` - seed dữ liệu doanh thu

### Frontend

- `npm run dev` - chạy frontend trong môi trường phát triển
- `npm run build` - build frontend cho môi trường production
- `npm run preview` - xem thử bản build

## 🛠️ Lưu ý triển khai

- Đảm bảo MongoDB đang hoạt động và URL kết nối đúng
- Thiết lập biến môi trường với thông tin JWT và email gửi mail
- Nếu sử dụng Google OAuth, cấu hình `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`

## 📈 Phát triển thêm

- Tích hợp nhiều phương thức thanh toán hơn
- Hoàn thiện trang cá nhân và quản lý người dùng
- Thêm bài kiểm tra, unit test và e2e test
- Tối ưu hiệu năng và cache dữ liệu

## 👥 Nhóm phát triển

| Họ và Tên | MSSV |
| --- | --- |
| Nguyễn Thị Hoàng Kim | 23110248 |
| Trần Hồ Phương Nguyên | 23110271 |
| Nguyễn Phạm Bảo Trân | 23110348 |
| Nguyễn Nhựt Hào | 23110208 |

---

## 📄 Liên hệ

Nếu cần hỗ trợ hoặc mở rộng chức năng, vui lòng liên hệ qua email hoặc xem tài liệu hướng dẫn trong repo.
