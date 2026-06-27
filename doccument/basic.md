Admin: CRUD đề thi, quản lý bài viết, quản lý tài khoản (bổ nhiệm, khóa tài khoản, ) thống kê (doanh thu, tương tác học tập), quản lý bình luận, quản lý giao dịch

Manager: CRUD đề thi, quản lý bài viết, , thống kê (doanh thu, tương tác học tập), quản lý bình luận,

Employee: chat chăm sóc khách hàng, xem thống kê (doanh thu, tương tác học tập), quản lý bình luận, 

User: đăng ký có OTP qua mail, đăng nhập, quên mật khẩu, thanh toán, lịch sử mua hàng, đánh giá khóa học, bình luận đề thi, profile, luyện bộ đề, luyện tập theo từng phần, đánh dấu câu hỏi khó, xem chi tiết kết quả, đặt mục tiêu, ôn tập từ vựng, phiên dịch từ vựng, xem thống kê tiến độ học tập, kết quả tìm kiếm, bài viết, tin tức, trang chủ, khóa học, chi tiết khóa học, đăng ký gói premium, bình luận bài viết, thêm từ vựng

Thường: coi đề của các năm cũ (2022, 2023) + dc làm + coi đáp án+ giải chi tiết, mua đề thi mới nhất + đáp án (mua từng test của một năm), mua từng phần (nghe – đọc), mua bộ từ vựng (kèm ôn tập của bộ đó)
Premium: mua trọn gói đề thi + đáp án (giá ưu đãi hơn), gợi ý lộ trình học tập, nhắc học, mua bộ từ vựng (kèm ôn tập của bộ đó), fan cứng

Guest: trang chủ, kết quả tìm kiếm, bài viết, tin tức, đăng ký

Thứ tự 
Dashboard: đề thi, khóa học, từ vựng, bài viết, tin tức, tài khoản, flashcard, tìm kiếm
Trang chủ, khuyến mãi, mới nhất, bán chạy nhất, xem nhiều nhất
số lượng học viên đã mua, sản phẩm tương tự, hiển thị thuộc danh mục tương ứng nào, đánh giá khóa học, số sao
tìm kiếm và lọc dữ liệu với nhiều điều kiện lọc.



Chức năng hiển thị tất cả sản phẩm theo từng danh mục sử dụng Lazy loading để load tiếp sản phẩm khi kéo xuống cuối trang (API và UI) hoặc sử dụng phân trang sản phẩm.
Chức năng hiển thị 10 sản phẩm bán chạy nhất, sản phẩm xem nhiều nhất có phân trang theo chiều ngang của trang (API và UI)



Thanh toán: phương thức bắt buộc thanh toán thông qua ví điện tử,. (k cho phép hủy đơn hàng)
Xem lại lịch sử mua hàng
(Note: Một tài khoàn tại một thời điểm chỉ được học trên một thiết bị)

Bình luận, đánh giá sản phẩm đã mua thành công, mỗi lần đánh giá sẽ tặng mã giảm giá tích lũy của mình cho lần mua sau (chỉ dùng 1 mã giảm giá, có thời hạn)
Đề yêu thích, đề thi tương tự, sản phẩm đã xem và đếm số khách mua, khách bình luận trên sản phẩm đó 



Thống kê
User: Điểm trung bình , Số bài đã làm , Kỹ năng yếu , Tiến độ học , Accuracy từng part, số giờ học
Admin: Số user , Số đề thi , Tỉ lệ hoàn thành 


Role: 
Admin
Dashboard
+ Thống kê
+Quản lý đề thi (CRUD)
+Quản lý từ vựng (CRUD)
+ Quản lý tài khoản
+ Quản lý bài viết (blog)
+ Quản lý bình luận
+ Quản lý giao dịch
Manager
Dashboard
+ Thống kê
+Quản lý đề thi (CRUD)
+Quản lý từ vựng (CRUD)
+ Quản lý bài viết (blog)
+ Quản lý bình luận

Employee
Dashboard
+ Thống kê
+ Quản lý bình luận
+ Quản lý bài viết (blog)
+ Chăm sóc khách hàng

User: Thường, Premium
Thường: coi đề của các năm cũ (2022, 2023) + dc làm + coi đáp án+ giải chi tiết, mua đề thi mới nhất + đáp án (mua từng test của một năm), mua từng phần (nghe – đọc), mua bộ từ vựng (kèm ôn tập của bộ đó)
Premium: mua trọn gói đề thi + đáp án (giá ưu đãi hơn), gợi ý lộ trình học tập, nhắc học, mua bộ từ vựng (kèm ôn tập của bộ đó), fan cứng
Guest
Dashboard
+ Đề thi (hiển thị thông tin cơ bản)
+Chủ đề từ vựng
+ Bài viết, tin tức
+Tài khoản
