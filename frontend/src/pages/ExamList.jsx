
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [userAttempts, setUserAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  // Dữ liệu user (có thể lấy từ Redux)
  const isPremium = user?.account_type === 'Premium' || true; // giả lập Premium

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Mock data đề thi
        const mockExams = [
          { 
            _id: 'exam_01', 
            name: 'ETS TOEIC 2023 Test 1', 
            releaseYear: 2023, 
            difficulty: 'medium', 
            pdfUrl: true, 
            audioUrls: ['audio1.mp3'] 
          },
          { 
            _id: 'exam_02', 
            name: 'ETS TOEIC 2023 Test 2', 
            releaseYear: 2023, 
            difficulty: 'hard', 
            pdfUrl: true, 
            audioUrls: ['audio2.mp3'] 
          },
          { 
            _id: 'exam_03', 
            name: 'Hacker New TOEIC 2024 Full Test', 
            releaseYear: 2024, 
            difficulty: 'hard', 
            pdfUrl: true, 
            audioUrls: ['audio3.mp3'] 
          },
        ];

        setExams(mockExams);

        // Mock lịch sử làm bài
        const mockAttempts = {
          'exam_01': { 
            count: 4, 
            bestScore: 875, 
            lastAttempt: new Date(Date.now() - 100000000).toISOString(), 
            lastScore: 850,
            lastAttemptId: 'att_001'
          },
          'exam_02': { 
            count: 1, 
            bestScore: 720, 
            lastAttempt: new Date().toISOString(), 
            lastScore: 720,
            lastAttemptId: 'att_002'
          }
        };

        setUserAttempts(mockAttempts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách đề thi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-6 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Kho Đề Thi TOEIC</h1>
        <p className="text-gray-600 mt-2 text-lg">Chọn đề thi và bắt đầu luyện tập ngay hôm nay</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {exams.map((exam) => {
          const attemptInfo = userAttempts[exam._id];
          const isLocked = !isPremium && exam.releaseYear >= 2024;

          return (
            <div 
              key={exam._id} 
              className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Header Card */}
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              
              <div className="p-7 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 leading-tight">{exam.name}</h3>
                    <p className="text-gray-500 mt-1">Năm {exam.releaseYear}</p>
                  </div>
                  
                  <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-widest
                    ${exam.difficulty === 'hard' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {exam.difficulty}
                  </span>
                </div>

                {/* Materials */}
                <div className="flex gap-2 mb-6">
                  {exam.pdfUrl && (
                    <div className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg">
                      📄 PDF
                    </div>
                  )}
                  {(exam.audioUrls?.length || 0) > 0 && (
                    <div className="flex items-center gap-1.5 text-xs bg-violet-50 text-violet-700 px-3 py-1 rounded-lg">
                      🎧 Audio
                    </div>
                  )}
                </div>

                {/* Thống kê cá nhân */}
                {attemptInfo && (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-bold text-xl text-gray-800">{attemptInfo.count}</div>
                        <div className="text-gray-500 text-xs">Lần làm</div>
                      </div>
                      <div>
                        <div className="font-bold text-xl text-green-600">{attemptInfo.bestScore}</div>
                        <div className="text-gray-500 text-xs">Điểm cao nhất</div>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-700">Gần đây</div>
                        <div className="text-gray-500 text-xs">Hôm nay</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-auto space-y-3">
                  {isLocked ? (
                    <button 
                      onClick={() => alert("Tính năng này yêu cầu tài khoản Premium")}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 hover:brightness-105 transition"
                    >
                      🔒 Mở khóa Premium
                    </button>
                  ) : (
                    <Link
                      to={`/exam/${exam._id}`}
                      className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl text-center transition-all active:scale-95"
                    >
                      {attemptInfo ? "Làm lại bài thi" : "Bắt đầu làm bài"}
                    </Link>
                  )}

                  {attemptInfo && !isLocked && (
                    <Link
                      to={`/exam/result/${attemptInfo.lastAttemptId}`}
                      className="block w-full py-4 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl text-center transition"
                    >
                      Xem kết quả gần nhất
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamList;