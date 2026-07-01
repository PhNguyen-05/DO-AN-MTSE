# Test Cases Admin - Ứng dụng TOEIC Luyen Thi

## Test Case A001: Xem Dashboard Thống kê hệ thống - Tổng số User

**Test Case ID:** TC_A001  
**Test Case Description:** Kiểm tra hiển thị tổng số User trên Dashboard  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đăng nhập với tài khoản Admin hoặc Manager
2. Hệ thống có dữ liệu User

**Test Data:**
- Không có

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Truy cập trang Admin Dashboard | Hiển thị giao diện Dashboard với các metric cards | Như mong đợi | Pass |
| 2 | Quan sát card "Tổng số User" | Hiển thị số lượng User đang có trong hệ thống với icon người | Như mong đợi | Pass |
| 3 | Kiểm tra số liệu | Số liệu khớp với số lượng User thực tế trong database | Như mong đợi | Pass |

---

## Test Case A002: Xem Dashboard Thống kê hệ thống - Tổng số Đề thi

**Test Case ID:** TC_A002  
**Test Case Description:** Kiểm tra hiển thị tổng số Đề thi trên Dashboard  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đăng nhập với tài khoản Admin hoặc Manager
2. Hệ thống có dữ liệu Đề thi

**Test Data:**
- Không có

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Truy cập trang Admin Dashboard | Hiển thị giao diện Dashboard | Như mong đợi | Pass |
| 2 | Quan sát card "Tổng số Đề thi" | Hiển thị số lượng Đề thi đang có trong hệ thống với icon tài liệu | Như mong đợi | Pass |
| 3 | Kiểm tra số liệu | Số liệu khớp với số lượng Đề thi thực tế (chỉ tính đề không bị ẩn) | Như mong đợi | Pass |

---

## Test Case A003: Xem Dashboard Thống kê hệ thống - Tỉ lệ hoàn thành bài làm

**Test Case ID:** TC_A003  
**Test Case Description:** Kiểm tra hiển thị tỉ lệ hoàn thành bài làm của học viên  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đăng nhập với tài khoản Admin hoặc Manager
2. Hệ thống có dữ liệu ExamAttempt

**Test Data:**
- Không có

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Truy cập trang Admin Dashboard | Hiển thị giao diện Dashboard | Như mong đợi | Pass |
| 2 | Quan sát card "Tỉ lệ hoàn thành bài làm" | Hiển thị tỉ lệ % hoàn thành bài làm của học viên | Như mong đợi | Pass |
| 3 | Kiểm tra số liệu | Tỉ lệ được tính đúng: (số bài hoàn thành / tổng số bài) * 100 | Như mong đợi | Pass |

---

## Test Case A004: Xem Dashboard Thống kê hệ thống - Biểu đồ doanh thu (Admin)

**Test Case ID:** TC_A004  
**Test Case Description:** Kiểm tra hiển thị biểu đồ doanh thu dòng tiền (chỉ Admin)  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đăng nhập với tài khoản Admin (role = admin)
2. Hệ thống có dữ liệu Payment

**Test Data:**
- Không có

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Truy cập trang Admin Dashboard với tài khoản Admin | Hiển thị giao diện Dashboard đầy đủ | Như mong đợi | Pass |
| 2 | Quan sát biểu đồ doanh thu | Hiển thị biểu đồ doanh thu theo tháng (monthlyRevenue) | Như mong đợi | Pass |
| 3 | Kiểm tra dữ liệu biểu đồ | Biểu đồ hiển thị đúng số liệu doanh thu từng tháng | Như mong đợi | Pass |

---

## Test Case A005: Thêm mới Đề thi - Thông tin cơ bản

**Test Case ID:** TC_A005  
**Test Case Description:** Kiểm tra thêm mới đề thi với thông tin hợp lệ  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đăng nhập với tài khoản Admin hoặc Manager
2. Đang ở màn hình Quản lý đề thi

**Test Data:**
- Name: TOEIC Test 2026
- Release Year: 2026
- Difficulty: medium
- Price Bundle: 100000
- Price Listening: 50000
- Price Reading: 50000
- Duration Minutes: 120

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút "Thêm đề thi mới" | Hiển thị form thêm/sửa đề thi | Như mong đợi | Pass |
| 2 | Nhập tên đề thi | Tên đề thi được hiển thị trong ô input | Như mong đợi | Pass |
| 3 | Chọn năm phát hành (2026) | Năm được chọn từ dropdown | Như mong đợi | Pass |
| 4 | Chọn mức độ khó (medium) | Mức độ được chọn | Như mong đợi | Pass |
| 5 | Nhập giá trọn gói (100000) | Giá được hiển thị | Như mong đợi | Pass |
| 6 | Nhập giá lẻ phần Nghe (50000) | Giá được hiển thị | Như mong đợi | Pass |
| 7 | Nhập giá lẻ phần Đọc (50000) | Giá được hiển thị | Như mong đợi | Pass |
| 8 | Click nút "Lưu" | Hệ thống gửi request tạo đề thi | Như mong đợi | Pass |
| 9 | Quan sát thông báo | Hiển thị thông báo "Exam saved successfully" | Như mong đợi | Pass |
| 10 | Quan sát danh sách | Đề thi mới xuất hiện trong danh sách | Như mong đợi | Pass |

---

## Test Case A006: Thêm mới Đề thi - Upload file PDF

**Test Case ID:** TC_A006  
**Test Case Description:** Kiểm tra upload file đề thi PDF lên Cloud  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đang ở form thêm/sửa đề thi

**Test Data:**
- File PDF: toeic_test.pdf (dưới 10MB)

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút chọn file PDF | Hiển thị dialog chọn file | Như mong đợi | Pass |
| 2 | Chọn file PDF hợp lệ | File được chọn và tên file hiển thị | Như mong đợi | Pass |
| 3 | Click nút "Lưu" | Hệ thống upload file lên Cloud và lưu URL | Như mong đợi | Pass |
| 4 | Quan sát danh sách | Đề thi hiển thị label "PDF" | Như mong đợi | Pass |

---

## Test Case A007: Thêm mới Đề thi - Upload file nghe MP3

**Test Case ID:** TC_A007  
**Test Case Description:** Kiểm tra upload file nghe MP3 lên Cloud  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đang ở form thêm/sửa đề thi

**Test Data:**
- File MP3: part1.mp3, part2.mp3 (dưới 20MB mỗi file)

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút chọn file MP3 | Hiển thị dialog chọn file (cho phép multi-select) | Như mong đợi | Pass |
| 2 | Chọn nhiều file MP3 | Các file được chọn và tên hiển thị | Như mong đợi | Pass |
| 3 | Click nút "Lưu" | Hệ thống upload các file lên Cloud và lưu URLs | Như mong đợi | Pass |
| 4 | Quan sát danh sách | Đề thi hiển thị label "MP3" | Như mong đợi | Pass |

---

## Test Case A008: Chỉnh sửa Đề thi

**Test Case ID:** TC_A008  
**Test Case Description:** Kiểm tra chỉnh sửa thông tin đề thi  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đề thi đã tồn tại trong hệ thống

**Test Data:**
- Name: TOEIC Test 2026 Updated
- Difficulty: hard

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút "Sửa" trên đề thi cần chỉnh sửa | Hiển thị form chỉnh sửa với dữ liệu hiện tại | Như mong đợi | Pass |
| 2 | Thay đổi tên đề thi | Tên mới được hiển thị | Như mong đợi | Pass |
| 3 | Thay đổi mức độ khó thành "hard" | Mức độ mới được chọn | Như mong đợi | Pass |
| 4 | Click nút "Lưu" | Hệ thống gửi request cập nhật | Như mong đợi | Pass |
| 5 | Quan sát thông báo | Hiển thị thông báo thành công | Nh như mong đợi | Pass |
| 6 | Quan sát danh sách | Thông tin đề thi được cập nhật | Như mong đợi | Pass |

---

## Test Case A009: Xóa đề thi - Chưa có người mua

**Test Case ID:** TC_A009  
**Test Case Description:** Kiểm tra xóa cứng đề thi chưa có người mua  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đề thi chưa có bất kỳ Purchase nào

**Test Data:**
- Exam ID: [ID đề thi chưa có người mua]

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút "Xóa" trên đề thi | Hiển thị dialog xác nhận xóa | Như mong đợi | Pass |
| 2 | Xác nhận xóa | Hệ thống thực hiện xóa cứng khỏi DB | Như mong đợi | Pass |
| 3 | Quan sát thông báo | Hiển thị thông báo xóa thành công | Như mong đợi | Pass |
| 4 | Quan sát danh sách | Đề thi không còn xuất hiện trong danh sách | Như mong đợi | Pass |
| 5 | Kiểm tra database | Đề thi bị xóa hoàn toàn khỏi database | Như mong đợi | Pass |

---

## Test Case A010: Xóa đề thi - Đã có người mua

**Test Case ID:** TC_A010  
**Test Case Description:** Kiểm tra xóa mềm đề thi đã có người mua  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đề thi đã có ít nhất 1 Purchase

**Test Data:**
- Exam ID: [ID đề thi đã có người mua]

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút "Xóa" trên đề thi | Hiển thị dialog xác nhận xóa | Như mong đợi | Pass |
| 2 | Xác nhận xóa | Hệ thống thực hiện xóa mềm (ẩn đề thi) | Như mong đợi | Pass |
| 3 | Quan sát thông báo | Hiển thị thông báo "Exam hidden successfully" hoặc tương tự | Như mong đợi | Pass |
| 4 | Quan sát danh sách | Đề thi không còn hiển thị trong danh sách mặc định | Nh như mong đợi | Pass |
| 5 | Kiểm tra database | Đề thi vẫn tồn tại với isHidden = true, hiddenAt được set | Như mong đợi | Pass |

---

## Test Case A011: Thêm mới Câu hỏi - Part 1

**Test Case ID:** TC_A011  
**Test Case Description:** Kiểm tra thêm câu hỏi Part 1 với đầy đủ thông tin  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đã chọn đề thi để thêm câu hỏi
2. Đang ở màn hình Ngân hàng câu hỏi

**Test Data:**
- Part: 1
- Question Number: 1
- Answer A: Option A
- Answer B: Option B
- Answer C: Option C
- Answer D: Option D
- Correct Answer: B
- Explanation: Giải thích chi tiết

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Chọn đề thi từ dropdown | Danh sách câu hỏi của đề thi được load | Như mong đợi | Pass |
| 2 | Click nút "Thêm câu hỏi" | Hiển thị form thêm/sửa câu hỏi | Như mong đợi | Pass |
| 3 | Chọn Part = 1 | Part được chọn | Như mong đợi | Pass |
| 4 | Nhập Question Number = 1 | Số thứ tự được hiển thị | Như mong đợi | Pass |
| 5 | Nhập 4 đáp án A, B, C, D | Các đáp án được hiển thị | Như mong đợi | Pass |
| 6 | Chọn Correct Answer = B | Đáp án đúng được chọn | Như mong đợi | Pass |
| 7 | Nhập Explanation | Giải thích được hiển thị | Như mong đợi | Pass |
| 8 | Click nút "Lưu" | Hệ thống gửi request tạo câu hỏi | Như mong đợi | Pass |
| 9 | Quan sát thông báo | Hiển thị thông báo thành công | Như mong đợi | Pass |
| 10 | Quan sát danh sách | Câu hỏi mới xuất hiện trong danh sách | Như mong đợi | Pass |

---

## Test Case A012: Thêm mới Câu hỏi - Part 2 (chỉ 3 đáp án)

**Test Case ID:** TC_A012  
**Test Case Description:** Kiểm tra thêm câu hỏi Part 2 với 3 đáp án A, B, C  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đã chọn đề thi
2. Đang ở màn hình Ngân hàng câu hỏi

**Test Data:**
- Part: 2
- Question Number: 11
- Answer A: Option A
- Answer B: Option B
- Answer C: Option C
- Answer D: (để trống)
- Correct Answer: A

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Chọn Part = 2 | Form hiển thị chỉ 3 ô đáp án A, B, C (D bị ẩn) | Như mong đợi | Pass |
| 2 | Nhập 3 đáp án A, B, C | Các đáp án được hiển thị | Như mong đợi | Pass |
| 3 | Chọn Correct Answer = A | Đáp án đúng được chọn | Như mong đợi | Pass |
| 4 | Click nút "Lưu" | Hệ thống gửi request tạo câu hỏi | Như mong đợi | Pass |
| 5 | Quan sát thông báo | Hiển thị thông báo thành công | Như mong đợi | Pass |

---

## Test Case A013: Thêm mới Câu hỏi - Part 5 với đoạn văn đọc hiểu

**Test Case ID:** TC_A013  
**Test Case Description:** Kiểm tra thêm câu hỏi Part 5 có đoạn văn đọc hiểu  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đã chọn đề thi
2. Đang ở màn hình Ngân hàng câu hỏi

**Test Data:**
- Part: 5
- Question Number: 101
- Reading Passage: [Đoạn văn đọc hiểu dài]
- Answer A-D: Các đáp án
- Correct Answer: C

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Chọn Part = 5 | Form hiển thị ô Reading Passage | Như mong đợi | Pass |
| 2 | Nhập đoạn văn đọc hiểu | Đoạn văn được hiển thị trong textarea | Như mong đợi | Pass |
| 3 | Nhập các thông tin khác | Dữ liệu được hiển thị | Như mong đợi | Pass |
| 4 | Click nút "Lưu" | Hệ thống gửi request tạo câu hỏi | Như mong đợi | Pass |
| 5 | Quan sát danh sách | Câu hỏi mới với đoạn văn được lưu | Như mong đợi | Pass |

---

## Test Case A014: Chỉnh sửa Câu hỏi

**Test Case ID:** TC_A014  
**Test Case Description:** Kiểm tra chỉnh sửa câu hỏi đã tồn tại  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Câu hỏi đã tồn tại

**Test Data:**
- Correct Answer mới: D (thay đổi từ B)

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút "Sửa" trên câu hỏi | Hiển thị form chỉnh sửa với dữ liệu hiện tại | Như mong đợi | Pass |
| 2 | Thay đổi Correct Answer thành D | Đáp án đúng mới được chọn | Như mong đợi | Pass |
| 3 | Cập nhật Explanation | Giải thích mới được hiển thị | Như mong đợi | Pass |
| 4 | Click nút "Lưu" | Hệ thống gửi request cập nhật | Như mong đợi | Pass |
| 5 | Quan sát danh sách | Câu hỏi được cập nhật | Như mong đợi | Pass |

---

## Test Case A015: Xóa Câu hỏi

**Test Case ID:** TC_A015  
**Test Case Description:** Kiểm tra xóa câu hỏi  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Câu hỏi đã tồn tại

**Test Data:**
- Question ID: [ID câu hỏi]

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút "Xóa" trên câu hỏi | Hiển thị dialog xác nhận xóa | Như mong đợi | Pass |
| 2 | Xác nhận xóa | Hệ thống gửi request xóa câu hỏi | Như mong đợi | Pass |
| 3 | Quan sát thông báo | Hiển thị thông báo "Question deleted successfully" | Như mong đợi | Pass |
| 4 | Quan sát danh sách | Câu hỏi không còn xuất hiện trong danh sách | Như mong đợi | Pass |

---

## Test Case A016: Thêm mới Bộ từ vựng

**Test Case ID:** TC_A016  
**Test Case Description:** Kiểm tra thêm mới bộ từ vựng với thông tin cơ bản  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đăng nhập với tài khoản Admin hoặc Manager
2. Đang ở màn hình Quản lý bộ từ vựng

**Test Data:**
- Name: TOEIC Vocabulary 600
- Description: 600 từ vựng TOEIC cơ bản
- Price: 50000
- Access Type: paid

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút "Thêm bộ từ vựng" | Hiển thị form thêm/sửa bộ từ vựng | Như mong đợi | Pass |
| 2 | Nhập tên bộ từ vựng | Tên được hiển thị | Như mong đợi | Pass |
| 3 | Nhập mô tả | Mô tả được hiển thị | Như mong đợi | Pass |
| 4 | Nhập giá bán | Giá được hiển thị | Như mong đợi | Pass |
| 5 | Chọn quyền truy cập (paid) | Quyền truy cập được chọn | Như mong đợi | Pass |
| 6 | Click nút "Lưu" | Hệ thống gửi request tạo bộ từ vựng | Như mong đợi | Pass |
| 7 | Quan sát thông báo | Hiển thị thông báo thành công | Như mong đợi | Pass |

---

## Test Case A017: Thêm từ chi tiết vào Bộ từ vựng

**Test Case ID:** TC_A017  
**Test Case Description:** Kiểm tra thêm từ chi tiết với đầy đủ thông tin  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đang ở form thêm/sửa bộ từ vựng

**Test Data:**
- Term: Abandon
- Phonetic: /əˈbændən/
- Part of Speech: verb
- Meaning: Từ bỏ, bỏ rơi
- Example: He abandoned his car in the snow.
- Audio file: abandon.mp3

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Nhập từ (Term) | Từ được hiển thị | Như mong đợi | Pass |
| 2 | Nhập phiên âm | Phiên âm được hiển thị | Như mong đợi | Pass |
| 3 | Nhập loại từ | Loại từ được hiển thị | Như mong đợi | Pass |
| 4 | Nhập nghĩa | Nghĩa được hiển thị | Như mong đợi | Pass |
| 5 | Nhập ví dụ | Ví dụ được hiển thị | Như mong đợi | Pass |
| 6 | Upload file âm thanh | File được chọn | Như mong đợi | Pass |
| 7 | Click nút "Lưu" | Hệ thống lưu từ và upload file âm thanh | Như mong đợi | Pass |
| 8 | Quan sát danh sách | Từ mới xuất hiện trong danh sách từ | Như mong đợi | Pass |

---

## Test Case A018: Upload Thumbnail cho Bộ từ vựng

**Test Case ID:** TC_A018  
**Test Case Description:** Kiểm tra upload ảnh thumbnail cho bộ từ vựng  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đang ở form thêm/sửa bộ từ vựng

**Test Data:**
- File ảnh: thumbnail.jpg (dưới 5MB)

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút chọn thumbnail | Hiển thị dialog chọn file | Như mong đợi | Pass |
| 2 | Chọn file ảnh hợp lệ | File được chọn và preview hiển thị | Như mong đợi | Pass |
| 3 | Click nút "Lưu" | Hệ thống upload ảnh lên Cloud | Như mong đợi | Pass |
| 4 | Quan sát danh sách | Thumbnail được hiển thị trên card bộ từ vựng | Như mong đợi | Pass |

---

## Test Case A019: Xóa Bộ từ vựng - Xóa mềm

**Test Case ID:** TC_A019  
**Test Case Description:** Kiểm tra xóa mềm bộ từ vựng (ẩn thay vì xóa cứng)  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Bộ từ vựng đã tồn tại

**Test Data:**
- Vocabulary Set ID: [ID]

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút "Xóa" trên bộ từ vựng | Hiển thị dialog xác nhận xóa | Như mong đợi | Pass |
| 2 | Xác nhận xóa | Hệ thống thực hiện xóa mềm (ẩn bộ từ vựng) | Như mong đợi | Pass |
| 3 | Quan sát thông báo | Hiển thị thông báo thành công | Như mong đợi | Pass |
| 4 | Quan sát danh sách | Bộ từ vựng không còn hiển thị trong danh sách mặc định | Như mong đợi | Pass |
| 5 | Kiểm tra database | Bộ từ vựng vẫn tồn tại với isHidden = true | Như mong đợi | Pass |

---

## Test Case A020: Thêm mới Mã giảm giá - Loại %

**Test Case ID:** TC_A020  
**Test Case Description:** Kiểm tra thêm mã giảm giá theo phần trăm  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đăng nhập với tài khoản Admin hoặc Manager
2. Đang ở màn hình Quản lý mã giảm giá

**Test Data:**
- Code: SALE20
- Discount Type: percent
- Discount Percent: 20
- Minimum Order Value: 100000
- Max Uses: 100
- Max Uses Per User: 1
- Start Date: 2026-01-01
- End Date: 2026-12-31
- Scope: system

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút "Thêm mã giảm giá" | Hiển thị form thêm/sửa mã giảm giá | Như mong đợi | Pass |
| 2 | Nhập Code (SALE20) | Code được hiển thị (tự động uppercase) | Như mong đợi | Pass |
| 3 | Chọn Discount Type = percent | Loại giảm giá được chọn | Như mong đợi | Pass |
| 4 | Nhập Discount Percent = 20 | Giá trị % được hiển thị | Như mong đợi | Pass |
| 5 | Nhập Minimum Order Value = 100000 | Giá trị tối thiểu được hiển thị | Như mong đợi | Pass |
| 6 | Nhập Max Uses = 100 | Số lượt tối đa được hiển thị | Như mong đợi | Pass |
| 7 | Nhập Max Uses Per User = 1 | Giới hạn per user được hiển thị | Như mong đợi | Pass |
| 8 | Chọn Start Date và End Date | Ngày được chọn | Như mong đợi | Pass |
| 9 | Chọn Scope = system | Phạm vi áp dụng được chọn | Như mong đợi | Pass |
| 10 | Click nút "Lưu" | Hệ thống gửi request tạo mã giảm giá | Như mong đợi | Pass |
| 11 | Quan sát thông báo | Hiển thị thông báo thành công | Như mong đợi | Pass |

---

## Test Case A021: Thêm mới Mã giảm giá - Số tiền cố định

**Test Case ID:** TC_A021  
**Test Case Description:** Kiểm tra thêm mã giảm giá theo số tiền cố định  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Đang ở màn hình Quản lý mã giảm giá

**Test Data:**
- Code: FLAT50K
- Discount Type: fixed
- Fixed Amount: 50000
- Scope: exam_2026

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Chọn Discount Type = fixed | Loại giảm giá được chọn | Như mong đợi | Pass |
| 2 | Nhập Fixed Amount = 50000 | Số tiền cố định được hiển thị | Như mong đợi | Pass |
| 3 | Chọn Scope = exam_2026 | Phạm vi áp dụng được chọn (chỉ đề năm 2026) | Như mong đợi | Pass |
| 4 | Click nút "Lưu" | Hệ thống gửi request tạo mã giảm giá | Như mong đợi | Pass |
| 5 | Quan sát danh sách | Mã giảm giá mới xuất hiện với scope "Chỉ áp dụng cho đề năm 2026" | Như mong đợi | Pass |

---

## Test Case A022: Chỉnh sửa Mã giảm giá

**Test Case ID:** TC_A022  
**Test Case Description:** Kiểm tra chỉnh sửa mã giảm giá  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Mã giảm giá đã tồn tại

**Test Data:**
- Discount Percent mới: 30 (tăng từ 20)

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút "Sửa" trên mã giảm giá | Hiển thị form chỉnh sửa với dữ liệu hiện tại | Như mong đợi | Pass |
| 2 | Thay đổi Discount Percent thành 30 | Giá trị mới được hiển thị | Như mong đợi | Pass |
| 3 | Click nút "Lưu" | Hệ thống gửi request cập nhật | Như mong đợi | Pass |
| 4 | Quan sát thông báo | Hiển thị thông báo thành công | Như mong đợi | Pass |
| 5 | Quan sát danh sách | Mã giảm giá được cập nhật | Như mong đợi | Pass |

---

## Test Case A023: Xóa Mã giảm giá

**Test Case ID:** TC_A023  
**Test Case Description:** Kiểm tra xóa mã giảm giá  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Pass

**Prerequisites:**
1. Mã giảm giá đã tồn tại

**Test Data:**
- Coupon ID: [ID]

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Click nút "Xóa" trên mã giảm giá | Hiển thị dialog xác nhận xóa | Như mong đợi | Pass |
| 2 | Xác nhận xóa | Hệ thống thực hiện xóa mềm (ẩn mã giảm giá) | Như mong đợi | Pass |
| 3 | Quan sát thông báo | Hiển thị thông báo thành công | Như mong đợi | Pass |
| 4 | Quan sát danh sách | Mã giảm giá không còn hiển thị trong danh sách mặc định | Như mong đợi | Pass |

---

## Test Case A024: BUG - Tạo đề thi với giá âm

**Test Case ID:** TC_A024  
**Test Case Description:** BUG - Kiểm tra validation giá đề thi không cho phép số âm  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Fail (BUG)

**Prerequisites:**
1. Đang ở form thêm/sửa đề thi

**Test Data:**
- Name: TOEIC Test Invalid
- Price Bundle: -100000 (giá âm)
- Price Listening: -50000
- Price Reading: -50000

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Nhập giá Bundle = -100000 | Giá được hiển thị | Như mong đợi | Pass |
| 2 | Nhập giá Listening = -50000 | Giá được hiển thị | Như mong đợi | Pass |
| 3 | Nhập giá Reading = -50000 | Giá được hiển thị | Như mong đợi | Pass |
| 4 | Click nút "Lưu" | **Expected:** Hiển thị thông báo lỗi "Price must be greater than or equal to 0" <br> **Actual:** Đề thi được tạo thành công với giá âm (BUG) | Không như mong đợi | **Fail** |

**Bug Description:**  
Hệ thống không validate giá đề thi trước khi lưu. Giá âm được cho phép lưu vào database, điều này có thể gây lỗi khi tính toán doanh thu và thanh toán.

**Severity:** High  
**Priority:** High

---

## Test Case A025: BUG - Tạo mã giảm giá với ngày kết thúc trước ngày bắt đầu

**Test Case ID:** TC_A025  
**Test Case Description:** BUG - Kiểm tra validation ngày kết thúc phải sau ngày bắt đầu  
**Created By:** QA Team  
**Reviewed By:** QA Lead  
**Version:** 1.0  

**QA Tester's Log**
- **Tester's Name:** [Tên Tester]
- **Date Tested:** [Ngày test]
- **Test Case:** Fail (BUG)

**Prerequisites:**
1. Đang ở form thêm/sửa mã giảm giá

**Test Data:**
- Code: INVALIDDATE
- Start Date: 2026-12-31
- End Date: 2026-01-01 (ngày kết thúc trước ngày bắt đầu)

**Test Scenario:**

| Step # | Step Details | Expected Results | Actual Results | Pass/Fail |
|--------|--------------|------------------|----------------|-----------|
| 1 | Nhập Start Date = 2026-12-31 | Ngày được chọn | Như mong đợi | Pass |
| 2 | Nhập End Date = 2026-01-01 | Ngày được chọn | Như mong đợi | Pass |
| 3 | Click nút "Lưu" | **Expected:** Hiển thị thông báo lỗi "End date must be after start date" <br> **Actual:** Mã giảm giá được tạo thành công với ngày không hợp lệ (BUG) | Không như mong đợi | **Fail** |

**Bug Description:**  
Hệ thống không validate logic ngày tháng cho mã giảm giá. Cho phép ngày kết thúc trước ngày bắt đầu, khiến mã giảm giá không bao giờ có thể sử dụng được.

**Severity:** Medium  
**Priority:** Medium

---

## Tổng kết

- **Tổng số test case:** 25
- **Test case pass:** 23
- **Test case fail (có bug):** 2
- **Test case chưa thực hiện:** 0

**Phân tích theo module:**
1. **Dashboard Thống kê:** 4 test case (TC_A001 - TC_A004)
2. **Quản lý Đề thi:** 6 test case (TC_A005 - TC_A010)
3. **Ngân hàng câu hỏi:** 5 test case (TC_A011 - TC_A015)
4. **Quản lý Bộ từ vựng:** 4 test case (TC_A016 - TC_A019)
5. **Quản lý Mã giảm giá:** 4 test case (TC_A020 - TC_A023)

**Danh sách Bug:**
1. **TC_A024:** Không validate giá đề thi (cho phép giá âm) - Severity: High, Priority: High
2. **TC_A025:** Không validate ngày kết thúc mã giảm giá (cho phép end date < start date) - Severity: Medium, Priority: Medium
