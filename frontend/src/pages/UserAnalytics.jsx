import React, { useEffect, useState } from 'react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
// import { useSelector } from 'react-redux'; // Ẩn để chạy Preview Local

const UserAnalytics = () => {
  // const { user } = useSelector((state) => state.auth); // Ẩn để chạy Preview Local
  const user = { name: 'Nguyễn Văn A', account_type: 'Premium' };

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Form Đặt Mục Tiêu
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    targetScore: 0,
    targetExams: 0,
    targetVocab: 0,
    deadline: ''
  });

  useEffect(() => {
    // Giả lập API fetch dữ liệu thống kê từ Backend
    const fetchAnalytics = () => {
      setLoading(true);
      setTimeout(() => {
        const mockData = {
          overview: {
            totalExamsCompleted: 24,
            averageScore: 715,
            totalStudyHours: 42.5,
            vocabLearned: 450
          },
          learningGoal: {
            targetScore: 850,
            currentBestScore: 780,
            targetExams: 30,
            targetVocab: 1000,
            deadline: '2026-12-31'
          },
          accuracyByPart: {
            1: 85, 2: 78, 3: 65, 4: 45, 5: 80, 6: 55, 7: 40
          },
          recentScores: [
            { date: '01/06', score: 450 },
            { date: '10/06', score: 520 },
            { date: '20/06', score: 580 },
            { date: '05/07', score: 650 },
            { date: '15/07', score: 710 },
            { date: '28/07', score: 780 }
          ]
        };
        setAnalytics(mockData);
        // Khởi tạo giá trị cho form dựa trên dữ liệu hiện tại
        setGoalForm({
          targetScore: mockData.learningGoal.targetScore,
          targetExams: mockData.learningGoal.targetExams,
          targetVocab: mockData.learningGoal.targetVocab,
          deadline: mockData.learningGoal.deadline
        });
        setLoading(false);
      }, 800);
    };

    fetchAnalytics();
  }, []);

  // Xử lý lưu mục tiêu mới
  const handleSaveGoal = (e) => {
    e.preventDefault();
    // Giả lập gọi API PUT /api/users/learning-goals thành công
    setAnalytics(prev => ({
      ...prev,
      learningGoal: {
        ...prev.learningGoal,
        targetScore: parseInt(goalForm.targetScore),
        targetExams: parseInt(goalForm.targetExams),
        targetVocab: parseInt(goalForm.targetVocab),
        deadline: goalForm.deadline
      }
    }));
    setShowGoalModal(false);
    // Hiển thị thông báo (Có thể thay bằng thư viện toast sau)
    alert("Cập nhật mục tiêu học tập thành công!");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGoalForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-500 font-medium flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Đang tổng hợp dữ liệu học tập...
        </div>
      </div>
    );
  }

  const renderLineChart = () => {
    if (!analytics?.recentScores || analytics.recentScores.length === 0) return null;
    
    const data = analytics.recentScores;
    const maxScore = 990;
    const width = 800;
    const height = 250;
    const paddingX = 40;
    const paddingY = 40;

    const points = data.map((d, index) => {
      const x = paddingX + (index * ((width - paddingX * 2) / (data.length - 1)));
      const y = height - paddingY - ((d.score / maxScore) * (height - paddingY * 2));
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full overflow-x-auto custom-scrollbar">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full min-w-[600px]">
          {[0, 330, 660, 990].map((val, i) => {
            const y = height - paddingY - ((val / maxScore) * (height - paddingY * 2));
            return (
              <g key={`grid-y-${i}`}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f3f4f6" strokeWidth="2" strokeDasharray="5,5" />
                <text x={paddingX - 10} y={y + 4} fontSize="12" fill="#9ca3af" textAnchor="end">{val}</text>
              </g>
            );
          })}
          <polyline fill="none" stroke="#2563eb" strokeWidth="4" points={points} />
          {data.map((d, index) => {
            const x = paddingX + (index * ((width - paddingX * 2) / (data.length - 1)));
            const y = height - paddingY - ((d.score / maxScore) * (height - paddingY * 2));
            return (
              <g key={`point-${index}`}>
                <circle cx={x} cy={y} r="6" fill="#ffffff" stroke="#2563eb" strokeWidth="3" className="hover:r-8 transition-all cursor-pointer" />
                <text x={x} y={y - 15} fontSize="14" fontWeight="bold" fill="#1f2937" textAnchor="middle">{d.score}</text>
                <text x={x} y={height - 15} fontSize="13" fill="#6b7280" textAnchor="middle">{d.date}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const { overview, accuracyByPart, learningGoal } = analytics;
  const goalProgress = Math.min(100, Math.round((overview.totalExamsCompleted / learningGoal.targetExams) * 100));
  const scoreProgress = Math.min(100, Math.round((learningGoal.currentBestScore / learningGoal.targetScore) * 100));
  const vocabProgress = Math.min(100, Math.round((overview.vocabLearned / learningGoal.targetVocab) * 100));

  return (
    <div className="min-h-screen bg-gray-50 py-10 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Thống kê tiến độ học tập</h1>
            <p className="text-gray-500 mt-2 font-medium">Chào mừng trở lại, <strong className="text-blue-600">{user.name}</strong>. Cùng xem thành quả của bạn nhé!</p>
          </div>
          <button 
            onClick={() => setShowGoalModal(true)}
            className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2"
          >
            <span>⚙️</span> Điều chỉnh mục tiêu
          </button>
        </div>

        {/* 4 Cards Tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl">📝</div>
            <div>
              <p className="text-gray-500 font-medium text-sm">Đề đã hoàn thành</p>
              <h3 className="text-3xl font-black text-gray-800">{overview.totalExamsCompleted}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl">🎯</div>
            <div>
              <p className="text-gray-500 font-medium text-sm">Điểm trung bình</p>
              <h3 className="text-3xl font-black text-gray-800">{overview.averageScore} <span className="text-sm font-medium text-gray-400">/990</span></h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-3xl">⏱️</div>
            <div>
              <p className="text-gray-500 font-medium text-sm">Thời gian học tập</p>
              <h3 className="text-3xl font-black text-gray-800">{overview.totalStudyHours}<span className="text-lg font-bold text-gray-600">h</span></h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl">📚</div>
            <div>
              <p className="text-gray-500 font-medium text-sm">Từ vựng đã thuộc</p>
              <h3 className="text-3xl font-black text-gray-800">{overview.vocabLearned}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cột Trái (Biểu đồ & Mục tiêu) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Box Biểu đồ */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>📈</span> Biểu đồ tăng trưởng điểm số
              </h2>
              {renderLineChart()}
            </div>

            {/* Box Mục tiêu */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl shadow-md p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
               
               <div className="flex justify-between items-center mb-8 relative z-10">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>🚀</span> Mục tiêu học tập đến ngày {new Date(learningGoal.deadline).toLocaleDateString('vi-VN')}
                 </h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                 {/* Tiến độ điểm */}
                 <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-blue-200 font-medium text-sm">Điểm số</span>
                     <span className="font-bold text-lg">{learningGoal.currentBestScore} / {learningGoal.targetScore}</span>
                   </div>
                   <div className="w-full bg-blue-950 rounded-full h-3">
                     <div className="bg-green-400 h-3 rounded-full relative" style={{ width: `${scoreProgress}%` }}>
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow border-2 border-green-500"></div>
                     </div>
                   </div>
                 </div>

                 {/* Tiến độ số đề */}
                 <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-blue-200 font-medium text-sm">Luyện đề</span>
                     <span className="font-bold text-lg">{overview.totalExamsCompleted} / {learningGoal.targetExams} đề</span>
                   </div>
                   <div className="w-full bg-blue-950 rounded-full h-3">
                     <div className="bg-amber-400 h-3 rounded-full relative" style={{ width: `${goalProgress}%` }}>
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow border-2 border-amber-500"></div>
                     </div>
                   </div>
                 </div>

                 {/* Tiến độ từ vựng */}
                 <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-blue-200 font-medium text-sm">Từ vựng</span>
                     <span className="font-bold text-lg">{overview.vocabLearned} / {learningGoal.targetVocab} từ</span>
                   </div>
                   <div className="w-full bg-blue-950 rounded-full h-3">
                     <div className="bg-purple-400 h-3 rounded-full relative" style={{ width: `${vocabProgress}%` }}>
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow border-2 border-purple-500"></div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Cột Phải (Phân tích kỹ năng - Accuracy by Parts) */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>🔍</span> Kỹ năng yếu cần khắc phục
              </h2>
              <p className="text-sm text-gray-500 mt-1">Dựa trên tỉ lệ đúng của 10 bài thi gần nhất</p>
            </div>

            <div className="space-y-6 flex-1">
              {[
                { part: 1, label: 'Mô tả tranh', val: accuracyByPart[1] },
                { part: 2, label: 'Hỏi đáp', val: accuracyByPart[2] },
                { part: 3, label: 'Hội thoại ngắn', val: accuracyByPart[3] },
                { part: 4, label: 'Bài nói ngắn', val: accuracyByPart[4] },
                { part: 5, label: 'Điền từ câu', val: accuracyByPart[5] },
                { part: 6, label: 'Điền đoạn văn', val: accuracyByPart[6] },
                { part: 7, label: 'Đọc hiểu', val: accuracyByPart[7] },
              ].map(item => {
                const isWeak = item.val < 50;
                return (
                  <div key={item.part} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700 w-14">Part {item.part}</span>
                        <span className="text-sm font-medium text-gray-500 hidden sm:inline-block">{item.label}</span>
                        {isWeak && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded border border-red-200">Điểm yếu</span>}
                      </div>
                      <span className={`font-bold ${isWeak ? 'text-red-500' : 'text-gray-800'}`}>{item.val}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isWeak ? 'bg-red-500' : 'bg-blue-500 group-hover:bg-blue-600'}`} 
                        style={{ width: `${item.val}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                Luyện tập ngay kỹ năng yếu →
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Đặt mục tiêu học tập */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Cài đặt mục tiêu</h2>
              <button onClick={() => setShowGoalModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSaveGoal} className="p-8">
              <div className="space-y-6">
                
                {/* Điểm mục tiêu */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Điểm TOEIC mục tiêu</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name="targetScore"
                      min="10" 
                      max="990" 
                      required
                      value={goalForm.targetScore}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 font-semibold" 
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-medium">/ 990</span>
                    </div>
                  </div>
                </div>

                {/* Số đề & Từ vựng */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Đề cần luyện</label>
                    <input 
                      type="number" 
                      name="targetExams"
                      min="1"
                      required
                      value={goalForm.targetExams}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 font-semibold" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Từ vựng cần học</label>
                    <input 
                      type="number" 
                      name="targetVocab"
                      min="10"
                      required
                      value={goalForm.targetVocab}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 font-semibold" 
                    />
                  </div>
                </div>

                {/* Thời hạn */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Thời hạn hoàn thành (Deadline)</label>
                  <input 
                    type="date" 
                    name="deadline"
                    required
                    value={goalForm.deadline}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 font-semibold" 
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowGoalModal(false)}
                  className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all"
                >
                  Lưu mục tiêu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserAnalytics;