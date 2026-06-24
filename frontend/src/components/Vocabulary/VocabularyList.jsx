import React from 'react';

const VocabularyList = ({ vocabularies }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sổ tay từ vựng cá nhân</h2>
          <p className="text-gray-500 mt-1 font-medium">Bạn đang có {vocabularies.length} từ vựng trong danh sách</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="font-bold text-gray-700">{vocabularies.filter(v=>v.status === 'Đang học').length} Đang học</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="font-bold text-gray-700">{vocabularies.filter(v=>v.status === 'Đã thuộc').length} Đã thuộc</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vocabularies.map(v => (
          <div key={v.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${v.status === 'Đã thuộc' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <div className="flex justify-between items-start mb-3 pl-2">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{v.word}</h3>
                <span className="text-sm text-gray-500">{v.phonetic}</span>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded-lg border 
                ${v.status === 'Đã thuộc' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {v.status}
              </span>
            </div>
            <p className="text-gray-700 font-medium pl-2 mb-3">{v.meaning}</p>
            <p className="text-gray-500 text-sm italic pl-2 border-l-2 border-gray-100">"{v.example}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VocabularyList;
