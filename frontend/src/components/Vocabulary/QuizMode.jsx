import React, { useState, useEffect } from 'react';
import StudySummary from './StudySummary';

const QuizMode = ({ studyList, allVocabularies, onUpdateVocabStatus, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = studyList[currentIndex];

  useEffect(() => {
    if (currentWord) generateOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentWord]);

  const generateOptions = () => {
    // Sinh 3 đáp án sai ngẫu nhiên từ kho từ vựng
    const wrongOptions = allVocabularies
      .filter(item => item.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(item => item.meaning);
      
    // Gộp đáp án đúng và trộn thứ tự
    const options = [currentWord.meaning, ...wrongOptions].sort(() => 0.5 - Math.random());
    setQuizOptions(options);
    setSelectedAnswer(null);
  };

  const handleAnswer = (option) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    
    const isCorrect = option === currentWord.meaning;
    
    setTimeout(() => {
      if (isCorrect) onUpdateVocabStatus(currentWord.id, 'Đã thuộc');
      
      if (currentIndex < studyList.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  if (isFinished) return <StudySummary total={studyList.length} onExit={onExit} />;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onExit} className="text-gray-500 hover:text-gray-800 font-bold">← Thoát</button>
        <div className="flex items-center gap-3">
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(currentIndex / studyList.length) * 100}%` }}></div>
          </div>
          <div className="text-sm font-bold text-gray-400">{currentIndex + 1}/{studyList.length}</div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center mb-8">
        <span className="text-indigo-500 font-bold uppercase tracking-wider text-sm mb-2 block">Chọn nghĩa đúng của từ</span>
        <h3 className="text-5xl font-black text-gray-800">{currentWord?.word}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizOptions.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = opt === currentWord?.meaning;
          
          let btnClass = "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50";
          
          if (selectedAnswer) {
            if (isCorrect) btnClass = "border-green-500 bg-green-50 text-green-700 shadow-md ring-1 ring-green-500";
            else if (isSelected) btnClass = "border-red-400 bg-red-50 text-red-700";
            else btnClass = "border-gray-200 bg-white text-gray-400 opacity-50";
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(opt)}
              disabled={selectedAnswer !== null}
              className={`p-6 rounded-2xl border-2 text-left font-bold text-lg transition-all ${btnClass}`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default QuizMode;