import React, { useState, useEffect } from 'react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';

const BookmarkedQuestions = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPart, setFilterPart] = useState('All');

  // Dữ liệu giả lập (Mock Data) - Sau này thay bằng API: GET /api/users/bookmarked-questions
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setBookmarks([
        {
          _id: 'q1',
          examName: 'ETS TOEIC 2023 Test 1',
          part: 5,
          questionNumber: 101,
          questionText: 'The new software will help us track our inventory more -------.',
          options: {
            A: 'efficiency',
            B: 'efficiently',
            C: 'efficient',
            D: 'efficiencies'
          },
          correctAnswer: 'B',
          explanation: 'Chỗ trống cần một trạng từ (adverb) để bổ nghĩa cho động từ "track" (theo dõi). Đáp án (B) efficiently (một cách hiệu quả) là trạng từ duy nhất.',
          bookmarkedAt: '2026-06-20T10:30:00Z'
        },
        {
          _id: 'q2',
          examName: 'ETS TOEIC 2023 Test 2',
          part: 7,
          questionNumber: 153,
          readingPassage: 'Dear Mr. Smith,\n\nWe are pleased to inform you that your application for the Marketing Director position has been successful. Please review the attached contract and return it by Friday.\n\nBest regards,\nHR Department',
          questionText: 'What is the purpose of the email?',
          options: {
            A: 'To schedule an interview',
            B: 'To offer a job position',
            C: 'To request additional documents',
            D: 'To announce a new product'
          },
          correctAnswer: 'B',
          explanation: 'Câu đầu tiên đề cập: "your application... has been successful" (đơn ứng tuyển của bạn đã thành công). Do đó, mục đích của email là để mời nhận việc (offer a job position).',
          bookmarkedAt: '2026-06-22T14:15:00Z'
        },
        {
          _id: 'q3',
          examName: 'Hacker New TOEIC 2',
          part: 2,
          questionNumber: 15,
          audioUrl: true, // Biểu thị có audio
          questionText: 'Where is the nearest subway station?',
          options: {
            A: 'About a ten-minute walk from here.',
            B: 'Yes, it departs at 5 PM.',
            C: 'I bought a new ticket.'
          },
          correctAnswer: 'A',
          explanation: 'Câu hỏi hỏi về "Where" (Ở đâu). Đáp án (A) chỉ khoảng cách/địa điểm (Đi bộ khoảng 10 phút từ đây) là phản hồi hợp lý nhất.',
          bookmarkedAt: '2026-06-23T09:00:00Z'
        }
      ]);
      setLoading(false);
    }, 600);
  }, []);

  // Hàm xử lý bỏ đánh dấu (Gỡ sao)
  const handleRemoveBookmark = (id) => {
    // API Call: DELETE /api/users/bookmarks/:id
    const confirmRemove = window.confirm("Bạn có chắc muốn bỏ lưu câu hỏi này không?");
    if (confirmRemove) {
      setBookmarks(prev => prev.filter(item => item._id !== id));
    }
  };

  const filteredBookmarks = filterPart === 'All' 
    ? bookmarks 
    : bookmarks.filter(q => q.part === parseInt(filterPart));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-500 font-medium flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Đang tải câu hỏi khó...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              <span className="text-orange-500">★</span> Ôn tập câu hỏi khó
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Xem lại đáp án và lời giải chi tiết cho các câu bạn đã đánh dấu.</p>
          </div>
          <Link to="/exams" className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all">
            ← Về kho đề thi
          </Link>
        </div>

        {/* Filter Bộ lọc */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-2">
          <span className="py-2.5 px-4 font-bold text-gray-500 mr-2">Lọc theo:</span>
          {['All', '1', '2', '3', '4', '5', '6', '7'].map(part => (
            <button
              key={part}
              onClick={() => setFilterPart(part)}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                filterPart === part 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
            >
              {part === 'All' ? 'Tất cả' : `Part ${part}`}
            </button>
          ))}
        </div>

        {/* Danh sách câu hỏi */}
        {filteredBookmarks.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-6 grayscale opacity-60">⭐</div>
            <h3 className="text-2xl text-gray-800 font-bold mb-3">Chưa có câu hỏi nào ở đây</h3>
            <p className="text-gray-500">Hãy nhấn nút ngôi sao (★) khi làm bài thi để lưu lại những câu bạn thấy khó nhé.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredBookmarks.map((q) => (
              <div key={q._id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors animate-fade-in">
                
                {/* Header Câu hỏi */}
                <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-lg text-sm font-bold border border-indigo-200">
                      Part {q.part}
                    </span>
                    <span className="font-black text-xl text-gray-800">Câu {q.questionNumber}</span>
                    <span className="hidden sm:inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">
                      {q.examName}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveBookmark(q._id)}
                    title="Bỏ lưu câu hỏi này"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-bold border border-orange-200 hover:bg-orange-100 transition-all"
                  >
                    <span className="text-xl">★</span> <span className="hidden sm:inline">Bỏ lưu</span>
                  </button>
                </div>

                <div className="p-8">
                  {/* Nội dung bổ sung (Đoạn văn / Audio) */}
                  {q.audioUrl && (
                    <div className="mb-6 p-4 bg-violet-50 border border-violet-100 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-200 rounded-full flex items-center justify-center text-violet-700">🎧</div>
                      <span className="font-bold text-violet-900">Audio Playback (Dữ liệu mẫu không phát âm thanh)</span>
                    </div>
                  )}

                  {q.readingPassage && (
                    <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="prose max-w-none text-gray-700 font-medium whitespace-pre-line leading-relaxed">
                        {q.readingPassage}
                      </div>
                    </div>
                  )}

                  {/* Câu hỏi */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">{q.questionText}</h3>
                  </div>

                  {/* Danh sách đáp án */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {Object.keys(q.options).map(optKey => {
                      const isCorrect = optKey === q.correctAnswer;
                      return (
                        <div 
                          key={optKey} 
                          className={`p-4 rounded-xl border-2 flex items-start gap-4 ${
                            isCorrect 
                              ? 'border-green-500 bg-green-50 shadow-sm ring-1 ring-green-500' 
                              : 'border-gray-100 bg-white'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                            isCorrect ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {optKey}
                          </div>
                          <span className={`text-lg pt-0.5 ${isCorrect ? 'text-green-900 font-bold' : 'text-gray-600 font-medium'}`}>
                            {q.options[optKey]}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Lời giải thích */}
                  <div className="p-6 bg-blue-50/80 border border-blue-100 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">💡</span>
                      <strong className="text-blue-900 text-lg">Giải thích chi tiết:</strong>
                    </div>
                    <p className="text-blue-800 leading-relaxed font-medium ml-8">{q.explanation}</p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkedQuestions;