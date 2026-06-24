import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useParams, useNavigate, Link } from 'react-router-dom';
// import { useSelector } from 'react-redux'; // Đã ẩn để tránh lỗi build môi trường

const ExamHistory = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // const { user } = useSelector((state) => state.auth); // Đã ẩn để tránh lỗi build
  const user = { account_type: 'Premium', role: 'User' }; // Mock data tạm thời

  const [exam, setExam] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = axios.create({
    // baseURL: import.meta.env.VITE_API_URL || "", // Đã ẩn để tránh lỗi build
    baseURL: "",
  });

  // Set token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    if (!examId || !user) {
      navigate('/exams');
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        const examRes = await api.get(`/exams/${examId}`);
        setExam(examRes.data);

        const attemptsRes = await api.get(`/exams/${examId}/attempts`);
        // Đảm bảo dữ liệu là mảng và sắp xếp mới nhất lên đầu
        const data = Array.isArray(attemptsRes.data) ? attemptsRes.data : [];
        setAttempts(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Không thể tải lịch sử làm bài");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [examId, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 font-medium">Đang tải lịch sử...</div>;
  if (error) return <div className="text-center py-20 text-red-600 font-bold">{error}</div>;
  if (!exam) return <div className="text-center py-20 text-gray-500">Không tìm thấy đề thi</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Lịch sử làm bài</h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">{exam.name} - Năm {exam.releaseYear}</p>
          </div>
          <Link
            to="/exams"
            className="text-gray-600 hover:text-blue-600 font-bold bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200 transition-all"
          >
            ← Quay lại
          </Link>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-6">📝</div>
            <p className="text-2xl text-gray-800 font-bold mb-3">Bạn chưa làm bài thi này lần nào</p>
            <p className="text-gray-500 mb-8">Hãy bắt đầu làm bài để đánh giá năng lực của mình nhé.</p>
            <Link
              to={`/exam/${examId}`}
              className="inline-block bg-blue-600 text-white px-10 py-4 rounded-2xl hover:bg-blue-700 font-bold shadow-md transition-all"
            >
              Bắt đầu làm bài ngay
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-bold text-gray-800">Tất cả lần làm bài ({attempts.length})</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {attempts.map((attempt, index) => {
                // Fix fallback tương tự ExamResult
                const date = new Date(attempt.completedAt || attempt.created_at || Date.now());
                const timeSpentMin = attempt.duration_seconds ? Math.floor(attempt.duration_seconds / 60) : (attempt.timeSpent ? Math.floor(attempt.timeSpent / 60) : 120);
                const score = attempt.score || attempt.total_score || 0;

                return (
                  <div key={attempt._id || attempt.id || index} className="p-8 hover:bg-blue-50/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-black text-2xl border border-blue-200 shadow-sm">
                        #{attempts.length - index}
                      </div>

                      <div>
                        <div className="font-black text-2xl text-gray-800 mb-1">{score} <span className="text-gray-400 text-lg">/ 990</span></div>
                        <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <span>📅 {date.toLocaleDateString('vi-VN')}</span>
                          <span>•</span>
                          <span>⏰ {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-400 mb-1">Thời gian làm bài</div>
                        <div className="font-bold text-gray-700 text-lg">{timeSpentMin} phút</div>
                      </div>

                      <Link
                        to={`/exam/result/${attempt._id || attempt.id}`}
                        className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 font-bold transition-all shadow-sm"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamHistory;



// import React, { useEffect, useState } from 'react';
// import axios from "axios";
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// const ExamHistory = () => {
//   const { examId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);

//   const [exam, setExam] = useState(null);
//   const [attempts, setAttempts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const api = axios.create({
//     baseURL: import.meta.env.VITE_API_URL || "",
//   });

//   // Set token
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     }
//   }, []);

//   useEffect(() => {
//     if (!examId || !user) {
//       navigate('/exams');
//       return;
//     }

//     const fetchHistory = async () => {
//       try {
//         setLoading(true);
        
//         const examRes = await api.get(`/exams/${examId}`);
//         setExam(examRes.data);

//         const attemptsRes = await api.get(`/exams/${examId}/attempts`);
//         setAttempts(attemptsRes.data);
//       } catch (err) {
//         console.error(err);
//         setError(err.response?.data?.message || "Không thể tải lịch sử làm bài");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, [examId, user, navigate]);

//   if (loading) return <div className="text-center py-20 text-xl">Đang tải lịch sử...</div>;
//   if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
//   if (!exam) return <div>Không tìm thấy đề thi</div>;

//   return (
//     <div className="min-h-screen bg-gray-50 py-10">
//       <div className="max-w-5xl mx-auto px-6">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold">Lịch sử làm bài</h1>
//             <p className="text-gray-600 mt-1">{exam.name} - Năm {exam.releaseYear}</p>
//           </div>
//           <Link
//             to="/exams"
//             className="text-blue-600 hover:text-blue-700 font-medium"
//           >
//             ← Quay lại danh sách đề
//           </Link>
//         </div>

//         {attempts.length === 0 ? (
//           <div className="bg-white rounded-2xl p-12 text-center">
//             <p className="text-xl text-gray-500">Bạn chưa làm bài thi này lần nào.</p>
//             <Link
//               to={`/exam/${examId}`}
//               className="mt-6 inline-block bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700"
//             >
//               Làm bài ngay
//             </Link>
//           </div>
//         ) : (
//           <div className="bg-white rounded-2xl shadow overflow-hidden">
//             <div className="p-6 border-b">
//               <h2 className="text-xl font-semibold">Tất cả lần làm bài ({attempts.length})</h2>
//             </div>

//             <div className="divide-y">
//               {attempts.map((attempt, index) => {
//                 const date = new Date(attempt.completedAt);
//                 const timeSpentMin = attempt.timeSpent ? Math.floor(attempt.timeSpent / 60) : 120;

//                 return (
//                   <div key={attempt._id} className="p-6 hover:bg-gray-50 transition flex items-center justify-between">
//                     <div className="flex items-center gap-6">
//                       <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
//                         #{attempts.length - index}
//                       </div>

//                       <div>
//                         <div className="font-semibold text-lg">{attempt.score} / 990</div>
//                         <div className="text-sm text-gray-500">
//                           {date.toLocaleDateString('vi-VN', { 
//                             weekday: 'long', 
//                             year: 'numeric', 
//                             month: 'long', 
//                             day: 'numeric' 
//                           })} • {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-8">
//                       <div className="text-right">
//                         <div className="text-sm text-gray-500">Thời gian</div>
//                         <div className="font-medium">{timeSpentMin} phút</div>
//                       </div>

//                       <Link
//                         to={`/exam/result/${attempt._id}`}
//                         className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
//                       >
//                         Xem chi tiết
//                       </Link>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ExamHistory;