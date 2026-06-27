# Tổng kết Triển khai Module Tài Khoản & Quản Trị Hệ Thống

Tôi đã hoàn thành việc triển khai các module Auth, User Profile, và Admin Management theo thiết kế cơ sở dữ liệu MongoDB và các yêu cầu nghiệp vụ của bạn. Dưới đây là tóm tắt những tính năng đã hoàn thiện:

## 1. Cấu hình & Môi trường

> [!NOTE]
> Bạn có thể thêm Client ID của Google vào tệp [backend/.env](file:///d:/HK6/CNPM_NEW/DoAn/DO-AN-MTSE/backend/.env#L13-L15) để kích hoạt đăng nhập qua Google OAuth2.

- **Dependencies**: Đã cài đặt thư viện `google-auth-library` để hỗ trợ xử lý token của Google OAuth2.
- **Biến môi trường**: Đã tạo template lưu trữ `GOOGLE_CLIENT_ID` trong tệp `.env`.

## 2. Module Authentication (Guest & User)

- **Đăng ký (Register)**: Mật khẩu được Validate độ mạnh (8 ký tự, hoa, thường, số, ký tự đặc biệt). Sinh OTP lưu vào Collection `OtpVerifications` thay vì Redis, và gửi OTP qua cấu hình mailer hiện có.
- **Xác thực OTP**: Mã OTP có đếm ngược, kiểm tra độ hợp lệ theo `expiresAt` và trạng thái `isUsed`.
- **Đăng nhập (Login)**: Kiểm tra trạng thái tài khoản (`Chưa kích hoạt`, `Đang hoạt động`, `Bị khóa`). Xử lý tạo phiên làm việc mới, đồng thời lưu `token` vào database theo Collection `UserSessions`. Các phiên đăng nhập trên thiết bị cũ sẽ tự động bị xóa (Chỉ cho phép 1 user đăng nhập 1 thiết bị).
- **Google OAuth2**: Hỗ trợ đăng nhập trực tiếp, tự động tạo tài khoản mới nếu chưa tồn tại trong DB, xác minh thông qua Google ID Token.
- **Quên mật khẩu**: Hoàn thiện toàn bộ luồng tạo OTP, Validate OTP (OTP riêng cho loại *Quên mật khẩu*) và cập nhật (Reset) mật khẩu.

## 3. Module User Profile

- **Giao diện cập nhật (Update Profile)**: Người dùng có thể thay đổi Họ tên, Số điện thoại và Mục tiêu điểm. Hỗ trợ upload ảnh đại diện thông qua **Multer**, lưu ở thư mục `/uploads`.
- **Đổi mật khẩu (Change Password)**: Cho phép đổi mật khẩu với validate mật khẩu mạnh. **Lưu ý:** Sau khi đổi mật khẩu, hệ thống tự động vô hiệu hóa toàn bộ phiên đăng nhập hiện hành, yêu cầu người dùng đăng nhập lại vì lý do bảo mật.

## 4. Module Admin Management

- **Quản lý danh sách (List Users)**: Có phân trang, hỗ trợ tìm kiếm bằng Name/Email và Lọc (Filter) theo Role/Status.
- **Thay đổi quyền (Role)**: Admin có thể cấp quyền Manager, Employee. Khi quyền thay đổi, các phiên đăng nhập (`UserSessions`) của user đó bị hủy để áp dụng quyền mới ở lần đăng nhập tiếp theo.
- **Khóa tài khoản (Block/Unblock)**: Admin khóa user vi phạm. Lập tức mọi phiên đăng nhập của User bị hủy, Middleware `auth.middleware.js` sẽ chặn và trả về lỗi `401 Unauthorized` ngay trong phiên làm việc tiếp theo.

## Các tệp chính đã được cập nhật:
- [auth.middleware.js](file:///d:/HK6/CNPM_NEW/DoAn/DO-AN-MTSE/backend/src/middlewares/auth.middleware.js): Cập nhật kiểm tra trực tiếp Session từ MongoDB.
- [authService.js](file:///d:/HK6/CNPM_NEW/DoAn/DO-AN-MTSE/backend/src/services/authService.js) & [authController.js](file:///d:/HK6/CNPM_NEW/DoAn/DO-AN-MTSE/backend/src/controllers/authController.js): Chứa toàn bộ Logic đăng nhập, đăng ký, quên mật khẩu và Google OAuth2.
- [profileService.js](file:///d:/HK6/CNPM_NEW/DoAn/DO-AN-MTSE/backend/src/services/profileService.js) & [profileController.js](file:///d:/HK6/CNPM_NEW/DoAn/DO-AN-MTSE/backend/src/controllers/profileController.js): Chứa logic sửa thông tin người dùng và Avatar.
- [adminService.js](file:///d:/HK6/CNPM_NEW/DoAn/DO-AN-MTSE/backend/src/services/adminService.js) & [adminController.js](file:///d:/HK6/CNPM_NEW/DoAn/DO-AN-MTSE/backend/src/controllers/adminController.js): Cung cấp API quản lý danh sách người dùng cho Ban quản trị.
