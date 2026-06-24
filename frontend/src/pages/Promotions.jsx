import React from 'react';
import AcademicLayout from '../components/AcademicLayout.jsx';

export default function Promotions() {
  return (
    <AcademicLayout>
      <div>
        <div className="academic-panel">
          <h2>Khuyến mãi</h2>
          <p>Danh sách khuyến mãi và mã giảm giá.</p>
        </div>

        <div className="academic-section">
          <div className="academic-all-products">
            <div className="academic-panel">Ưu đãi 1</div>
            <div className="academic-panel">Ưu đãi 2</div>
          </div>
        </div>
      </div>
    </AcademicLayout>
  );
}
