I. CÁC CHỨC NĂNG THUỘC VAI TRÒ: ADMIN
1. Dashboard + Thống kê (Doanh thu & Vận hành)
Dashboard hiển thị dạng thống kê: Số user, Số đề thi, Tỉ lệ hoàn thành, Doanh thu hệ thống, Tương tác học tập.
Luồng xử lý:
Admin vào trang Dashboard chính -> Frontend gửi Request đồng thời đến API GET /api/v1/admin/statistics.
Tại Backend & DB:
Số user: Chạy lệnh SELECT COUNT(id) FROM users WHERE role_id = 'User'.
Số đề thi: SELECT COUNT(id) FROM exams WHERE is_deleted = false.
Doanh thu: Tính tổng SUM(amount) của các hóa đơn có trạng thái SUCCESS trong bảng giao dịch.
Tỉ lệ hoàn thành: Tính toán từ bảng lịch sử làm bài của học viên (user_exam_attempts) dựa trên số bài đã nộp/số bài bấm bắt đầu làm.
Backend trả về một object JSON chứa toàn bộ các con số trên. Frontend nhận dữ liệu và hiển thị lên các widget/biểu đồ tương ứng.
2. Quản lý tài khoản (Bổ nhiệm & Khóa tài khoản)
Luồng Bổ nhiệm (Phân quyền):
Admin vào menu Quản lý tài khoản, tìm kiếm user bằng thanh Filter -> Chọn một tài khoản -> Bấm "Thay đổi vai trò".
Admin chọn Role từ Dropdown (Manager, Employee, User) -> Bấm Xác nhận.
Frontend gọi API PATCH /api/v1/admin/users/:id/role. Backend cập nhật cột role trong DB.
Xử lý chống xung đột phiên: Hệ thống gửi lệnh đến Redis để xóa Session/Token hiện tại của tài khoản đó. Trong lần click tiếp theo của người được bổ nhiệm, hệ thống sẽ bắt buộc họ đăng nhập lại để cập nhật giao diện Dashboard mới.
Luồng Khóa tài khoản:
Admin bấm nút "Khóa" trên dòng của tài khoản vi phạm -> Nhập lý do -> Gửi API PATCH /api/v1/admin/users/:id/block.
DB cập nhật trạng thái thành is_active = false.
Tầng Middleware kiểm tra Token (JWT) sẽ ngay lập tức chặn tài khoản này ở mọi API tiếp theo, đồng thời tự động Logout tài khoản đó ra khỏi thiết bị của họ.
3. Quản lý giao dịch (Đối soát dòng tiền từ ví điện tử)
Luồng xử lý:
Khi User (Thường/Premium) thanh toán qua ví điện tử thành công, ví điện tử tự động gọi API Webhook của hệ thống -> Hệ thống tự động insert một dòng vào bảng transactions trạng thái SUCCESS (Mở khóa sản phẩm tự động cho User).
Admin vào menu Quản lý giao dịch -> Hệ thống gọi API GET /api/v1/admin/transactions kèm phân trang để hiển thị danh sách hóa đơn lịch sử.
Quy tắc an toàn dữ liệu: Chức năng này chỉ cho phép Xem, Tìm kiếm theo mã giao dịch/email và Lọc theo trạng thái (đã thanh toán/ chưa thanh toán). Không thiết kế nút Sửa số tiền hay nút Hủy/Xóa đơn hàng để đảm bảo đúng yêu cầu "Không cho phép hủy đơn hàng" và tránh lệch số liệu kế toán.
4. Quản lý mã giảm giá (CRUD) (Admin + Manager)
Mục tiêu
Cho phép Admin/Manager tạo, chỉnh sửa, kích hoạt hoặc vô hiệu hóa các mã giảm giá để phục vụ chiến dịch khuyến mãi, tăng doanh thu và thu hút người dùng mua đề thi, bộ từ vựng hoặc gói Premium.
4.1. Tạo mã giảm giá (Create Coupon)
Bước 1: Tạo thông tin mã
Admin/Manager vào menu Quản lý mã giảm giá → Bấm "Tạo mã mới"
Nhập các thông tin:
Trường
Mô tả
Mã giảm giá
TOEIC50
Tên chương trình
Khuyến mãi hè 2026
Loại giảm giá
Phần trăm (%) hoặc Số tiền cố định
Giá trị giảm
50% hoặc 50.000 VNĐ
Giá trị đơn hàng tối thiểu
Ví dụ: 100.000 VNĐ
Giảm tối đa
Ví dụ: 200.000 VNĐ
Ngày bắt đầu
01/07/2026
Ngày kết thúc
31/07/2026
Số lượt sử dụng tối đa
500
Giới hạn mỗi người dùng
1 lần
Trạng thái
ACTIVE / INACTIVE

Bước 2: Chọn phạm vi áp dụng
Admin chọn:
Toàn hệ thống
Chỉ áp dụng cho đề thi
Chỉ áp dụng cho bộ từ vựng
Chỉ áp dụng cho Premium
Chỉ áp dụng cho năm đề thi cụ thể
Ví dụ:
TOEIC50 chỉ áp dụng cho đề thi năm 2026
PREMIUM30 chỉ áp dụng cho gói Premium
Bước 3: Lưu dữ liệu
Frontend gọi:
POST /api/v1/admin/coupons
Backend kiểm tra:
Mã không được trùng
Ngày kết thúc > ngày bắt đầu
Giá trị giảm hợp lệ
Số lượng sử dụng > 0
Sau đó insert vào bảng:
coupons
4.2. Sử dụng mã giảm giá khi thanh toán
Luồng xử lý
User chọn:
Đề thi
Bộ từ vựng
Gói Premium
↓
Nhập mã giảm giá
↓
Frontend gọi:
POST /api/v1/coupons/validate
Body:
{
  "coupon_code":"TOEIC50",
  "product_id":15
}
Backend kiểm tra:
Điều kiện hợp lệ
Mã tồn tại
Đang ACTIVE
Chưa hết hạn
Chưa vượt số lượt sử dụng
User chưa dùng vượt giới hạn
Sản phẩm nằm trong phạm vi áp dụng
Nếu hợp lệ:
{
  "valid": true,
  "discount": 50000,
  "final_price": 99000
}
Frontend hiển thị giá mới realtime.
4.3. Thanh toán thành công
Khi ví điện tử gửi Webhook SUCCESS:
Hệ thống thực hiện Transaction:
Bước 1
Lưu giao dịch
INSERT INTO transactions
Bước 2
Ghi nhận lịch sử sử dụng coupon
INSERT INTO coupon_usages
(
   coupon_id,
   user_id,
   transaction_id,
   used_at
)
Bước 3
Tăng số lượt sử dụng
UPDATE coupons
SET used_count = used_count + 1
Toàn bộ được thực hiện trong cùng một Database Transaction để tránh gian lận hoặc mất đồng bộ dữ liệu.
4.4. Chỉnh sửa mã giảm giá (Update Coupon)
Luồng xử lý
Admin/Manager chọn mã giảm giá
↓
Sửa:
Giá trị giảm
Thời gian áp dụng
Số lượng phát hành
Trạng thái
↓
Bấm "Cập nhật"
Frontend gọi:
PUT /api/v1/admin/coupons/:id
Backend cập nhật Database.
Quy tắc an toàn
Nếu mã đã được sử dụng:
Không cho phép sửa:
Loại giảm giá
Mã coupon
Chỉ cho phép sửa:
Thời gian
Trạng thái
Giới hạn sử dụng
để tránh sai lệch dữ liệu giao dịch.
4.5. Vô hiệu hóa mã giảm giá
Luồng xử lý
Admin/Manager bấm:
Vô hiệu hóa
Frontend gọi:
PATCH /api/v1/admin/coupons/:id/deactivate
Backend cập nhật:
status = 'INACTIVE'
Kết quả:
Người đã dùng trước đó vẫn giữ quyền lợi
Người dùng mới không thể áp dụng mã
4.6. Thống kê mã giảm giá
Admin/Manager vào Dashboard → Thống kê Coupon
Hiển thị:
Thông tin
Ý nghĩa
Tổng số mã giảm giá
Đã tạo
Mã đang hoạt động
ACTIVE
Mã hết hạn
EXPIRED
Tổng lượt sử dụng
Số lần dùng
Doanh thu được giảm
Tổng tiền khuyến mãi
Top Coupon
Mã được sử dụng nhiều nhất

Backend:
GET /api/v1/admin/coupons/statistics

II. CÁC CHỨC NĂNG THUỘC VAI TRÒ: MANAGER
1. Dashboard + Thống kê (Doanh thu & Vận hành)
Luồng xử lý: Giống hệt luồng Thống kê của Admin 
2. Quản lý đề thi (CRUD) (Manager+admin)
Luồng Thêm mới đề thi (Create)
Bước 1: Nhập liệu trên UI
Admin/Manager nhập: Tên đề thi, Chọn năm phát hành (2022, 2023, 2026...).
Cấu hình Giá tiền: Nhập giá bình thường cho tất cả các năm (Ví dụ: Đề 2022 nhập giá trọn gói 99.000đ; Đề 2026 nhập giá trọn gói 150.000đ). Hệ thống có 3 ô nhập giá: Giá trọn gói (price_full), Giá lẻ phần Nghe (price_listening), Giá lẻ phần Đọc (price_reading).
Bước 2: Tải học liệu
Upload file đề (.pdf) và các file âm thanh (.mp3) cho phần Listening.
Backend đẩy dữ liệu media lên Cloud Storage (S3/Cloudinary) để lấy các đường link media_url.
Bước 3: Lưu Database
Hệ thống giữ nguyên mức giá Admin nhập, kiểm tra tính hợp lệ (không để trống các trường bắt buộc).
Tiến hành một DB Transaction để insert dữ liệu đồng thời vào bảng exams (thông tin chung, giá) và bảng questions (chi tiết câu hỏi, đáp án đúng, lời giải thích).
Luồng Chỉnh sửa đề thi (Update)
Admin/Manager sửa lại tên bộ đề hoặc điều chỉnh tăng/giảm giá tiền của các bộ đề.
Bấm "Cập nhật" -> Hệ thống gọi API PUT /api/v1/manager/exams/:id.
Xử lý hệ thống: Backend cập nhật vào Database, đồng thời Xóa Cache (Clear Cache) của đề thi đó trên Redis để phía User lập tức thấy nội dung hoặc mức giá mới cập nhật realtime.
Luồng Xóa đề thi (Delete) - Tránh xung đột tuyệt đối với User
Admin/Manager bấm nút Xóa một bộ đề trên Dashboard.
Backend chạy ngầm lệnh kiểm tra: Quét bảng hóa đơn SELECT COUNT(*) FROM user_purchases WHERE item_id = :id AND item_type = 'EXAM_SET'.
Phân nhánh kết quả:
Trường hợp COUNT = 0 (Chưa ai mua đề này): Thực hiện Xóa cứng (Hard Delete) hoàn toàn dữ liệu của đề này trong DB để sạch hệ thống.
Trường hợp COUNT > 0 (Đã có User Thường mua lẻ đề này): Hệ thống tự động thực hiện Xóa mềm (Soft Delete) bằng cách cập nhật trường is_visible = false. Đề thi ẩn khỏi trang chủ/tìm kiếm (Premium và User chưa mua không thấy nữa). Nhưng những User cũ đã mua vẫn vào làm và xem đáp án bình thường từ mục "Lịch sử mua hàng" của họ.
3. Quản lý từ vựng (CRUD) (Manager + Admin)
Mục tiêu
Cho phép Manager/Admin tạo, cập nhật, quản lý và phân phối các bộ từ vựng TOEIC cho người dùng. Các bộ từ vựng có thể được bán riêng lẻ hoặc là quyền lợi đi kèm của gói Premium.
Luồng Thêm mới bộ từ vựng (Create)
Bước 1: Tạo bộ từ vựng
Manager/Admin vào menu Quản lý từ vựng → Bấm "Thêm bộ từ vựng"
Nhập các thông tin:
Tên bộ từ vựng (Ví dụ: TOEIC 500, TOEIC 750, TOEIC 900)
Mô tả bộ từ vựng
Hình ảnh minh họa (Thumbnail)
Giá bán
Quyền truy cập:
Miễn phí
Mua riêng lẻ
Premium
Bước 2: Thêm danh sách từ vựng
Manager/Admin thêm các từ vựng thuộc bộ:
Từ vựng
Phiên âm
Loại từ
Nghĩa tiếng Việt
Ví dụ
Dịch nghĩa ví dụ
File âm thanh phát âm
Hình ảnh minh họa (nếu có)
Bước 3: Lưu dữ liệu
Frontend gọi:
POST /api/v1/manager/vocabulary-sets
Backend thực hiện Database Transaction:
Insert thông tin bộ từ vựng vào bảng vocabulary_sets
Insert toàn bộ từ vựng chi tiết vào bảng vocabularies
Nếu xảy ra lỗi ở bất kỳ bước nào, Transaction sẽ Rollback để tránh dữ liệu không đồng bộ.
Luồng Chỉnh sửa bộ từ vựng (Update)
Manager/Admin chọn bộ từ vựng cần sửa.
Có thể cập nhật:
Tên bộ từ vựng
Mô tả
Giá bán
Quyền truy cập
Thêm từ mới
Chỉnh sửa nghĩa hoặc ví dụ
Cập nhật audio
Frontend gọi:
PUT /api/v1/manager/vocabulary-sets/:id
Backend cập nhật Database và xóa Cache Redis của bộ từ vựng để User thấy dữ liệu mới ngay lập tức.
Luồng Xóa bộ từ vựng (Delete)
Để tránh ảnh hưởng đến người dùng đã mua:
Backend kiểm tra:
SELECT COUNT(*)
FROM user_purchases
WHERE item_type = 'VOCABULARY_SET'
AND item_id = :id;
Trường hợp 1: Chưa có ai mua
COUNT = 0
Hệ thống thực hiện:
Hard Delete bộ từ vựng
Hard Delete toàn bộ từ thuộc bộ đó
Trường hợp 2: Đã có người mua
COUNT > 0
Hệ thống thực hiện:
UPDATE vocabulary_sets
SET is_visible = false
(Soft Delete)
Kết quả:
Không hiển thị với người dùng mới
Người đã mua trước đó vẫn tiếp tục học bình thường
Không làm mất dữ liệu lịch sử học tập
Luồng User sử dụng bộ từ vựng
User thường
Khi truy cập bộ từ vựng:
Hệ thống kiểm tra:
user_purchases
Nếu đã mua:
Cho phép truy cập
Nếu chưa mua:
Hiển thị màn hình thanh toán
User Premium
Middleware kiểm tra:
subscription_status = ACTIVE
Nếu gói Premium còn hiệu lực:
Cho phép truy cập tất cả bộ từ vựng Premium
không cần mua riêng lẻ.
Luồng Ôn tập từ vựng cá nhân
Khi User chọn:
Thêm vào danh sách học tập
Hệ thống không sửa dữ liệu gốc trong bảng:
vocabularies
mà tạo bản ghi riêng trong:
user_vocabularies
gồm:
user_id
vocabulary_id
trạng thái học
số lần ôn tập
mức độ ghi nhớ
ngày học gần nhất
Điều này giúp:
Mỗi User có tiến trình học riêng
Không làm thay đổi dữ liệu chuẩn do Manager quản lý
Hỗ trợ Flashcard, Spaced Repetition, Quiz sau này

III. CÁC CHỨC NĂNG THUỘC VAI TRÒ: EMPLOYEE
1. Dashboard + Thống kê
Luồng xử lý: Employee vào Dashboard -> Hệ thống gọi API hiển thị dữ liệu về Tương tác học tập (Số giờ học trung bình của học viên, số lượt bình luận bài viết/đề thi mới cần phản hồi) và hiển thị bảng doanh thu để phục vụ công tác chăm sóc, tư vấn khách hàng.
2. Chăm sóc khách hàng (Realtime Chat hỗ trợ)
Đây là tính năng độc quyền của Employee cần làm cực kỳ kỹ bằng Websocket để tránh 2 nhân viên cùng chat với 1 khách.
Luồng xử lý:
Khi Guest (Khách vãng lai) hoặc User nhấn nút Chat ở màn hình của họ -> Hệ thống tạo một Room Chat và đẩy vào "Hàng đợi phòng chờ" (Queue) của hệ thống.
Tại Dashboard của tất cả các Employee đang Online, màn hình Chat sẽ hiển thị thông báo có Khách hàng mới đang đợi.
Một Employee bấm nút "Chấp nhận hỗ trợ" -> Backend lập tức chạy lệnh: Cập nhật assigned_to = :employee_id và đổi trạng thái Room sang ACTIVE. Đồng thời bắn tín hiệu Websocket đến toàn bộ Employee khác để ẩn phòng chat này khỏi màn hình của họ.
Hệ thống hiển thị thông tin kèm Tag nhãn của Khách ở góc màn hình chat để Employee biết đường tư vấn:
GUEST: Chưa có tài khoản -> Gửi link hướng dẫn đăng ký nhận OTP qua mail.
USER THƯỜNG: Hệ thống hiển thị luôn danh sách đề thi/bộ từ vựng họ đã mua lẻ -> Tiện hỗ trợ lỗi kỹ thuật hoặc tư vấn nâng cấp lên gói Premium.
PREMIUM: User VIP -> Hỗ trợ ưu tiên hàng đầu.
IV. CHỨC NĂNG CHUNG CỦA CẢ 3 VAI TRÒ (ADMIN, MANAGER, EMPLOYEE ĐỀU CÓ)
1. Quản lý bài viết (Blog, Tin tức)
Để cả 3 Role cùng làm việc trên 1 danh sách mà không bị xung đột, hệ thống áp dụng cơ chế phân cấp trạng thái bài viết ( PENDING):
Luồng của Employee/ Admin / Manager (Cộng tác viên nội dung):
Employee /Admin / Manager viết bài mới (Nhập tiêu đề, nội dung, danh mục, thumbnail) -> Ấn nút "Gửi duyệt".
API lưu bài viết vào bảng posts với trạng thái bắt buộc là PENDING. Bài viết này chưa xuất hiện ngoài trang chủ của Guest/User.
Luồng của Admin (Người duyệt):
Admin vào mục Quản lý bài viết, lọc danh sách bài viết có trạng thái PENDING.
Xem nội dung -> Bấm nút "Phê duyệt" -> API cập nhật trạng thái bài viết thành đã duyệt.
Lúc này, bài viết chính thức hiển thị ngoài trang chủ, tin tức cho Guest và User xem.
2. Quản lý bình luận (Đề thi & Bài viết)
Luồng xử lý phản hồi và kiểm duyệt:
Khi User viết bình luận ở Đề thi hoặc Bài viết -> Hệ thống lưu vào bảng comments và tự động đẩy thông báo Realtime (Websocket) về trang Dashboard Quản lý bình luận của Admin/Manager/Employee.
Cả 3 Role đều có thể bấm nút "Trả lời" (Reply) -> Nội dung trả lời được lưu vào DB và hiển thị ở phía User dưới nhãn tên là "Ban Quản Trị". Admin sẽ thấy được acc của người rep.
Nếu phát hiện bình luận spam, thô tục: Admin/Manager/Employee bấm nút "Ẩn bình luận" -> API cập nhật trạng thái status = 'HIDDEN' trong DB. Frontend phía User sẽ dùng bộ lọc WHERE status != 'HIDDEN' nên bình luận đó lập tức biến mất khỏi giao diện của học viên mà không cần xóa cứng dữ liệu.
 

