import React from 'react';
import AcademicLayout from '../components/AcademicLayout.jsx';

export default function Cart() {
  return (
    <AcademicLayout>
      <div>
        <div className="academic-panel">
          <h2>Giỏ hàng</h2>
          <p>Hiển thị các mục người dùng thêm vào giỏ.</p>
        </div>

        <div className="academic-section">
          <div className="academic-panel">Giỏ hàng hiện tại rỗng.</div>
        </div>
      </div>
    </AcademicLayout>
  );
}
