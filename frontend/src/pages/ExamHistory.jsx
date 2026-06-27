import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { examApi } from "../services/userApi";

const ExamHistory = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!examId) {
      navigate("/exams");
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);

        const [examData, attemptsData] = await Promise.all([
          examApi.getExam(examId),
          examApi.getAttemptHistory(examId),
        ]);

        setExam(examData);
        setAttempts(Array.isArray(attemptsData) ? attemptsData : []);
      } catch (err) {
        if (err.status === 403) {
          setError("Bạn chưa mua đề thi này.");
        } else if (err.status === 404) {
          setError("Không tìm thấy đề thi.");
        } else {
          setError(err.message || "Không thể tải lịch sử làm bài.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [examId, navigate]);

  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <span className="learning-spinner" />
          <p className="learning-subtitle" style={{ marginTop: 14 }}>
            Đang tải lịch sử làm bài...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <h2 className="exam-title">{error}</h2>
          <Link className="learning-btn primary" to="/exams" style={{ marginTop: 16 }}>
            Về kho đề
          </Link>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="learning-page">
        <div className="learning-shell learning-empty">
          <h2 className="exam-title">Không tìm thấy đề thi</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-page">
      <header className="learning-header">
        <div className="learning-header-inner">
          <div className="learning-title-row">
            <div>
              <p className="learning-kicker">Exam History</p>
              <h1 className="learning-title">Lịch sử làm bài</h1>
              <p className="learning-subtitle">
                {exam.name} — Năm {exam.releaseYear}
              </p>
            </div>
            <Link className="learning-btn" to="/exams">
              <i className="bi bi-arrow-left" />
              Về kho đề
            </Link>
          </div>
        </div>
      </header>

      <main className="learning-shell">
        {attempts.length === 0 ? (
          <section className="learning-card learning-empty">
            <span className="learning-icon amber" style={{ marginBottom: 14 }}>
              <i className="bi bi-journal-x" />
            </span>
            <h2 className="exam-title" style={{ fontSize: "1.3rem" }}>
              Bạn chưa làm bài thi này lần nào
            </h2>
            <p className="learning-subtitle" style={{ marginTop: 8 }}>
              Hãy bắt đầu làm bài để đánh giá năng lực của mình nhé.
            </p>
            <Link
              className="learning-btn primary"
              to={`/exam/${examId}`}
              style={{ marginTop: 18 }}
            >
              <i className="bi bi-play-circle" />
              Bắt đầu làm bài ngay
            </Link>
          </section>
        ) : (
          <section className="learning-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5ebf4" }}>
              <h2 className="exam-title" style={{ fontSize: "1.15rem", margin: 0 }}>
                Tất cả lần làm bài ({attempts.length})
              </h2>
            </div>

            <div>
              {attempts.map((attempt, index) => {
                const date = new Date(attempt.completedAt || attempt.createdAt || Date.now());
                const timeSpentMin = attempt.timeSpent
                  ? Math.floor(attempt.timeSpent / 60)
                  : 0;
                const score = attempt.score || 0;
                const accuracy = attempt.totalQuestions
                  ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100)
                  : 0;

                return (
                  <div
                    key={attempt._id || index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "20px 24px",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {/* Thứ tự + điểm */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          background: "#e9f0ff",
                          color: "#0b57c5",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          flexShrink: 0,
                        }}
                      >
                        #{attempts.length - index}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <strong style={{ fontSize: "1.4rem", color: "#10233f" }}>
                            {score}
                          </strong>
                          <span className="vocab-muted">/ 990</span>
                          <span
                            className={`learning-badge ${accuracy >= 70 ? "green" : accuracy >= 50 ? "amber" : "red"}`}
                          >
                            {accuracy}% đúng
                          </span>
                        </div>
                        <div className="vocab-muted" style={{ marginTop: 4, fontSize: "0.85rem" }}>
                          <i className="bi bi-calendar3" />{" "}
                          {date.toLocaleDateString("vi-VN")} lúc{" "}
                          {date.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {timeSpentMin > 0 && (
                            <>
                              {" "}
                              • <i className="bi bi-clock" /> {timeSpentMin} phút
                            </>
                          )}
                          {attempt.correctCount !== undefined && (
                            <>
                              {" "}
                              • {attempt.correctCount}/{attempt.totalQuestions} câu đúng
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <Link
                        className="learning-btn"
                        to={`/exam/result/${attempt._id}`}
                      >
                        <i className="bi bi-clipboard-data" />
                        Xem chi tiết
                      </Link>
                      <Link
                        className="learning-btn primary"
                        to={`/exam/${examId}`}
                      >
                        <i className="bi bi-arrow-counterclockwise" />
                        Làm lại
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ExamHistory;




// import React, { useEffect, useState } from 'react';
// import axios from "axios";
// import { useParams, useNavigate, Link } from 'react-router-dom';
// // import { useSelector } from 'react-redux'; // Đã ẩn để tránh lỗi build môi trường

// const ExamHistory = () => {
//   const { examId } = useParams();
//   const navigate = useNavigate();
  
//   // const { user } = useSelector((state) => state.auth); // Đã ẩn để tránh lỗi build
//   const user = { account_type: 'Premium', role: 'User' }; // Mock data tạm thời

//   const [exam, setExam] = useState(null);
//   const [attempts, setAttempts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const api = axios.create({
//     // baseURL: import.meta.env.VITE_API_URL || "", // Đã ẩn để tránh lỗi build
//     baseURL: "",
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
//         // Đảm bảo dữ liệu là mảng và sắp xếp mới nhất lên đầu
//         const data = Array.isArray(attemptsRes.data) ? attemptsRes.data : [];
//         setAttempts(data);
//       } catch (err) {
//         console.error(err);
//         setError(err.response?.data?.message || "Không thể tải lịch sử làm bài");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, [examId, navigate]);

//   if (loading) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 font-medium">Đang tải lịch sử...</div>;
//   if (error) return <div className="text-center py-20 text-red-600 font-bold">{error}</div>;
//   if (!exam) return <div className="text-center py-20 text-gray-500">Không tìm thấy đề thi</div>;

//   return (
//     <div className="min-h-screen bg-gray-100 py-12">
//       <div className="max-w-5xl mx-auto px-6">
//         <div className="flex justify-between items-center mb-10">
//           <div>
//             <h1 className="text-3xl font-extrabold text-gray-800">Lịch sử làm bài</h1>
//             <p className="text-gray-500 mt-2 text-lg font-medium">{exam.name} - Năm {exam.releaseYear}</p>
//           </div>
//           <Link
//             to="/exams"
//             className="text-gray-600 hover:text-blue-600 font-bold bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200 transition-all"
//           >
//             ← Quay lại
//           </Link>
//         </div>

//         {attempts.length === 0 ? (
//           <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
//             <div className="text-6xl mb-6">📝</div>
//             <p className="text-2xl text-gray-800 font-bold mb-3">Bạn chưa làm bài thi này lần nào</p>
//             <p className="text-gray-500 mb-8">Hãy bắt đầu làm bài để đánh giá năng lực của mình nhé.</p>
//             <Link
//               to={`/exam/${examId}`}
//               className="inline-block bg-blue-600 text-white px-10 py-4 rounded-2xl hover:bg-blue-700 font-bold shadow-md transition-all"
//             >
//               Bắt đầu làm bài ngay
//             </Link>
//           </div>
//         ) : (
//           <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
//             <div className="p-8 border-b border-gray-100 bg-gray-50/50">
//               <h2 className="text-2xl font-bold text-gray-800">Tất cả lần làm bài ({attempts.length})</h2>
//             </div>

//             <div className="divide-y divide-gray-100">
//               {attempts.map((attempt, index) => {
//                 // Fix fallback tương tự ExamResult
//                 const date = new Date(attempt.completedAt || attempt.created_at || Date.now());
//                 const timeSpentMin = attempt.duration_seconds ? Math.floor(attempt.duration_seconds / 60) : (attempt.timeSpent ? Math.floor(attempt.timeSpent / 60) : 120);
//                 const score = attempt.score || attempt.total_score || 0;

//                 return (
//                   <div key={attempt._id || attempt.id || index} className="p-8 hover:bg-blue-50/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
//                     <div className="flex items-center gap-6">
//                       <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-black text-2xl border border-blue-200 shadow-sm">
//                         #{attempts.length - index}
//                       </div>

//                       <div>
//                         <div className="font-black text-2xl text-gray-800 mb-1">{score} <span className="text-gray-400 text-lg">/ 990</span></div>
//                         <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
//                           <span>📅 {date.toLocaleDateString('vi-VN')}</span>
//                           <span>•</span>
//                           <span>⏰ {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
//                       <div className="text-right">
//                         <div className="text-sm font-medium text-gray-400 mb-1">Thời gian làm bài</div>
//                         <div className="font-bold text-gray-700 text-lg">{timeSpentMin} phút</div>
//                       </div>

//                       <Link
//                         to={`/exam/result/${attempt._id || attempt.id}`}
//                         className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 font-bold transition-all shadow-sm"
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

