import React, { useState } from 'react';

const VocabularyTranslate = ({ onSaveToNotebook }) => {
  const [searchWord, setSearchWord] = useState('');
  const [translatedResult, setTranslatedResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = (e) => {
    e.preventDefault();
    if (!searchWord.trim()) return;
    
    setIsTranslating(true);
    // TODO: Thay bằng API phiên dịch thật (Google Translate API / Dictionary API)
    setTimeout(() => {
      setTranslatedResult({
        word: searchWord,
        phonetic: `/${searchWord.toLowerCase().slice(0,3)}.../`,
        type: 'Noun/Verb',
        meaning: `(Nghĩa giả lập của từ "${searchWord}")`,
        example: `This is a mock example for ${searchWord}.`
      });
      setIsTranslating(false);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>🌍</span> Phiên dịch & Thêm từ mới
        </h2>
        
        <form onSubmit={handleTranslate} className="flex gap-4 mb-8">
          <input 
            type="text" 
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="Nhập từ tiếng Anh cần tra..."
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 text-lg rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-6 py-4 font-medium transition-all"
            required
          />
          <button 
            type="submit" 
            disabled={isTranslating}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {isTranslating ? 'Đang tra...' : '🔍 Tra từ'}
          </button>
        </form>

        {translatedResult && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 relative">
            <button 
              onClick={() => setTranslatedResult(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all font-bold"
            >✕</button>
            <div className="flex items-baseline gap-4 mb-4">
              <h3 className="text-4xl font-extrabold text-blue-900">{translatedResult.word}</h3>
              <span className="text-xl text-blue-600 font-medium">{translatedResult.phonetic}</span>
              <span className="px-3 py-1 bg-white text-blue-600 text-sm font-bold rounded-lg border border-blue-200">{translatedResult.type}</span>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Nghĩa tiếng Việt</p>
              <p className="text-2xl font-bold text-gray-800">{translatedResult.meaning}</p>
            </div>
            
            <div className="mb-8 p-4 bg-white rounded-xl border border-blue-100">
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Ví dụ</p>
              <p className="text-gray-700 font-medium italic">"{translatedResult.example}"</p>
            </div>

            <button 
              onClick={() => {
                onSaveToNotebook(translatedResult);
                setTranslatedResult(null);
                setSearchWord('');
              }}
              className="w-full py-4 bg-green-500 text-white font-bold rounded-xl shadow-md hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-lg"
            >
              <span>+</span> Thêm vào sổ tay của tôi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyTranslate;


