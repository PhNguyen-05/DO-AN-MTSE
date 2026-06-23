import React from 'react';
import AcademicLayout from '../components/AcademicLayout.jsx';

export default function Blog() {
  return (
    <AcademicLayout>
      <div>
        <div className="academic-panel">
          <h2>Bài viết tin tức</h2>
          <p>Danh sách bài viết, tin tức và mẹo học tập.</p>
        </div>

        <div className="academic-section">
          <ul>
            <li className="academic-panel">Bài viết mẫu 1</li>
            <li className="academic-panel">Bài viết mẫu 2</li>
          </ul>
        </div>
      </div>
    </AcademicLayout>
  );
}
