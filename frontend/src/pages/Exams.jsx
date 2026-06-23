import React from 'react';
import AcademicLayout from '../components/AcademicLayout.jsx';

export default function Exams() {
  return (
    <AcademicLayout>
      <div>
        <div className="academic-panel">
          <h2>Đề thi</h2>
          <p>Danh sách các đề thi, bộ lọc và chi tiết nằm ở đây.</p>
        </div>

        <div className="academic-section">
          <div className="academic-section-heading"><div><h3>Top đề thi</h3><p>Danh sách đề thi nổi bật</p></div></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
            <div className="academic-product-card">Ví dụ đề thi 1</div>
            <div className="academic-product-card">Ví dụ đề thi 2</div>
            <div className="academic-product-card">Ví dụ đề thi 3</div>
          </div>
        </div>
      </div>
    </AcademicLayout>
  );
}
