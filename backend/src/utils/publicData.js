// Giả lập truy vấn dữ liệu công khai từ database
exports.getPublicData = async (query) => {
  // TODO: Thay bằng truy vấn MongoDB thực tế, chỉ lấy dữ liệu công khai
  if (/đề thi/i.test(query)) {
    return 'Website có hơn 500 đề thi thử TOEIC sát thực tế, bạn vào mục "Đề thi thử" để luyện tập.';
  }
  if (/từ vựng/i.test(query)) {
    return 'Bạn có thể ôn tập từ vựng theo chủ đề, hệ thống sẽ gợi ý các từ quan trọng cho từng phần thi.';
  }
  if (/kết quả/i.test(query)) {
    return 'Bạn có thể xem kết quả các bài thi thử của mình tại trang "Kết quả" sau khi đăng nhập.';
  }
  return 'Dữ liệu bạn hỏi hiện chưa có trong hệ thống công khai.';
};
