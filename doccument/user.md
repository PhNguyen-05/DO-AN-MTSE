UC01. Đăng ký tài khoản
Mục đích
Cho phép người dùng tạo tài khoản mới để sử dụng hệ thống.
Điều kiện trước
Người dùng chưa có tài khoản.
Có địa chỉ Email hợp lệ hoặc có tài khoản Google hợp lệ.
Luồng hoạt động chính 1: Đăng ký bằng Email
Người dùng chọn chức năng Đăng ký.
Hệ thống hiển thị biểu mẫu đăng ký.
Người dùng nhập:
Họ và tên.
Email.
Mật khẩu.
Xác nhận mật khẩu.
Người dùng nhấn Đăng ký.
Hệ thống kiểm tra:
Email đúng định dạng.
Email chưa tồn tại trong hệ thống.
Mật khẩu đáp ứng yêu cầu bảo mật (ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt).
Nếu thông tin hợp lệ, hệ thống tạo tài khoản ở trạng thái Chưa kích hoạt.
Hệ thống sinh mã OTP.
Hệ thống gửi mã OTP đến Email của người dùng.
Hệ thống chuyển sang màn hình xác thực OTP.
Người dùng nhập mã OTP.
Hệ thống kiểm tra:
OTP chính xác.
OTP còn hiệu lực.
Hệ thống kích hoạt tài khoản.
Hiển thị thông báo đăng ký thành công.
Chuyển người dùng đến trang đăng nhập.
Luồng hoạt động chính 2: Đăng ký bằng Google
Người dùng chọn nút Đăng ký bằng Google.
Hệ thống chuyển người dùng đến màn hình xác thực tài khoản Google.
Người dùng chọn tài khoản Google hoặc đăng nhập tài khoản Google mới.
Google yêu cầu người dùng cấp quyền chia sẻ thông tin cơ bản (họ tên, địa chỉ Email, ảnh đại diện nếu có).
Người dùng xác nhận cấp quyền.
Hệ thống nhận thông tin tài khoản Google từ Google.
Hệ thống kiểm tra:
Email Google đã tồn tại trong hệ thống hay chưa.
Nếu Email chưa tồn tại:
Hệ thống tự động tạo tài khoản mới.
Đánh dấu tài khoản đã được xác thực Email.
Nếu Email đã tồn tại:
Liên kết tài khoản Google với tài khoản hiện có (nếu chưa liên kết) hoặc sử dụng tài khoản hiện có để đăng nhập.
Hệ thống đăng nhập người dùng và chuyển đến Trang chủ.
Luồng thay thế
A1. Email đã tồn tại
Hệ thống thông báo: "Email đã được sử dụng."
Người dùng nhập Email khác hoặc chuyển sang đăng nhập.
A2. OTP không chính xác
Hệ thống thông báo OTP không chính xác.
Người dùng nhập lại OTP.
A3. OTP hết hạn
Hệ thống thông báo OTP đã hết hạn.
Người dùng chọn Gửi lại OTP để nhận mã mới.
A4. Người dùng hủy đăng ký bằng Google
Người dùng đóng cửa sổ hoặc hủy quá trình xác thực Google.
Hệ thống quay lại màn hình đăng ký.
A5. Không thể xác thực với Google
Hệ thống không nhận được thông tin từ Google hoặc xảy ra lỗi kết nối.
Hệ thống thông báo đăng ký bằng Google thất bại và yêu cầu người dùng thử lại.
Điều kiện sau
Thành công
Tài khoản được tạo thành công.
Đối với đăng ký bằng Email: tài khoản được kích hoạt sau khi xác thực OTP.
Đối với đăng ký bằng Google: tài khoản được xác thực ngay và người dùng được đăng nhập vào hệ thống.
Thất bại
Tài khoản không được tạo hoặc chưa được kích hoạt.
Người dùng vẫn ở màn hình đăng ký để tiếp tục thao tác.

UC02. Đăng nhập
Mục đích
Cho phép người dùng truy cập hệ thống bằng Email hoặc tài khoản Google.
Điều kiện trước
Người dùng đã có tài khoản trong hệ thống.
Đối với đăng nhập bằng Email: tài khoản đã được xác thực Email.
Đối với đăng nhập bằng Google: tài khoản Google hợp lệ.
Luồng hoạt động chính 1: Đăng nhập bằng Email
Người dùng mở trang Đăng nhập.
Hệ thống hiển thị màn hình đăng nhập.
Người dùng nhập:
Email.
Mật khẩu.
Người dùng nhấn Đăng nhập.
Hệ thống kiểm tra:
Email có tồn tại trong hệ thống.
Mật khẩu có chính xác.
Tài khoản đã được xác thực Email.
Hệ thống kiểm tra tài khoản đang có phiên đăng nhập trên thiết bị khác hay không.
Nếu tài khoản đang đăng nhập trên thiết bị khác:
Hệ thống tự động đăng xuất phiên đăng nhập trên thiết bị cũ.
Thông báo phiên đăng nhập đã được chuyển sang thiết bị mới.
Hệ thống tạo phiên đăng nhập mới.
Hệ thống ghi nhận thông tin thiết bị đang sử dụng.
Người dùng được chuyển đến Trang chủ.
Luồng hoạt động chính 2: Đăng nhập bằng Google
Người dùng chọn Đăng nhập bằng Google.
Hệ thống chuyển người dùng đến màn hình xác thực Google.
Người dùng chọn tài khoản Google hoặc đăng nhập tài khoản Google mới.
Google xác thực tài khoản.
Hệ thống nhận thông tin tài khoản Google.
Hệ thống kiểm tra Email Google:
Nếu Email đã tồn tại trong hệ thống thì đăng nhập vào tài khoản tương ứng.
Nếu Email chưa tồn tại thì tạo tài khoản mới, tự động xác thực Email và đăng nhập vào hệ thống.
Hệ thống kiểm tra tài khoản có đang đăng nhập trên thiết bị khác hay không.
Nếu tài khoản đang đăng nhập trên thiết bị khác:
Hệ thống tự động đăng xuất thiết bị cũ.
Phiên đăng nhập mới thay thế phiên cũ.
Hệ thống tạo phiên đăng nhập mới.
Hệ thống ghi nhận thiết bị đang sử dụng.
Người dùng được chuyển đến Trang chủ.
Luồng thay thế
A1. Sai Email hoặc mật khẩu
Hệ thống thông báo: "Email hoặc mật khẩu không chính xác."
Người dùng nhập lại thông tin.
A2. Tài khoản chưa xác thực Email
Hệ thống thông báo tài khoản chưa được xác thực.
Người dùng có thể yêu cầu gửi lại mã OTP để xác thực.
A3. Người dùng hủy đăng nhập bằng Google
Người dùng đóng cửa sổ xác thực Google hoặc từ chối cấp quyền.
Hệ thống quay lại màn hình đăng nhập.
A4. Không thể xác thực với Google
Hệ thống không nhận được thông tin từ Google hoặc xảy ra lỗi kết nối.
Hệ thống thông báo đăng nhập bằng Google thất bại và yêu cầu người dùng thử lại.
Điều kiện sau
Thành công
Người dùng đăng nhập thành công vào hệ thống.
Một phiên đăng nhập mới được tạo.
Thiết bị hiện tại được ghi nhận là thiết bị đang sử dụng.
Nếu trước đó tài khoản đang đăng nhập trên thiết bị khác thì phiên đăng nhập cũ sẽ tự động bị đăng xuất.
Thất bại
Người dùng không thể truy cập hệ thống.
Không tạo phiên đăng nhập mới.
Ràng buộc nghiệp vụ
Mỗi tài khoản chỉ được phép đăng nhập và học trên một thiết bị tại một thời điểm.
Khi người dùng đăng nhập trên thiết bị mới, hệ thống tự động đăng xuất phiên đăng nhập trên thiết bị cũ.
Phiên đăng nhập mới luôn thay thế phiên đăng nhập trước đó.
Đối với đăng nhập bằng Google, tài khoản được xem là đã xác thực Email và không cần nhập OTP.

UC03. Quên mật khẩu
Mục đích
Khôi phục mật khẩu khi người dùng quên mật khẩu.
Điều kiện trước
Email đã được đăng ký.
Luồng hoạt động chính
Người dùng chọn Quên mật khẩu.
Hệ thống yêu cầu nhập Email.
Người dùng nhập Email.
Hệ thống kiểm tra Email.
Sinh OTP.
Gửi OTP qua Email.
Người dùng nhập OTP.
Hệ thống xác thực OTP.
Người dùng nhập:
Mật khẩu mới.
Xác nhận mật khẩu.
Hệ thống kiểm tra tính hợp lệ.
Cập nhật mật khẩu mới.
Thông báo thành công.
Chuyển về màn hình đăng nhập.
UC04. Xem và cập nhật hồ sơ cá nhân 
Mục đích
Cho phép người dùng xem và cập nhật thông tin cá nhân.
Điều kiện trước
Đã đăng nhập.
Luồng hoạt động chính
Người dùng chọn Profile.
Hệ thống hiển thị:
Họ tên.
Email.
Ảnh đại diện.
Loại tài khoản.
Thời hạn Premium (nếu có).
Mã giảm giá.
SĐT
Mục tiêu điểm
Người dùng chọn chỉnh sửa.
Cập nhật thông tin.
Hệ thống kiểm tra dữ liệu.
Lưu thay đổi.
Hiển thị thông báo thành công.
Đổi mật khẩu
Người dùng chọn Đổi mật khẩu.
Nhập mật khẩu hiện tại.
Nhập mật khẩu mới.
Xác nhận mật khẩu mới.
Hệ thống kiểm tra.
Cập nhật mật khẩu.
UC05. Xem trang chủ 
Mục đích  
Hiển thị nội dung nổi bật của hệ thống.
Luồng hoạt động chính
Người dùng truy cập trang chủ.
Hệ thống tải dữ liệu.
Hiển thị:
Banner (chương trình khuyến mãi, các sự kiện….)
Đề thi nổi bật.
Đề thi mới.
Đề bán chạy.
Đề được đánh giá cao.
Bộ từ vựng nổi bật.
Bài viết mới.
Tin tức mới.
Người dùng chọn nội dung cần xem.
Hệ thống chuyển sang trang chi tiết.
UC06. Tìm kiếm
Mục đích
Tìm kiếm đề thi, từ vựng hoặc bài viết.
Luồng hoạt động chính
Người dùng nhập từ khóa.
Nhấn nút tìm kiếm.
Hệ thống tìm kiếm:
Đề thi.
Bộ từ vựng.
Bài viết.
Tin tức.
Trả về danh sách kết quả.
Người dùng chọn kết quả.
Hệ thống hiển thị trang chi tiết.
UC07. Xem chi tiết sản phẩm
Mục đích
Xem đầy đủ thông tin của đề thi hoặc bộ từ vựng.
Luồng hoạt động chính
Người dùng chọn một sản phẩm.
Hệ thống hiển thị:
Tên sản phẩm.
Mô tả.
Giá bán.
Loại sản phẩm.
Trạng thái đã mua/chưa mua.
Hiển thị:
Số lượt mua.
Số lượt bình luận.
Điểm đánh giá trung bình.
Hiển thị toàn bộ đánh giá.
Hiển thị toàn bộ bình luận.
Hiển thị:
Đề thi tương tự.
Sản phẩm đã xem.
Người dùng có thể:
Mua ngay.
Thêm vào yêu thích.
Xem đánh giá.
UC08. Xem và quản lý đề yêu thích 
Mục đích
Lưu các đề thi yêu thích.
Luồng hoạt động chính
Người dùng mở chi tiết đề thi.
Chọn Yêu thích.
Hệ thống lưu đề thi.
Hiển thị thông báo thành công.
Người dùng mở danh sách yêu thích.
Hệ thống hiển thị toàn bộ đề đã lưu.
Người dùng có thể:
Xem chi tiết.
Xóa khỏi danh sách.
UC09. Sử dụng tài khoản Thường 
Sau khi đăng nhập bằng tài khoản Thường, người dùng có thể:
Xem các đề thi năm 2022 và 2023.
Làm các đề miễn phí.
Xem đáp án.
Xem lời giải chi tiết.
Mua từng đề thi mới nhất.
Mua từng phần:
Listening.
Reading.
Mua bộ từ vựng.
Sử dụng chức năng ôn tập của bộ từ vựng đã mua.
UC10. Sử dụng tài khoản Premium 
Sau khi nâng cấp Premium:
Hệ thống cập nhật trạng thái Premium.
Người dùng được phép:
Mua trọn bộ đề theo năm.
Nhận mức giá ưu đãi.
Truy cập toàn bộ đáp án.
Truy cập lời giải chi tiết.
Nhận gợi ý lộ trình học.
Nhận thông báo nhắc học.
Mua và ôn tập bộ từ vựng.
Được gắn huy hiệu Fan Cứng.
Các quyền chỉ có hiệu lực trong thời gian gói Premium còn hạn.
UC11. Đăng ký gói Premium
Mục đích
Nâng cấp tài khoản lên Premium.
Luồng hoạt động chính
Người dùng chọn Nâng cấp Premium.
Hệ thống hiển thị các gói Premium.
Người dùng chọn một gói.
Hệ thống hiển thị:
Giá tiền.
Thời hạn.
Quyền lợi.
Người dùng chọn Thanh toán.
Hệ thống chuyển sang ví điện tử.
Người dùng xác nhận thanh toán.
Thanh toán thành công.
Hệ thống:
Kích hoạt Premium.
Cập nhật ngày hết hạn.
Gửi thông báo thành công.
Người dùng có thể xem trạng thái Premium trong Profile.
Luồng thay thế
Thanh toán thất bại.
Ví điện tử không đủ số dư.
Lỗi kết nối.
Giao dịch bị từ chối.

UC12. Thanh toán sản phẩm
Mục đích
Cho phép người dùng thanh toán đề thi, bộ từ vựng hoặc gói Premium bằng ví điện tử.
Điều kiện trước
Người dùng đã đăng nhập.
Người dùng đã chọn ít nhất một sản phẩm.
Sản phẩm chưa được mua trước đó.
Luồng hoạt động chính
Người dùng chọn Mua ngay.
Hệ thống hiển thị thông tin đơn hàng gồm:
Danh sách sản phẩm.
Giá tiền.
Tổng tiền.
Nếu người dùng có mã giảm giá còn hiệu lực:
Hệ thống hiển thị danh sách mã giảm giá.
Người dùng chọn tối đa 01 mã giảm giá.
Hệ thống tính lại tổng tiền sau giảm giá.
Người dùng chọn phương thức thanh toán Ví điện tử.
Hệ thống chuyển đến cổng thanh toán.
Người dùng xác nhận thanh toán trên ví điện tử.
Hệ thống nhận kết quả thanh toán.
Nếu thanh toán thành công:
Lưu thông tin đơn hàng.
Cập nhật quyền truy cập sản phẩm.
Gửi thông báo thanh toán thành công.
Người dùng có thể sử dụng sản phẩm ngay.
Luồng thay thế
A1. Thanh toán thất bại
Hệ thống thông báo thất bại.
Người dùng có thể thực hiện lại giao dịch.
A2. Mã giảm giá hết hạn
Hệ thống thông báo mã không hợp lệ.
Người dùng chọn mã khác.
A3. Ví điện tử không đủ số dư
Hệ thống từ chối giao dịch.
Ràng buộc
Chỉ hỗ trợ thanh toán bằng ví điện tử.
Không cho phép hủy đơn hàng sau khi thanh toán thành công.
UC13. Xem lịch sử mua hàng
Mục đích
Cho phép người dùng xem các sản phẩm đã mua.
Điều kiện trước
Đã đăng nhập.
Luồng hoạt động chính
Người dùng chọn Lịch sử mua hàng.
Hệ thống truy xuất dữ liệu.
Hiển thị danh sách gồm:
Mã đơn hàng.
Ngày mua.
Loại sản phẩm.
Tên sản phẩm.
Giá thanh toán.
Mã giảm giá đã sử dụng (nếu có).
Người dùng chọn một đơn hàng.
Hệ thống hiển thị chi tiết đơn hàng.
Nếu sản phẩm là:
Đề thi → Cho phép học lại.
Bộ từ vựng → Cho phép ôn tập.
Premium → Hiển thị thời hạn sử dụng.
UC14. Luyện bộ đề
Mục đích
Cho phép người dùng làm trọn vẹn một đề thi.
Điều kiện trước
Đã mua đề hoặc có quyền truy cập.
Đăng nhập thành công.
Luồng hoạt động chính
Người dùng chọn đề thi.
Hệ thống hiển thị thông tin đề.
Người dùng chọn Bắt đầu làm bài.
Hệ thống hiển thị từng câu hỏi.
Người dùng chọn đáp án.
Có thể chuyển:
Câu trước.
Câu tiếp theo.
Người dùng hoàn thành bài.
Chọn Nộp bài.
Hệ thống xác nhận nộp bài.
Chấm điểm tự động.
Lưu kết quả.
Chuyển sang màn hình kết quả.
UC15. Luyện tập theo từng phần
Mục đích
Cho phép luyện riêng từng kỹ năng.
Luồng hoạt động chính
Người dùng chọn Luyện tập theo phần.
Hệ thống hiển thị:
Listening.
Reading.
Người dùng chọn một phần.
Hệ thống hiển thị danh sách bài luyện.
Người dùng chọn bài.
Thực hiện làm bài.
Nộp bài.
Hệ thống chấm điểm.
Hiển thị kết quả.
UC16. Đánh dấu câu hỏi khó
Mục đích
Lưu các câu hỏi cần ôn tập lại.
Điều kiện trước
Đang làm bài.
Luồng hoạt động chính
Người dùng xem câu hỏi.
Chọn biểu tượng Đánh dấu.
Hệ thống lưu trạng thái câu hỏi.
Người dùng tiếp tục làm bài.
Sau khi hoàn thành:
Các câu hỏi khó được lưu vào danh sách.
Người dùng có thể mở danh sách để ôn tập.
UC17. Xem chi tiết kết quả
Mục đích
Xem kết quả bài làm.
Luồng hoạt động chính
Sau khi nộp bài.
Hệ thống chấm điểm.
Hiển thị:
Điểm số.
Số câu đúng.
Số câu sai.
Thời gian làm bài.
Hiển thị từng câu hỏi.
Người dùng xem:
Đáp án của mình.
Đáp án đúng.
Giải thích chi tiết.
Người dùng có thể làm lại bài.
UC18. Nhận gợi ý lộ trình học tập 
Mục đích
Cho phép người dùng có tài khoản Premium nhận lộ trình học tập phù hợp với mục tiêu đã chọn.
Điều kiện trước
Người dùng đã đăng nhập.
Người dùng đang sử dụng tài khoản Premium.
Luồng hoạt động chính
Người dùng chọn chức năng Gợi ý lộ trình học tập.
Hệ thống hiển thị danh sách các mục tiêu học tập, ví dụ:
TOEIC 450+.
TOEIC 650+.
TOEIC 850+.
Người dùng chọn mục tiêu mong muốn.
Người dùng nhấn Xem lộ trình.
Hệ thống hiển thị lộ trình học tương ứng, bao gồm:
Thời gian học dự kiến.
Số đề thi nên luyện.
Các kỹ năng cần ưu tiên (Listening, Reading).
Các bộ từ vựng nên học.
Người dùng chọn Lưu lộ trình.
Hệ thống lưu lộ trình vào tài khoản để người dùng theo dõi trong quá trình học.
Luồng thay thế
A1. Người dùng không phải tài khoản Premium
Hệ thống thông báo chức năng chỉ dành cho tài khoản Premium.
Gợi ý người dùng nâng cấp tài khoản.
A2. Người dùng không lưu lộ trình
Hệ thống chỉ hiển thị lộ trình để tham khảo.
Không lưu vào tài khoản.
Điều kiện sau
Thành công
Lộ trình học tập được hiển thị.
Nếu người dùng chọn lưu, hệ thống lưu lộ trình vào tài khoản.
Thất bại
Không hiển thị hoặc không lưu lộ trình học tập.
Ràng buộc nghiệp vụ
Chỉ tài khoản Premium được sử dụng chức năng này.
Người dùng có thể thay đổi mục tiêu và xem lộ trình khác bất kỳ lúc nào.
Các lộ trình được hệ thống xây dựng sẵn theo từng mức điểm mục tiêu.

UC19. Ôn tập từ vựng
Mục đích
Cho phép người dùng ôn tập các bộ từ vựng có quyền truy cập và danh sách từ vựng cá nhân nhằm nâng cao khả năng ghi nhớ, mở rộng vốn từ và theo dõi tiến độ học tập.
Điều kiện trước
Người dùng đã đăng nhập.
Người dùng có quyền truy cập ít nhất một trong các nguồn từ vựng sau:
Bộ từ vựng miễn phí của hệ thống.
Bộ từ vựng đã mua.
Danh sách từ vựng cá nhân.
Luồng hoạt động chính
Người dùng chọn chức năng Ôn tập từ vựng.
Hệ thống hiển thị các nguồn từ vựng có thể ôn tập, bao gồm:
Bộ từ vựng miễn phí của hệ thống.
Bộ từ vựng đã mua.
Danh sách từ vựng cá nhân.
Người dùng chọn một bộ từ vựng hoặc danh sách từ vựng muốn ôn tập.
Hệ thống hiển thị danh sách từ vựng gồm:
Từ vựng.
Nghĩa.
Phiên âm.
Loại từ (nếu có).
Ví dụ minh họa (nếu có).
Người dùng lựa chọn chế độ ôn tập:
Flashcard.
Trắc nghiệm.
Hệ thống lần lượt hiển thị các từ vựng theo chế độ đã chọn.
Người dùng thực hiện ôn tập bằng cách xem đáp án hoặc trả lời câu hỏi.
Hệ thống ghi nhận kết quả của từng từ vựng.
Hệ thống cập nhật:
Tiến độ học tập.
Số lượng từ đã học.
Tỷ lệ trả lời đúng.
Thời gian ôn tập.
Hệ thống lưu kết quả để phục vụ thống kê và gợi ý ôn tập trong các lần học tiếp theo.
Luồng thay thế
A1. Người dùng chưa có nguồn từ vựng để ôn tập
Hệ thống thông báo chưa có dữ liệu để ôn tập.
Hệ thống gợi ý người dùng:
Học các bộ từ vựng miễn phí (nếu có).
Mua bộ từ vựng.
Thêm từ vựng vào danh sách cá nhân.
A2. Bộ từ vựng hoặc danh sách từ vựng không có dữ liệu
Hệ thống thông báo danh sách từ vựng đang trống.
Người dùng chọn bộ từ vựng khác hoặc thêm từ vựng mới.
A3. Người dùng kết thúc phiên ôn tập giữa chừng
Hệ thống tự động lưu tiến độ hiện tại.
Người dùng có thể tiếp tục ôn tập ở lần truy cập sau.
Điều kiện sau
Thành công
Kết quả ôn tập được lưu.
Tiến độ học tập được cập nhật.
Thống kê học tập được cập nhật.
Dữ liệu được sử dụng để gợi ý lộ trình và nội dung ôn tập phù hợp.
Thất bại
Không có dữ liệu để ôn tập hoặc người dùng hủy phiên ôn tập.
Tiến độ được lưu đến thời điểm gần nhất (nếu có).
Ràng buộc nghiệp vụ
Người dùng được phép ôn tập các bộ từ vựng miễn phí do hệ thống cung cấp.
Người dùng chỉ được ôn tập các bộ từ vựng trả phí sau khi đã mua thành công.
Người dùng được phép ôn tập không giới hạn các từ vựng trong danh sách từ vựng cá nhân.
Danh sách từ vựng cá nhân có thể được tạo từ nhiều nguồn, bao gồm:
Từ được thêm trong quá trình làm đề thi.
Từ được thêm khi đọc bài viết hoặc tin tức.
Từ được nhập thủ công từ sách, giáo trình hoặc tài liệu học khác.
Mỗi lần ôn tập đều được hệ thống ghi nhận để cập nhật tiến độ học tập, thống kê kết quả và hỗ trợ gợi ý ôn tập trong tương lai.
UC20. Phiên dịch từ vựng
Mục đích
Tra cứu nghĩa của từ.
Luồng hoạt động chính
Người dùng mở chức năng Phiên dịch từ vựng.
Nhập từ cần tra.
Hệ thống tìm kiếm.
Hiển thị:
Nghĩa.
Phiên âm.
Ví dụ.
Loại từ.
Người dùng có thể thêm từ vào bộ sưu tập cá nhân.
UC21. Xem thống kê tiến độ học tập 
Mục đích
Theo dõi quá trình học tập.
Luồng hoạt động chính
Người dùng chọn Thống kê.
Hệ thống tổng hợp dữ liệu.
Hiển thị:
Số đề đã hoàn thành.
Điểm trung bình.
Số từ vựng đã học.
Hiển thị biểu đồ tiến độ.
Người dùng theo dõi kết quả để điều chỉnh kế hoạch học tập.

UC22. Đánh giá sao đề thi
Mục đích
Cho phép người dùng đánh giá chất lượng đề thi đã mua.
Điều kiện trước
Người dùng đã đăng nhập.
Người dùng đã mua đề thi.
Người dùng chưa đánh giá đề thi đó.
Luồng hoạt động chính
Người dùng mở trang chi tiết đề thi đã mua.
Hệ thống kiểm tra quyền đánh giá.
Nếu đủ điều kiện, hiển thị biểu mẫu đánh giá.
Người dùng chọn số sao từ 1 đến 5.
Người dùng nhập nội dung nhận xét (không bắt buộc).
Người dùng nhấn Gửi đánh giá.
Hệ thống lưu đánh giá.
Hệ thống cập nhật điểm đánh giá trung bình của đề thi.
Hệ thống sinh một mã giảm giá tích lũy cho tài khoản người dùng.
Mã giảm giá được lưu vào tài khoản và có thời hạn sử dụng.
Hệ thống thông báo đánh giá thành công.
Luồng thay thế
A1. Chưa mua đề thi
Hệ thống không cho phép đánh giá.
Hiển thị thông báo: "Bạn chỉ có thể đánh giá đề thi đã mua."
A2. Đã đánh giá trước đó
Hệ thống không tạo thêm mã giảm giá.
Cho phép chỉnh sửa nội dung đánh giá nếu hệ thống hỗ trợ.
Ràng buộc nghiệp vụ
Mỗi đề thi chỉ được đánh giá một lần bởi một tài khoản.
Mỗi lần đánh giá thành công chỉ nhận một mã giảm giá.
Mỗi đơn hàng chỉ được sử dụng một mã giảm giá.
Hệ thống sẽ tự động sinh và cộng dồn Mã giảm giá tích lũy vào ví voucher của User ngay sau khi hệ thống lưu đánh giá thành công.
Mã giảm giá này có thiết lập thời hạn sử dụng (Hệ thống tự động chuyển trạng thái hết hạn khi quá ngày).
UC23. Bình luận đề thi
Mục đích
Cho phép người dùng chia sẻ ý kiến về đề thi.
Điều kiện trước
Đã đăng nhập.
Luồng hoạt động chính
Người dùng mở trang chi tiết đề thi.
Chọn mục Bình luận.
Nhập nội dung bình luận.
Nhấn Gửi.
Hệ thống lưu bình luận.
Hiển thị bình luận ngay dưới đề thi.
Cập nhật tổng số bình luận của đề thi.
Luồng thay thế
A1. Nội dung rỗng
Hệ thống yêu cầu nhập nội dung.
UC24. Bình luận bài viết
Mục đích
Cho phép người dùng bình luận các bài viết chia sẻ kiến thức.
Điều kiện trước
Đã đăng nhập.
Luồng hoạt động chính
Người dùng mở bài viết.
Chọn Viết bình luận.
Nhập nội dung.
Nhấn Gửi.
Hệ thống lưu bình luận.
Hiển thị bình luận dưới bài viết.
UC25. Thêm từ vựng cá nhân
Mục đích
Cho phép người dùng lưu từ vựng riêng.
Điều kiện trước
Đã đăng nhập.
Luồng hoạt động chính
Người dùng mở Từ vựng cá nhân.
Chọn Thêm từ mới.
Nhập:
Từ vựng.
Nghĩa.
Phiên âm.
Ví dụ.            (nếu có)
Ghi chú 
Nhấn Lưu.
Hệ thống kiểm tra dữ liệu.
Lưu từ vựng.
Hiển thị thông báo thành công.
UC26. Xem bài viết
Mục đích
Cho phép người dùng đọc các bài viết chia sẻ kiến thức.
Luồng hoạt động chính
Người dùng mở mục Bài viết.
Hệ thống hiển thị danh sách bài viết.
Người dùng chọn một bài viết.
Hệ thống hiển thị:
Tiêu đề.
Nội dung.
Ngày đăng.
Tác giả.
Bình luận.
Người dùng có thể bình luận nếu đã đăng nhập.
UC27. Xem tin tức
Mục đích
Cho phép người dùng theo dõi các tin tức mới.
Luồng hoạt động chính
Người dùng mở mục Tin tức.
Hệ thống hiển thị danh sách tin tức.
Người dùng chọn một tin.
Hệ thống hiển thị nội dung chi tiết.
Người dùng có thể tìm kiếm tin tức khác.
UC28. Xem đề thi tương tự
Mục đích
Đề xuất các đề thi có nội dung tương đồng.
Luồng hoạt động chính
Người dùng mở chi tiết một đề thi.
Hệ thống phân tích:
Chủ đề.
Năm thi.
Mức độ khó.
Hiển thị danh sách đề thi tương tự.
Người dùng chọn đề thi khác để xem hoặc mua.
UC29. Xem sản phẩm (đề thi, từ vựng, gói premium) đã xem gần đây
Mục đích
Giúp người dùng nhanh chóng quay lại các sản phẩm đã xem.
Luồng hoạt động chính
Mỗi lần người dùng mở một sản phẩm:
Hệ thống ghi nhận lịch sử xem.
Người dùng truy cập mục Đã xem gần đây.
Hệ thống hiển thị danh sách sản phẩm theo thời gian gần nhất.
Người dùng chọn sản phẩm để xem lại.
UC30. Xem và sử dụng mã giảm giá 
Mục đích
Cho phép người dùng quản lý và sử dụng mã giảm giá tích lũy.
Điều kiện trước
Đã đăng nhập.
Luồng hoạt động chính
Người dùng mở mục Mã giảm giá.
Hệ thống hiển thị:
Mã giảm giá.
Giá trị giảm.
Ngày hết hạn.
Khi thanh toán:
Hệ thống hiển thị các mã còn hiệu lực.
Người dùng chọn một mã giảm giá.
Hệ thống tính lại tổng tiền.
Luồng thay thế
Nếu mã hết hạn:
Hệ thống tự động xóa.
Ràng buộc nghiệp vụ
Mỗi đơn hàng chỉ được sử dụng một mã giảm giá.
Mã giảm giá không được cộng dồn.
Mã giảm giá chỉ sử dụng khi còn hiệu lực.
UC31. Xem thông tin sản phẩm 
Mục đích
Hiển thị mức độ phổ biến của sản phẩm.
Luồng hoạt động chính
Người dùng mở trang chi tiết sản phẩm.
Hệ thống hiển thị:
Tổng số lượt mua.
Tổng số lượt đánh giá.
Tổng số bình luận.
Khi phát sinh giao dịch hoặc bình luận mới:
Hệ thống tự động cập nhật các chỉ số.
Người dùng có thể sử dụng các thông tin này để tham khảo trước khi mua.

