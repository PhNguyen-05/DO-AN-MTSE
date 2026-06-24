import React, { useState } from 'react';
import StudySummary from './StudySummary';

const FlashcardMode = ({ studyList, onUpdateVocabStatus, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = studyList[currentIndex];

  const handleNextItem = (known) => {
    if (known) onUpdateVocabStatus(currentWord.id, 'Đã thuộc');
    
    if (currentIndex < studyList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) return <StudySummary total={studyList.length} onExit={onExit} />;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onExit} className="text-gray-500 hover:text-gray-800 font-bold">← Thoát</button>
        <div className="text-lg font-bold text-gray-400">Từ {currentIndex + 1} / {studyList.length}</div>
      </div>

      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full h-[400px] cursor-pointer"
        style={{ perspective: '1000px' }}
      >
        <div 
          className="absolute inset-0 w-full h-full transition-all duration-500 rounded-3xl shadow-lg border border-gray-100 bg-white flex flex-col items-center justify-center p-10 text-center"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Mặt trước */}
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-10" style={{ backfaceVisibility: 'hidden' }}>
            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold mb-6">{currentWord.type}</span>
            <h3 className="text-5xl font-black text-blue-900 mb-4">{currentWord.word}</h3>
            <p className="text-xl text-gray-400 font-medium">{currentWord.phonetic}</p>
            <div className="absolute bottom-8 text-gray-400 text-sm animate-pulse">Nhấp để lật thẻ</div>
          </div>
          
          {/* Mặt sau */}
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-10" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <h3 className="text-3xl font-bold text-gray-800 mb-6">{currentWord.meaning}</h3>
            <div className="p-4 bg-gray-50 rounded-xl w-full">
              <p className="text-gray-600 font-medium italic text-lg text-center">"{currentWord.example}"</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex gap-4 mt-8 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNextItem(false); }}
          className="flex-1 py-4 bg-white border-2 border-orange-200 text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all"
        >❌ Vẫn chưa thuộc</button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNextItem(true); }}
          className="flex-1 py-4 bg-green-500 text-white rounded-xl font-bold text-lg shadow-md hover:bg-green-600 transition-all"
        >✅ Đã ghi nhớ</button>
      </div>
    </div>
  );
};

export default FlashcardMode;
