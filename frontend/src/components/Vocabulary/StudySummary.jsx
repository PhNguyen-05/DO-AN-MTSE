import React from 'react';

const StudySummary = ({ total, onExit }) => (
  <div className="max-w-lg mx-auto text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
    <div className="text-7xl mb-6">🎉</div>
    <h2 className="text-3xl font-bold text-gray-800 mb-4">Hoàn thành phiên ôn tập!</h2>
    <p className="text-gray-500 font-medium text-lg mb-8">
      Bạn vừa ôn lại thành công <strong className="text-green-600">{total}</strong> từ vựng. Hãy duy trì thói quen này mỗi ngày nhé.
    </p>
    <button 
      onClick={onExit} 
      className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
    >
      Quay lại Menu
    </button>
  </div>
);

export default StudySummary;