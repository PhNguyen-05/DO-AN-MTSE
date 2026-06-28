import React from "react";
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function AcademicLayout({ children, onSearch, searchValue }) {
  return (
    <div className="academic-shell">
      <Header onSearch={onSearch} searchValue={searchValue} />

      <main className="academic-main">
        <div className="academic-content">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
