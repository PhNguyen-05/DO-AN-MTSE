import React from 'react';
import AcademicLayout from '../components/AcademicLayout.jsx';

export default function Vocabulary() {
  return (
    <AcademicLayout>
      <div>
        <div className="academic-panel">
          <h2>Từ vựng</h2>
          <p>Danh sách từ vựng, bài học và bộ lọc.</p>
        </div>

        <div className="academic-section">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
            <div className="academic-product-card">Từ vựng 1</div>
            <div className="academic-product-card">Từ vựng 2</div>
            <div className="academic-product-card">Từ vựng 3</div>
          </div>
        </div>
      </div>
    </AcademicLayout>
  );
}
