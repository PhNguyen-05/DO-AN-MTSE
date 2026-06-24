import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ExamResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập dữ liệu kết quả
    setTimeout(() => {
      setResult({
        exam: { name: 'ETS TOEIC 2023 Mock Test', releaseYear: 2023 },
        attempt: {
          score: 850,
          timeSpent: 3600,
          answers: { 1: 'A', 101: 'A', 153: 'B' }
        },
        questions: [
          { 
            _id: 'q1', part: 1, questionNumber: 1, 
            questionText: 'Look at the picture.', 
            answers: { A: 'A', B: 'B', C: 'C', D: 'D' }, 
            correctAnswer: 'A', 
            explanation: 'A is correct because it matches the picture.' 
          },
          { 
            _id: 'q2', part: 5, questionNumber: 101, 
            questionText: 'The manager requested that all staff ------- the meeting.', 
            answers: { A: 'attend', B: 'attends', C: 'attended', D: 'attending' }, 
            correctAnswer: 'A', 
            explanation: 'Sau "requested that" động từ ở dạng nguyên thể.' 
          },
          { 
            _id: 'q3', part: 7, questionNumber: 153, 
            readingPassage: 'Mock reading passage here...', 
            questionText: 'What is the main idea?', 
            answers: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' }, 
            correctAnswer: 'B', 
            explanation: 'Đoạn văn nhấn mạnh vào Option B.' 
          },
        ]
      });
      setLoading(false);
    }, 800);
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tổng hợp kết quả...</p>
        </div>
      </div>
    );
  }

  const { attempt, questions, exam } = result;
  const correctCount = questions.filter(q => attempt.answers?.[q.questionNumber] === q.correctAnswer).length;
  const accuracy = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Score Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 text-white p-12 text-center relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">Kết quả bài thi</h1>
              <p className="text-xl opacity-90">{exam.name} • {exam.releaseYear}</p>
            </div>
          </div>

          {/* Big Score Circle */}
          <div className="flex justify-center -mt-16 relative z-20 mb-8">
            <div className="w-52 h-52 rounded-full border-[14px] border-white bg-white shadow-2xl flex flex-col items-center justify-center">
              <div className="text-7xl font-black text-blue-600 tracking-tighter">{attempt.score}</div>
              <div className="text-sm font-semibold text-gray-400 -mt-2">/ 990</div>
              <div className="mt-3 text-2xl font-bold text-emerald-500">{accuracy}%</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 px-10 pb-10">
            <div className="text-center bg-green-50 rounded-2xl p-6">
              <div className="text-5xl font-black text-green-600 mb-1">{correctCount}</div>
              <div className="text-green-700 font-medium">Câu đúng</div>
              <div className="text-xs text-gray-500">/{questions.length}</div>
            </div>
            
            <div className="text-center bg-blue-50 rounded-2xl p-6">
              <div className="text-5xl font-black text-blue-600 mb-1">{accuracy}</div>
              <div className="text-blue-700 font-medium">Độ chính xác</div>
              <div className="text-xs text-gray-500">%</div>
            </div>
            
            <div className="text-center bg-orange-50 rounded-2xl p-6">
              <div className="text-5xl font-black text-orange-600 mb-1">
                {Math.floor(attempt.timeSpent / 60)}
              </div>
              <div className="text-orange-700 font-medium">Phút hoàn thành</div>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="bg-white rounded-3xl shadow p-10">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            📝 Xem lại chi tiết
          </h2>

          <div className="space-y-8">
            {questions.map((q, index) => {
              const userAnswer = attempt.answers?.[q.questionNumber];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div key={q._id} className="border border-gray-100 rounded-2xl p-8 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-bold text-xl">Câu {q.questionNumber}</span>
                    <span className="px-4 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full">
                      Part {q.part}
                    </span>
                    <span className={`px-5 py-1 text-sm font-bold rounded-full ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isCorrect ? '✓ Đúng' : '✕ Sai'}
                    </span>
                  </div>

                  {q.readingPassage && (
                    <div className="bg-gray-50 p-6 rounded-xl mb-6 text-sm leading-relaxed border-l-4 border-gray-300">
                      {q.readingPassage}
                    </div>
                  )}

                  <h4 className="font-medium text-lg mb-6 leading-relaxed">{q.questionText}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const isUserChoice = userAnswer === opt;
                      const isRightAnswer = q.correctAnswer === opt;

                      return (
                        <div
                          key={opt}
                          className={`p-5 rounded-2xl border-2 transition-all ${
                            isRightAnswer 
                              ? 'border-green-500 bg-green-50' 
                              : isUserChoice 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-gray-200'
                          }`}
                        >
                          <strong className="font-bold">{opt}.</strong> {q.answers[opt]}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">💡</span>
                      <strong className="text-blue-900">Giải thích chi tiết</strong>
                    </div>
                    <p className="text-blue-800 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/exams"
            className="px-10 py-4 border-2 border-gray-300 rounded-2xl font-semibold hover:bg-gray-50 transition text-center"
          >
            ← Về danh sách đề thi
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition shadow-md"
          >
            Làm lại bài thi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResult;