

import React from 'react';

const StudySelection = ({ onStartStudy }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in text-center">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Lựa chọn chế độ ôn tập</h2>
      <p className="text-gray-500 font-medium mb-10 text-lg">Hệ thống sẽ lọc ra các từ vựng bạn <strong className="text-blue-600">"Đang học"</strong> để ôn tập.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          onClick={() => onStartStudy('flashcard')}
          className="bg-white p-10 rounded-3xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-6 group-hover:scale-110 transition-transform">🎴</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Lật thẻ (Flashcard)</h3>
          <p className="text-gray-500 font-medium">Ôn tập truyền thống bằng cách lật mặt thẻ để xem nghĩa. Phù hợp để ghi nhớ nhanh.</p>
        </div>

        <div 
          onClick={() => onStartStudy('quiz')}
          className="bg-white p-10 rounded-3xl shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-6 group-hover:scale-110 transition-transform">📝</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Trắc nghiệm (Quiz)</h3>
          <p className="text-gray-500 font-medium">Hệ thống tạo ra bài thi trắc nghiệm nhỏ với 4 đáp án để kiểm tra trí nhớ của bạn.</p>
        </div>
      </div>
    </div>
  );
};

export default StudySelection;
