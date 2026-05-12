const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <h5 className="fw-bold text-white mb-3">TOEIC Luyện Thi</h5>
            <p className="text-light-50">
              Nền tảng luyện thi TOEIC hàng đầu Việt Nam.<br />
              Giúp bạn chinh phục mục tiêu điểm số một cách hiệu quả và khoa học.
            </p>
          </div>

          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold text-white mb-3">Khóa học</h6>
            <ul className="list-unstyled text-light-50">
              <li className="mb-2">TOEIC 500+</li>
              <li className="mb-2">TOEIC 700+</li>
              <li className="mb-2">TOEIC 900+</li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold text-white mb-3">Hỗ trợ</h6>
            <ul className="list-unstyled text-light-50">
              <li className="mb-2">Câu hỏi thường gặp</li>
              <li className="mb-2">Liên hệ</li>
              <li className="mb-2">Chính sách bảo mật</li>
            </ul>
          </div>

          <div className="col-lg-4 mb-4">
            <h6 className="fw-bold text-white mb-3">Liên hệ</h6>
            <p className="mb-1 text-light-50"><i className="bi bi-telephone"></i> Hotline: 090.861.7108</p>
            <p className="mb-1 text-light-50"><i className="bi bi-envelope"></i> toeic@hcmute.edu.vn</p>
            <p className="text-light-50"><i className="bi bi-geo-alt"></i> TP. Hồ Chí Minh</p>
          </div>
        </div>

        <hr className="border-secondary" />
        <div className="text-center text-light-50 small">
          © 2026 TOEIC Luyện Thi - All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;