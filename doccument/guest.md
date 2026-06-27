UC1. Xem trang chủ (Dành cho Guest)
Mục đích: Hiển thị nội dung nổi bật, sản phẩm bán chạy để thu hút khách vãng lai đăng ký học.
Luồng hoạt động chính:
Guest truy cập vào địa chỉ website hệ thống.
Hệ thống tải dữ liệu trang chủ công khai (không cần token đăng nhập).
Hệ thống hiển thị theo thứ tự cấu trúc:
Banner chương trình khuyến mãi hiện hành.
Danh sách sản phẩm mới nhất.
Danh sách 10 sản phẩm (đề thi, bộ từ vựng) bán chạy nhất (Phân trang theo chiều ngang của trang - UI/API).
Danh sách 10 sản phẩm xem nhiều nhất (Phân trang theo chiều ngang của trang - UI/API).
Danh sách các bài viết (blog) chia sẻ kiến thức mới nhất.
Danh sách các tin tức mới nhất.
Guest có thể cuộn trang để xem hoặc click vào nút "Đăng ký ngay" trên thanh điều hướng (Navbar).
UC2. Tìm kiếm và lọc dữ liệu (Dành cho Guest)
Mục đích: Cho phép Guest tìm kiếm thông tin về đề thi, từ vựng hoặc bài viết trên hệ thống với nhiều điều kiện lọc công khai.
Luồng hoạt động chính:
Tại thanh tìm kiếm, Guest nhập từ khóa cần tra cứu.
Guest có thể chọn thêm các điều kiện lọc nâng cao công khai (Ví dụ: lọc theo danh mục đề thi năm cũ 2022-2023, lọc theo số sao đánh giá, lọc theo giá tiền).
Hệ thống xử lý yêu cầu và trả về kết quả hiển thị tương ứng.
Ràng buộc UI/API: Đối với chức năng hiển thị tất cả sản phẩm theo từng danh mục, hệ thống sử dụng Lazy loading để tự động load tiếp sản phẩm khi Guest kéo xuống cuối trang.
Guest click vào một sản phẩm hoặc bài viết cụ thể trong danh sách kết quả để xem chi tiết.
UC3. Xem thông tin cơ bản của đề thi / bộ từ vựng (Dành cho Guest)
Mục đích: Giúp Guest xem các thông tin tổng quan, số lượng học viên và đánh giá để kích thích nhu cầu mua/học.
Luồng hoạt động chính:
Guest chọn một đề thi hoặc một chủ đề từ vựng từ trang chủ hoặc trang tìm kiếm.
Hệ thống hiển thị các thông tin cơ bản của sản phẩm bao gồm:
Tên đề thi / tên bộ từ vựng, thuộc danh mục nào.
Mô tả tổng quan sản phẩm.
Giá bán chính thức.
Số lượng học viên đã mua thành công, số lượng khách đã bình luận.
Số sao đánh giá trung bình và danh sách các đánh giá (số sao + nội dung nhận xét) từ các học viên cũ.
Danh sách đề thi tương tự.
Hệ thống hiển thị danh sách tiêu đề mà không cho phép bấm vào làm bài.
Nếu Guest bấm vào nút "Làm bài thử", "Xem đáp án", "Mua ngay" hoặc thanh nhập "Bình luận":
Hệ thống sẽ chặn hành động và hiển thị một Pop-up thông báo: "Vui lòng đăng ký hoặc đăng nhập tài khoản để sử dụng chức năng này!".
UC4. Xem bài viết và tin tức (Dành cho Guest)
Mục đích: Cho phép Guest đọc các bài viết chia sẻ kiến thức, tin tức công khai trên hệ thống.
Luồng hoạt động chính:
Guest truy cập vào mục "Bài viết" hoặc "Tin tức" từ menu thanh điều hướng.
Hệ thống hiển thị danh sách bài viết / tin tức (Sử dụng phân trang hoặc Lazy loading).
Guest click chọn một bài viết hoặc tin tức cụ thể để đọc chi tiết.
Hệ thống hiển thị toàn bộ nội dung chi tiết bài viết, thông tin tác giả, ngày đăng và danh sách các bình luận bên dưới.
Ràng buộc nghiệp vụ: Khu vực viết bình luận của Guest sẽ bị khóa. Hệ thống hiển thị dòng chữ ghi chú: "Bạn phải đăng nhập để viết bình luận cho bài viết này".
UC5. Chuyển đổi từ Guest thành User (Đăng ký tài khoản)
Mục đích: Đăng ký tài khoản trực tiếp khi đang duyệt xem hệ thống.
Luồng hoạt động chính:
Tại bất kỳ trang nào (Trang chủ, Chi tiết đề thi, Bài viết...), Guest bấm vào nút Đăng ký trên thanh điều hướng 
Hệ thống chuyển hướng Guest sang giao diện Form Đăng ký tài khoản.
Guest thực hiện các bước nhập thông tin cá nhân và xác thực mã OTP gửi qua Email (Luồng hoạt động tiếp theo diễn ra như UC. Đăng ký tài khoản).
Sau khi kích hoạt tài khoản thành công, vai trò của người dùng được chuyển từ Guest sang User (Tài khoản Thường).




BẢNG DB CHO USER & GUEST

I. Nhóm Bảng Hệ Thống, Tài Khoản & Phân Quyền
1. Bảng Users (Quản lý tài khoản người dùng)
Lưu trữ thông tin định danh và phân cấp tài khoản khi Guest đăng ký thành User.
id (INT, Primary Key, Auto Increment): ID định danh tài khoản.
full_name (VARCHAR): Họ và tên.
email (VARCHAR, Unique): Địa chỉ email đăng ký.
password_hash (VARCHAR): Mật khẩu đã được mã hóa bảo mật.
role (ENUM): Vai trò tài khoản ('Admin', 'Manager', 'Employee', 'User').
account_type (ENUM): Phân hạng tài khoản học viên ('Thường', 'Premium').
status (ENUM): Trạng thái tài khoản ('Chưa kích hoạt', 'Đang hoạt động', 'Bị khóa').
premium_expires_at (DATETIME, Nullable): Thời hạn kết thúc gói Premium (nếu có).
accumulated_points (INT, Default 0): Điểm tích lũy nhận được từ các hoạt động hệ thống.
avatar_url (VARCHAR, Nullable): Đường dẫn ảnh đại diện.
created_at (TIMESTAMP): Thời gian tạo tài khoản.
2. Bảng User_Sessions (Kiểm soát đăng nhập một thiết bị)
Phục vụ ràng buộc: Một tài khoản tại một thời điểm chỉ được học trên một thiết bị (Bảo vệ bản quyền kho tài liệu).
id (INT, Primary Key, Auto Increment)
user_id (INT, Foreign Key nối với bảng Users): ID tài khoản học viên.
device_identifier (VARCHAR): Mã định danh thiết bị/Trình duyệt đang sử dụng.
token (VARCHAR): Mã phiên đăng nhập hiện tại.
last_active_at (DATETIME): Thời gian tương tác cuối cùng để tính toán phiên còn hiệu lực.
3. Bảng OTP_Verifications (Xác thực đăng ký và Quên mật khẩu)
Quản lý mã OTP gửi qua Email cho các luồng kích hoạt tài khoản hoặc khôi phục mật khẩu.
id (INT, Primary Key, Auto Increment)
email (VARCHAR): Email nhận OTP.
otp_code (VARCHAR): Mã OTP được sinh tự động.
type (ENUM): Loại xác thực ('Đăng ký', 'Quên mật khẩu', 'Xác thực thiết bị').
expires_at (DATETIME): Thời gian OTP hết hiệu lực.
is_used (BOOLEAN, Default FALSE): Trạng thái đã sử dụng.
II. Nhóm Bảng Nội Dung Học Tập & Kho Câu Hỏi (Dữ liệu chung cho cả User và Guest)
4. Bảng Exam_Papers (Quản lý đề thi TOEIC)
Lưu thông tin tổng quan của các bộ đề thi để phân chia quyền xem theo năm.
id (INT, Primary Key, Auto Increment)
title (VARCHAR): Tên bộ đề thi.
year (INT): Năm phát hành đề thi (Ví dụ: 2022, 2023, 2026...).
difficulty_level (ENUM): Độ khó ('Dễ', 'Trung bình', 'Khó').
price (DECIMAL): Giá bán lẻ của đề thi.
is_free (BOOLEAN): Xác định đề thi miễn phí hay phải mua lẻ.
view_count (INT, Default 0): Tổng lượt xem (Dùng để hiển thị Top "Xem nhiều nhất" ở Trang chủ).
purchase_count (INT, Default 0): Tổng lượt mua thành công (Dùng để hiển thị Top "Bán chạy nhất" ở Trang chủ).
5. Bảng Questions (Chi tiết ngân hàng câu hỏi của đề thi)
Lưu nội dung chi tiết từng câu hỏi phục vụ tính năng luyện đề, luyện tập theo phần và lời giải chi tiết.
id (INT, Primary Key, Auto Increment)
exam_id (INT, Foreign Key nối với bảng Exam_Papers): Thuộc đề thi nào.
part (INT): Thuộc phần nào trong bài thi TOEIC (Từ Part 1 đến Part 7).
question_number (INT): Số thứ tự của câu hỏi trong đề.
audio_url (VARCHAR, Nullable): Đường dẫn file âm thanh (Cho các câu hỏi thuộc Listening Part 1, 2, 3, 4).
image_url (VARCHAR, Nullable): Đường dẫn hình ảnh minh họa (Cho Part 1 hoặc các câu Reading có bảng biểu).
passage (TEXT, Nullable): Đoạn văn đọc hiểu (Cho các câu hỏi nhóm Part 6, Part 7).
question_text (TEXT): Nội dung câu hỏi cụ thể.
option_a (VARCHAR): Đáp án lựa chọn A.
option_b (VARCHAR): Đáp án lựa chọn B.
option_c (VARCHAR): Đáp án lựa chọn C.
option_d (VARCHAR): Đáp án lựa chọn D.
correct_option (CHAR(1)): Đáp án chính xác ('A', 'B', 'C', 'D').
explanation (TEXT): Bài giải thích chi tiết đáp án.
6. Bảng Vocabulary_Sets (Quản lý các bộ từ vựng)
id (INT, Primary Key, Auto Increment)
title (VARCHAR): Tên bộ từ vựng (Ví dụ: Từ vựng TOEIC Kinh tế, TOEIC Công sở).
description (TEXT): Mô tả ngắn gọn về bộ từ vựng.
price (DECIMAL): Giá bán bộ từ vựng.
7. Bảng Vocabularies (Chi tiết các từ vựng thuộc bộ)
id (INT, Primary Key, Auto Increment)
vocab_set_id (INT, Foreign Key nối với bảng Vocabulary_Sets): Thuộc bộ từ vựng tổng nào.
word (VARCHAR): Từ vựng.
meaning (TEXT): Nghĩa của từ.
phonetic (VARCHAR): Phiên âm quốc tế.
example (TEXT): Câu ví dụ minh họa ngữ cảnh.
8. Bảng Articles_News (Quản lý bài viết và tin tức chia sẻ)
Dữ liệu để User và Guest vào đọc trên hệ thống.
id (INT, Primary Key, Auto Increment)
title (VARCHAR): Tiêu đề bài đăng.
content (LONGTEXT): Nội dung chi tiết bài viết (Hỗ trợ định dạng văn bản phong phú).
type (ENUM): Phân loại bài đăng ('Bài viết', 'Tin tức').
author_name (VARCHAR): Tên người biên soạn/đăng bài.
created_at (TIMESTAMP): Thời gian xuất bản bài đăng.
III. Nhóm Bảng Thương Mại Điện Tử & Khuyến Mãi (Thanh toán, Mã giảm giá)
9. Bảng Orders (Quản lý đơn hàng)
Lưu lại lịch sử mua sắm. Ràng buộc: Bắt buộc thanh toán qua ví điện tử và không được phép hủy đơn.
id (INT, Primary Key, Auto Increment)
order_code (VARCHAR, Unique): Mã đơn hàng phục vụ đối soát kết quả.
user_id (INT, Foreign Key nối với bảng Users): Người thực hiện mua sắm.
total_amount (DECIMAL): Tổng số tiền thanh toán thực tế cuối cùng.
payment_method (VARCHAR, Default 'Ví điện tử'): Phương thức thanh toán.
payment_status (ENUM): Trạng thái thanh toán giao dịch ('Thành công', 'Thất bại').
discount_code_used (VARCHAR, Nullable): Mã giảm giá đã áp dụng cho đơn hàng này.
created_at (TIMESTAMP): Ngày giờ phát sinh giao dịch mua hàng.
10. Bảng Order_Details (Chi tiết sản phẩm trong đơn hàng)
id (INT, Primary Key, Auto Increment)
order_id (INT, Foreign Key nối với bảng Orders): Thuộc hóa đơn mua hàng nào.
product_type (ENUM): Phân loại mặt hàng ('Đề thi', 'Bộ từ vựng', 'Gói Premium', 'Phần Nghe', 'Phần Đọc').
product_id (INT): ID của sản phẩm tương ứng (ID của đề thi, ID của bộ từ vựng hoặc ID gói).
price (DECIMAL): Giá tiền gốc của sản phẩm tại thời điểm mua.
11. Bảng Discount_Codes (Quản lý mã giảm giá tích lũy)
Lưu kho voucher tích lũy sinh ra khi học viên đánh giá sao chất lượng đề thi.
id (INT, Primary Key, Auto Increment)
user_id (INT, Foreign Key nối với bảng Users): Học viên sở hữu mã giảm giá.
code (VARCHAR, Unique): Chuỗi mã giảm giá sinh ngẫu nhiên (Ví dụ: ACCUMULATE123).
discount_value (DECIMAL): Số tiền được giảm giá khi áp dụng đơn hàng.
expires_at (DATETIME): Thời hạn sử dụng của mã giảm giá.
status (ENUM): Trạng thái voucher ('Chưa dùng', 'Đã dùng', 'Hết hạn').
12. Bảng User_Purchased_Parts (Quản lý quyền truy cập mua lẻ theo phần của tài khoản Thường)
Giúp hệ thống ghi nhận và mở khóa quyền truy cập khi tài khoản Thường mua lẻ riêng biệt phần Listening hoặc Reading của một đề thi mới.
id (INT, Primary Key, Auto Increment)
user_id (INT, Foreign Key nối với bảng Users)
exam_id (INT, Foreign Key nối với bảng Exam_Papers)
skill_type (ENUM): Kỹ năng được mở khóa ('Listening', 'Reading').
purchased_at (TIMESTAMP): Ngày mở khóa.
IV. Nhóm Bảng Tiến Độ Học Tập & Tương Tác (Chỉ dành cho User và Nhật ký Guest)
13. Bảng Exam_Results (Kết quả làm bài và Thống kê chi tiết Accuracy)
Lưu lại dữ liệu chi tiết của từng lượt làm bài để làm cơ sở tính toán hiển thị màn hình Thống kê tiến độ.
id (INT, Primary Key, Auto Increment)
user_id (INT, Foreign Key nối với bảng Users): Học viên làm bài.
exam_id (INT, Foreign Key nối với bảng Exam_Papers): Đề thi được chọn làm.
total_score (INT): Tổng số điểm thi đạt được.
correct_answers (INT): Tổng số lượng câu trả lời đúng.
wrong_answers (INT): Tổng số lượng câu trả lời sai.
duration_seconds (INT): Thời gian làm bài thực tế tính bằng giây (Dùng để cộng dồn tính ra tổng số giờ học).
selected_answers (JSON): Lưu toàn bộ lịch sử đáp án đã chọn để xem lại ở màn hình chi tiết kết quả (Ví dụ: {"1": "A", "2": "B", "3": "C"}).
accuracy_by_parts (JSON): Tỷ lệ % chính xác của từng part để hệ thống phân tích kỹ năng yếu (Ví dụ: {"part1": 90, "part2": 45, ..., "part7": 30}).
created_at (TIMESTAMP): Ngày giờ nộp bài thành công.
14. Bảng Bookmarked_Questions (Đánh dấu câu hỏi khó)
id (INT, Primary Key, Auto Increment)
user_id (INT, Foreign Key nối với bảng Users)
result_id (INT, Foreign Key nối với bảng Exam_Results): Thuộc lượt làm bài thi nào.
question_id (INT, Foreign Key nối với bảng Questions): ID câu hỏi được đánh dấu khó để ôn tập lại.
15. Bảng User_Learning_Goals (Thiết lập mục tiêu học tập)
id (INT, Primary Key, Auto Increment)
user_id (INT, Foreign Key nối với bảng Users)
target_score (INT): Điểm thi TOEIC mục tiêu hướng đến.
target_exams_count (INT): Số lượng đề thi cần hoàn thành.
target_vocab_count (INT): Số lượng từ vựng cần học thuộc.
start_date (DATE): Ngày bắt đầu kích hoạt đặt mục tiêu.
end_date (DATE): Ngày cam kết hoàn thành kế hoạch đã đặt.
16. Bảng User_Favorites (Quản lý đề thi yêu thích)
id (INT, Primary Key, Auto Increment)
user_id (INT, Foreign Key nối với bảng Users)
exam_id (INT, Foreign Key nối với bảng Exam_Papers): Đề thi đã lưu.
created_at (TIMESTAMP): Thời điểm bấm yêu thích.
17. Bảng Personal_Vocabularies (Sổ tay từ vựng cá nhân của học viên)
Lưu trữ các từ vựng do User tự tra cứu dịch thuật và chủ động thêm vào bộ sưu tập cá nhân.
id (INT, Primary Key, Auto Increment)
user_id (INT, Foreign Key nối với bảng Users)
word (VARCHAR): Từ vựng cần lưu.
meaning (TEXT): Nghĩa của từ.
phonetic (VARCHAR): Phiên âm của từ.
example (TEXT): Ví dụ thực tế tự điền.
note (TEXT): Ghi chú bổ sung.
18. Bảng Product_Reviews_Comments (Đánh giá sao và Bình luận tương tác)
Gộp chung và phân loại bình luận. Khi thực hiện truy vấn hiển thị, Backend sẽ check account_type của user_id hiện tại, nếu là Premium thì tự động đính kèm Badge (Huy hiệu) "Fan Cứng" ở Front-end.
id (INT, Primary Key, Auto Increment)
user_id (INT, Foreign Key nối với bảng Users): Người viết bình luận/đánh giá.
target_type (ENUM): Đối tượng tương tác ('Đề thi', 'Bài viết').
target_id (INT): ID tương ứng của Đề thi hoặc Bài viết được chọn.
rating_stars (INT, Nullable): Số sao đánh giá từ 1 đến 5 (Chỉ dùng cho đề thi, bài viết để NULL).
content (TEXT): Nội dung văn bản bình luận/nhận xét.
parent_id (INT, Nullable): ID bình luận gốc (Dùng cho cấu trúc Reply comment lồng nhau, giúp Employee có thể rep comment của khách hàng).
created_at (TIMESTAMP): Thời gian gửi bình luận.
19. Bảng Guest_Tracking_Logs (Ghi nhận lịch sử ẩn danh cho Guest)
Hỗ trợ cơ chế đếm lượt xem, tối ưu hóa bộ lọc lưu cache, và lưu danh sách "Sản phẩm đã xem gần đây" cho Guest thông qua ID ẩn danh lưu ở Cookie trình duyệt.
id (INT, Primary Key, Auto Increment)
session_guest_id (VARCHAR): Chuỗi mã định danh ẩn danh lưu tại LocalStorage/Cookie của Guest.
action_type (ENUM): Loại hành động thực hiện ('Xem đề thi', 'Xem bài viết', 'Tìm kiếm').
target_id (INT): ID của đề thi hoặc bài viết mà Guest vừa click vào.
created_at (TIMESTAMP): Thời gian thực hiện hành động.



