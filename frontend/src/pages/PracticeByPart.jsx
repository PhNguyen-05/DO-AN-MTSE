import React, { useState, useEffect } from 'react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';

// Dữ liệu cấu trúc các Part trong TOEIC
const TOEIC_PARTS = {
  Listening: [
    { id: 1, name: 'Mô tả tranh', type: 'Photographs', qCount: 6, icon: '🖼️', color: 'from-blue-500 to-cyan-500' },
    { id: 2, name: 'Hỏi đáp', type: 'Question-Response', qCount: 25, icon: '💬', color: 'from-indigo-500 to-blue-600' },
    { id: 3, name: 'Hội thoại ngắn', type: 'Conversations', qCount: 39, icon: '👥', color: 'from-violet-500 to-purple-600' },
    { id: 4, name: 'Bài nói ngắn', type: 'Short Talks', qCount: 30, icon: '🎙️', color: 'from-fuchsia-500 to-pink-600' },
  ],
  Reading: [
    { id: 5, name: 'Điền từ vào câu', type: 'Incomplete Sentences', qCount: 30, icon: '✍️', color: 'from-emerald-500 to-teal-500' },
    { id: 6, name: 'Điền từ đoạn văn', type: 'Text Completion', qCount: 16, icon: '📄', color: 'from-green-500 to-emerald-600' },
    { id: 7, name: 'Đọc hiểu đoạn văn', type: 'Reading Comprehension', qCount: 54, icon: '📖', color: 'from-amber-500 to-orange-500' },
  ]
};

// Mock data câu hỏi khi user bấm vào luyện tập
const MOCK_QUESTIONS = [
  {
    _id: 'p1',
    part: 5,
    questionNumber: 101,
    questionText: 'The new software will help us track our inventory more -------.',
    options: { A: 'efficiency', B: 'efficiently', C: 'efficient', D: 'efficiencies' },
    correctAnswer: 'B',
    explanation: 'Chỗ trống cần một trạng từ (adverb) để bổ nghĩa cho động từ "track" (theo dõi). Đáp án (B) efficiently (một cách hiệu quả) là trạng từ duy nhất.'
  },
  {
    _id: 'p2',
    part: 5,
    questionNumber: 102,
    questionText: 'Please ensure that all ------- are submitted by the end of the day.',
    options: { A: 'reports', B: 'reporting', C: 'reported', D: 'report' },
    correctAnswer: 'A',
    explanation: 'Sau "all" (tất cả) cần một danh từ số nhiều đếm được. Đáp án (A) reports (các báo cáo) là phù hợp nhất về ngữ pháp và ngữ nghĩa.'
  },
  {
    _id: 'p3',
    part: 5,
    questionNumber: 103,
    questionText: '------- the heavy rain, the outdoor concert was not canceled.',
    options: { A: 'Because', B: 'Although', C: 'Despite', D: 'However' },
    correctAnswer: 'C',
    explanation: '"the heavy rain" là một cụm danh từ. "Despite" (Mặc dù) + Cụm danh từ. Nghĩa: Mặc dù trời mưa to, buổi hòa nhạc ngoài trời vẫn không bị hủy.'
  }
];

const PracticeByPart = () => {
  const [activeSkill, setActiveSkill] = useState('Listening');
  
  // State quản lý phiên luyện tập
  const [activePart, setActivePart] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});

  const startPractice = (partId) => {
    // Gọi API: GET /api/questions/practice?part={partId}
    setActivePart(partId);
    
    // Giả lập load câu hỏi (ở đây mình mock dùng chung cho demo)
    const mockQs = MOCK_QUESTIONS.map(q => ({ ...q, part: partId, questionNumber: q.questionNumber + (partId * 100) }));
    setQuestions(mockQs);
    setCurrentIndex(0);
    setUserAnswers({});
    setShowExplanation({});
  };

  const handleAnswerSelect = (qId, option) => {
    if (userAnswers[qId]) return; // Không cho chọn lại nếu đã trả lời
    
    setUserAnswers(prev => ({ ...prev, [qId]: option }));
    // Tự động hiện giải thích sau khi chọn đáp án ở chế độ Practice
    setShowExplanation(prev => ({ ...prev, [qId]: true }));
  };

  const exitPractice = () => {
    const confirm = window.confirm('Bạn có chắc muốn thoát phiên luyện tập này? Tiến trình sẽ không được lưu.');
    if (confirm) {
      setActivePart(null);
    }
  };

  // ================= RENDER GIAO DIỆN CHỌN PHẦN =================
  if (!activePart) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 animate-fade-in">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-gray-800">Luyện tập theo kỹ năng</h1>
            <p className="text-gray-500 mt-2 font-medium text-lg">Tập trung khắc phục điểm yếu của bạn bằng cách luyện từng phần cụ thể.</p>
          </div>

          {/* Toggle Listening / Reading */}
          <div className="flex bg-gray-200/60 p-1.5 rounded-2xl w-full max-w-md mb-10 shadow-inner">
            <button
              onClick={() => setActiveSkill('Listening')}
              className={`flex-1 py-3.5 rounded-xl font-bold text-lg transition-all ${
                activeSkill === 'Listening' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎧 Listening
            </button>
            <button
              onClick={() => setActiveSkill('Reading')}
              className={`flex-1 py-3.5 rounded-xl font-bold text-lg transition-all ${
                activeSkill === 'Reading' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              📖 Reading
            </button>
          </div>

          {/* Danh sách các Part */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOEIC_PARTS[activeSkill].map((part) => (
              <div 
                key={part.id} 
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group cursor-pointer flex flex-col"
                onClick={() => startPractice(part.id)}
              >
                <div className={`h-32 bg-gradient-to-br ${part.color} p-6 flex flex-col justify-between relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-150 transition-transform duration-700"></div>
                  <span className="text-4xl relative z-10">{part.icon}</span>
                  <div className="relative z-10">
                    <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm">
                      Part {part.id}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{part.name}</h3>
                  <p className="text-gray-500 text-sm font-medium mb-6">{part.type}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-lg text-sm">
                      {part.qCount} câu hỏi
                    </span>
                    <button className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                      Luyện ngay →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Mẹo học tập</h4>
              <p className="text-blue-800 text-sm font-medium">Hệ thống sẽ cung cấp đáp án và giải thích chi tiết ngay sau mỗi câu trả lời để bạn rút kinh nghiệm lập tức. Đừng ngại chọn những Part mà bạn thấy khó nhất!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER GIAO DIỆN LUYỆN TẬP (PRACTICE MODE) =================
  const currentQ = questions[currentIndex];
  const qId = currentQ?._id;
  const userAnswer = userAnswers[qId];
  const isCorrect = userAnswer === currentQ?.correctAnswer;
  const isShowExplanation = showExplanation[qId];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col animate-fade-in">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={exitPractice} className="text-gray-400 hover:text-red-500 font-bold text-2xl transition-colors" title="Thoát">✕</button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Luyện tập Part {activePart}</h1>
              <p className="text-xs text-gray-500 font-medium">Chế độ xem ngay đáp án</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-gray-500">
              Tiến độ: <span className="text-blue-600">{Object.keys(userAnswers).length}</span> / {questions.length}
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-gray-200">
          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Main Practice Area */}
      <div className="max-w-4xl mx-auto w-full px-6 py-8 flex-1">
        {currentQ && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">
                Câu hỏi {currentQ.questionNumber}
              </span>
              
              {userAnswer && (
                <span className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {isCorrect ? '✅ Trả lời đúng' : '❌ Trả lời sai'}
                </span>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 leading-relaxed">{currentQ.questionText}</h3>
            </div>

            {/* Danh sách lựa chọn */}
            <div className="space-y-4 mb-8">
              {['A', 'B', 'C', 'D'].map(optKey => {
                const isSelected = userAnswer === optKey;
                const isActualCorrect = currentQ.correctAnswer === optKey;
                
                // Logic hiển thị màu sắc:
                // Nếu chưa trả lời -> Trắng/Xám
                // Nếu đã trả lời: 
                //   - Nút là đáp án đúng -> Màu xanh (dù user có chọn hay không để cho user biết đáp án)
                //   - Nút là user chọn mà bị sai -> Màu đỏ
                let btnStyle = "border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-gray-700 cursor-pointer";
                let iconColor = "bg-gray-100 text-gray-500";

                if (userAnswer) {
                  btnStyle = "border-gray-200 bg-white opacity-60 cursor-default"; // Default mờ đi
                  
                  if (isActualCorrect) {
                    btnStyle = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500 shadow-sm opacity-100";
                    iconColor = "bg-green-500 text-white";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "border-red-400 bg-red-50 text-red-800 opacity-100";
                    iconColor = "bg-red-500 text-white";
                  }
                }

                return (
                  <button
                    key={optKey}
                    onClick={() => handleAnswerSelect(qId, optKey)}
                    disabled={!!userAnswer}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${btnStyle}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-colors ${iconColor}`}>
                      {optKey}
                    </div>
                    <span className="text-lg pt-0.5 font-medium">
                      {currentQ.options[optKey]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Khối Giải thích xuất hiện sau khi trả lời */}
            {isShowExplanation && (
              <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">💡</span>
                  <strong className="text-blue-900 text-lg">Giải thích chi tiết:</strong>
                </div>
                <p className="text-blue-800 leading-relaxed font-medium ml-8">{currentQ.explanation}</p>
                
                {/* Nút đánh dấu sao câu khó (tích hợp) */}
                <div className="mt-4 ml-8">
                   <button className="flex items-center gap-2 px-4 py-2 bg-white text-orange-500 font-bold border border-orange-200 rounded-lg shadow-sm hover:bg-orange-50 transition-colors">
                     <span>★</span> Lưu câu hỏi khó
                   </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Controls Chuyển câu */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-8 py-3.5 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            ← Câu trước
          </button>
          
          {currentIndex === questions.length - 1 && !!userAnswer ? (
             <button
             onClick={exitPractice}
             className="px-8 py-3.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-md"
           >
             Hoàn thành phần này ✓
           </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1 || !userAnswer}
              className={`px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm ${
                !userAnswer 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-transparent' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
              }`}
            >
              Câu tiếp theo →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeByPart;