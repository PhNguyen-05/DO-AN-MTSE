I. NHÓM BẢNG HỆ THỐNG, TÀI KHOẢN & PHÂN QUYỀN 
-- 1. Bảng quản lý thông tin tài khoản người dùng (Users)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    google_id VARCHAR(255) NULL UNIQUE, -- Lưu UID từ Google phục vụ luồng Đăng nhập mạng xã hội
    password_hash VARCHAR(255) NULL,    -- Cho phép NULL nếu người dùng đăng ký hoàn toàn bằng Google
    role ENUM('Admin', 'Manager', 'Employee', 'User') DEFAULT 'User',
    account_type ENUM('Thường', 'Premium') DEFAULT 'Thường',
    status ENUM('Chưa kích hoạt', 'Đang hoạt động', 'Bị khóa') DEFAULT 'Chưa kích hoạt',
    premium_expires_at DATETIME NULL,   -- Thời hạn kết thúc tài khoản VIP Premium
    accumulated_points INT DEFAULT 0,   -- Điểm tích lũy hệ thống
    avatar_url VARCHAR(255) NULL,
    phone_number VARCHAR(20) NULL,
    score_target INT NULL,              -- Điểm TOEIC mục tiêu người dùng cấu hình trong Profile
    saved_learning_roadmap JSON NULL,   -- Lưu trữ cấu trúc lộ trình học Premium đã chọn
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Bảng kiểm soát đăng nhập một thiết bị tại một thời điểm (User_Sessions)
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_identifier VARCHAR(255) NOT NULL, -- Mã nhận diện thiết bị/trình duyệt hiện tại
    token VARCHAR(500) NOT NULL,             -- Chuỗi JWT Token phiên hoạt động
    last_active_at DATETIME NOT NULL,        -- Dùng kiểm tra trạng thái tương tác để kích hoạt tự động logout thiết bị cũ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Bảng quản lý mã OTP gửi qua Email (OTP_Verifications)
CREATE TABLE otp_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    type ENUM('Đăng ký', 'Quên mật khẩu', 'Xác thực thiết bị') NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

II. NHÓM BẢNG NỘI DUNG HỌC TẬP & KHO CÂU HỎI 
-- 4. Bảng quản lý kho đề thi TOEIC tổng quát (Exam_Papers)
CREATE TABLE exam_papers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INT NOT NULL, -- Phục vụ logic chặn quyền: Tài khoản Thường chỉ được làm đề 2022 và 2023 miễn phí
    difficulty_level ENUM('Dễ', 'Trung bình', 'Khó') DEFAULT 'Trung bình',
    price_full DECIMAL(10, 2) DEFAULT 0.00,       -- Giá bán trọn gói đề thi mới nhất
    price_listening DECIMAL(10, 2) DEFAULT 0.00,  -- Giá mua lẻ phần Nghe cho tài khoản Thường
    price_reading DECIMAL(10, 2) DEFAULT 0.00,    -- Giá mua lẻ phần Đọc cho tài khoản Thường
    is_free BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,              -- TRUE = Hiển thị công khai, FALSE = Xóa mềm (Ẩn đi vì đã có người mua)
    view_count INT DEFAULT 0,                     -- Lưu lượt click xem phục vụ khối dữ liệu "Xem nhiều nhất" ở Trang chủ
    purchase_count INT DEFAULT 0,                 -- Lưu số đơn hàng thành công phục vụ khối dữ liệu "Bán chạy nhất"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Ngân hàng câu hỏi chi tiết phân rã theo cấu trúc đề thi (Questions)
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    part INT NOT NULL, -- Xác định từ Part 1 đến Part 7 để tính điểm trực quan và phân tích phần yếu
    question_number INT NOT NULL, -- Số thứ tự câu hỏi trong đề thi (1 đến 200)
    audio_url VARCHAR(255) NULL,  -- Link lưu trữ file âm thanh mp3 của câu hỏi nhóm Listening
    image_url VARCHAR(255) NULL,  -- Link lưu trữ hình ảnh minh họa câu hỏi
    passage TEXT NULL,            -- Đoạn văn bản, bài đọc hiểu ngữ cảnh của Part 6 và Part 7
    question_text TEXT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option CHAR(1) NOT NULL, -- Nhận diện đáp án đúng: 'A', 'B', 'C', hoặc 'D'
    explanation TEXT NULL,           -- Lời giải thích chi tiết đáp án khi xem lại kết quả bài làm
    FOREIGN KEY (exam_id) REFERENCES exam_papers(id) ON DELETE CASCADE
);

-- 6. Bảng quản lý danh mục bộ từ vựng tổng quát (Vocabulary_Sets)
CREATE TABLE vocabulary_sets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    thumbnail_url VARCHAR(255) NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    access_type ENUM('Miễn phí', 'Mua riêng lẻ', 'Premium') DEFAULT 'Mua riêng lẻ',
    is_visible BOOLEAN DEFAULT TRUE, -- Hỗ trợ chức năng xóa mềm bộ từ vựng phía Manager
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Danh sách chi tiết các từ vựng nằm trong bộ sưu tập (Vocabularies)
CREATE TABLE vocabularies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vocab_set_id INT NOT NULL,
    word VARCHAR(255) NOT NULL,
    phonetic VARCHAR(255) NULL,    -- Phiên âm quốc tế
    word_type VARCHAR(50) NULL,    -- Phân loại từ: Danh từ, Động từ, Tính từ...
    meaning TEXT NOT NULL,         -- Định nghĩa nghĩa tiếng Việt công khai
    example TEXT NULL,             -- Câu ví dụ tiếng Anh minh họa ngữ cảnh
    example_translation TEXT NULL, -- Bản dịch nghĩa tiếng Việt của câu ví dụ
    audio_url VARCHAR(255) NULL,   -- Link file phát âm chuẩn của từ vựng
    image_url VARCHAR(255) NULL,   -- Ảnh minh họa dạng flashcard
    FOREIGN KEY (vocab_set_id) REFERENCES vocabulary_sets(id) ON DELETE CASCADE
);

-- 8. Bảng quản lý Bài viết kiến thức và Tin tức khuyến mãi (Articles_News)
CREATE TABLE articles_news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    thumbnail_url VARCHAR(255) NULL,
    type ENUM('Bài viết', 'Tin tức') NOT NULL,
    status ENUM('PENDING', 'APPROVED') DEFAULT 'PENDING', -- Áp dụng quy trình phân cấp kiểm duyệt nội dung
    author_id INT NOT NULL, -- ID người viết (Admin/Manager/Employee)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

III. NHÓM BẢNG THƯƠNG MẠI ĐIỆN TỬ, GIAO DỊCH & KHUYẾN MÃI 
-- 9. Bảng thiết lập thông số cấu hình mã giảm giá hệ thống (Coupons)
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE, -- Chuỗi mã coupon (ví dụ: TOEIC50)
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL, -- Giảm theo % hoặc số tiền cố định
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_value DECIMAL(10, 2) DEFAULT 0.00, -- Điều kiện giá trị đơn hàng tối thiểu để áp dụng mã
    max_discount_value DECIMAL(10, 2) NULL,      -- Số tiền giảm tối đa nếu chọn loại giảm %
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    max_uses INT NOT NULL,                       -- Tổng lượt sử dụng tối đa của mã trên toàn hệ thống
    used_count INT DEFAULT 0,                    -- Lượt đã dùng thực tế
    uses_per_user INT DEFAULT 1,                 -- Giới hạn số lần áp dụng mã trên một tài khoản khách hàng
    scope ENUM('Toàn hệ thống', 'Chỉ áp dụng cho đề thi', 'Chỉ áp dụng cho bộ từ vựng', 'Chỉ áp dụng cho Premium') DEFAULT 'Toàn hệ thống',
    applicable_year INT NULL,                    -- Cấu hình chuyên biệt áp dụng riêng cho năm đề thi cụ thể
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Bảng quản lý thông tin hóa đơn đơn hàng (Orders)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(191) NOT NULL UNIQUE,
    user_id INT NULL, -- Dùng SET NULL thay vì CASCADE để bảo vệ an toàn số liệu doanh thu khi tài khoản user bị xóa
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(100) DEFAULT 'Ví điện tử', -- Ép buộc ràng buộc thanh toán qua Ví điện tử
    payment_status ENUM('SUCCESS', 'FAILED', 'PENDING') DEFAULT 'PENDING',
    discount_code_used VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 11. Bảng lưu trữ danh sách mặt hàng cụ thể nằm trong đơn hàng (Order_Details)
CREATE TABLE order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_type ENUM('Đề thi', 'Bộ từ vựng', 'Gói Premium', 'Phần Nghe', 'Phần Đọc') NOT NULL,
    product_id INT NOT NULL, -- ID của sản phẩm tương ứng thuộc các bảng nội dung
    price DECIMAL(10, 2) NOT NULL, -- Lưu giá bán thực tế tại thời điểm mua hàng
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 12. Nhật ký ghi nhận lịch sử khấu trừ mã giảm giá (Coupon_Usages)
CREATE TABLE coupon_usages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 13. Bảng quyền mở khóa học liệu mua lẻ theo phần của tài khoản Thường (User_Purchased_Parts)
CREATE TABLE user_purchased_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    skill_type ENUM('Listening', 'Reading') NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exam_papers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_exam_part (user_id, exam_id, skill_type)
);

IV. NHÓM BẢNG TIẾN ĐỘ HỌC TẬP & TƯƠNG TÁC NGƯỜI DÙNG 
-- 14. Bảng kết quả làm bài thi trọn vẹn phục vụ màn hình Thống kê chi tiết (Exam_Results)
CREATE TABLE exam_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    total_score INT NOT NULL,
    correct_answers INT NOT NULL,
    wrong_answers INT NOT NULL,
    duration_seconds INT NOT NULL,    -- Dùng tính toán chỉ số "Số giờ học tích lũy" của học viên
    selected_answers JSON NOT NULL,   -- Lưu trữ lịch sử chọn đáp án để render lại giao diện sửa sai chi tiết câu hỏi
    accuracy_by_parts JSON NOT NULL,  -- Mảng JSON lưu thống kê % câu đúng của từng Part (Part 1 -> 7) để tính Kỹ năng yếu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exam_papers(id) ON DELETE CASCADE
);

-- 15. Bảng lưu trữ danh sách câu hỏi khó được học viên đánh dấu trong lúc làm bài (Bookmarked_Questions)
CREATE TABLE bookmarked_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    result_id INT NOT NULL,
    question_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (result_id) REFERENCES exam_results(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 16. Bảng theo dõi và thiết lập mục tiêu kế hoạch học tập cá nhân (User_Learning_Goals)
CREATE TABLE user_learning_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_score INT NOT NULL,        -- Điểm TOEIC mong muốn
    target_exams_count INT NOT NULL,  -- Mục tiêu số đề làm
    target_vocab_count INT NOT NULL,  -- Mục tiêu lượng từ vựng cần học thuộc
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,           -- Ngày đáo hạn cam kết mục tiêu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 17. Bảng ghi nhận tiến trình ôn tập từ vựng chuẩn của hệ thống (User_Vocabularies)
CREATE TABLE user_vocabularies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vocabulary_id INT NOT NULL,
    learning_status ENUM('Chưa thuộc', 'Đang học', 'Đã thuộc') DEFAULT 'Đang học',
    review_count INT DEFAULT 0,         -- Đếm tổng số lần học viên ôn tập từ vựng này
    memorization_level INT DEFAULT 1,   -- Thang điểm ghi nhớ hỗ trợ thuật toán lặp lại ngắt quãng (Spaced Repetition)
    last_reviewed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vocabulary_id) REFERENCES vocabularies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_vocab (user_id, vocabulary_id)
);

-- 18. Sổ tay tự dịch thuật lưu trữ từ vựng cá nhân ngoài kho dữ liệu của hệ thống (Personal_Vocabularies)
CREATE TABLE personal_vocabularies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    word VARCHAR(255) NOT NULL,
    meaning TEXT NOT NULL,
    phonetic VARCHAR(255) NULL,
    example TEXT NULL,
    note TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 19. Danh mục lưu kho lưu trữ đề thi yêu thích của User (User_Favorites)
CREATE TABLE user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exam_papers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_favorite (user_id, exam_id)
);

-- 20. Phân hệ quản lý đánh giá số sao khóa học và bình luận lồng nhau (Product_Reviews_Comments)
CREATE TABLE product_reviews_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_type ENUM('Đề thi', 'Bài viết') NOT NULL,
    target_id INT NOT NULL,
    rating_stars INT NULL,                              -- Số sao từ 1 đến 5 (Chỉ dùng cho Đề thi, Bài viết viết blog để trống NULL)
    content TEXT NOT NULL,
    parent_id INT NULL,                                 -- ID bình luận cấp 1 phục vụ cấu trúc phản hồi nhiều cấp (Reply comment)
    status ENUM('VISIBLE', 'HIDDEN') DEFAULT 'VISIBLE', -- HIDDEN: Ẩn nhanh bình luận thô tục, spam khi Employee kiểm duyệt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES product_reviews_comments(id) ON DELETE SET NULL
);

-- 21. Lưu trữ lịch sử tương tác ẩn danh bằng Cookie/LocalStorage của khách (Guest_Tracking_Logs)
CREATE TABLE guest_tracking_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_guest_id VARCHAR(191) NOT NULL,
    action_type ENUM('Xem đề thi', 'Xem bài viết', 'Tìm kiếm') NOT NULL,
    target_id INT NOT NULL, -- ID của bài viết hoặc đề thi khách vãng lai vừa tương tác bấm vào xem
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. Phân hệ quản lý phòng hội thoại hỗ trợ trực tuyến (Chat_Rooms)
CREATE TABLE chat_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_guest_id VARCHAR(191) NULL, -- Định danh lưu chuỗi nếu là Guest chat vãng lai
    user_id INT NULL,                   -- Định danh nếu là học viên User đã đăng nhập hệ thống
    assigned_to INT NULL,               -- Nhân viên Employee/Admin nhận hỗ trợ (Chống trùng lặp nhân sự tiếp khách)
    status ENUM('QUEUE', 'ACTIVE', 'CLOSED') DEFAULT 'QUEUE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- 23. Nhật ký lưu trữ chi tiết lịch sử tin nhắn trong phòng chat (Chat_Messages)
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    sender_type ENUM('Guest', 'User', 'Employee', 'Admin') NOT NULL,
    sender_id INT NULL, -- Trỏ về ID tài khoản hệ thống nếu là User/Employee gửi, để trống nếu là Guest
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
);

V. CÁC INDEX TỐI ƯU HÓA TRUY VẤN (TĂNG TỐC LAZY LOADING & PHÂN TRANG NGANG) 
-- Tăng tốc độ truy vấn sắp xếp hiển thị sản phẩm "Bán chạy nhất" và "Xem nhiều nhất" theo chiều ngang ở Trang chủ công khai
CREATE INDEX idx_exams_view_purchase ON exam_papers (is_visible, purchase_count DESC, view_count DESC);

-- Tăng tốc độ lọc dữ liệu tìm kiếm nâng cao kết hợp cơ chế Lazy Loading cuốn chiếu ở danh sách danh mục
CREATE INDEX idx_exams_year_difficulty ON exam_papers (year, difficulty_level, is_visible);

-- Tăng tốc bộ lọc nạp bài viết và tin tức hệ thống theo quy trình kiểm duyệt bài đăng
CREATE INDEX idx_articles_type_status ON articles_news (type, status, created_at DESC);

-- Tăng tốc nạp và phân chia danh sách hội thoại realtime cho các Employee đang online trong phân hệ CSKH
CREATE INDEX idx_chat_rooms_status ON chat_rooms (status, assigned_to);

-- Tăng tốc độ kết xuất dữ liệu tin nhắn trò chuyện realtime sắp xếp theo tiến trình thời gian thực
CREATE INDEX idx_chat_messages_room ON chat_messages (room_id, created_at ASC);


