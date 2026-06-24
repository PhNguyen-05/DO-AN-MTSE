// import React, { useEffect, useState, useRef } from 'react';
// import axios from "axios";
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// const TakeExam = () => {
//   const { examId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);

//   const [exam, setExam] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState({});
//   const [bookmarked, setBookmarked] = useState(new Set());
//   const [timeLeft, setTimeLeft] = useState(7200); // 120 minutes
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Audio refs
//   const audioRef = useRef(null);
//   const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const api = axios.create({
//     baseURL: import.meta.env.VITE_API_URL || "",
//   });

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

//     const fetchExamData = async () => {
//       try {
//         setLoading(true);
//         const [examRes, questionsRes] = await Promise.all([
//           api.get(`/exams/${examId}`),
//           api.get(`/exams/${examId}/questions`)
//         ]);

//         setExam(examRes.data);
//         setQuestions(questionsRes.data.sort((a, b) => a.questionNumber - b.questionNumber));

//         // Khôi phục session local
//         const savedAnswers = localStorage.getItem(`exam_${examId}_answers`);
//         if (savedAnswers) setUserAnswers(JSON.parse(savedAnswers));

//         const savedBookmarks = localStorage.getItem(`exam_${examId}_bookmarks`);
//         if (savedBookmarks) setBookmarked(new Set(JSON.parse(savedBookmarks)));
//       } catch (err) {
//         console.error(err);
//         alert("Không thể tải đề thi. Vui lòng thử lại.");
//         navigate('/exams');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExamData();
//   }, [examId, user, navigate]);

//   // Timer
//   useEffect(() => {
//     if (timeLeft <= 0) {
//       handleSubmitExam();
//       return;
//     }
//     const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
//     return () => clearInterval(timer);
//   }, [timeLeft]);

//   // Sync to local storage
//   useEffect(() => {
//     if(Object.keys(userAnswers).length > 0) {
//         localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(userAnswers));
//     }
//   }, [userAnswers, examId]);

//   useEffect(() => {
//     if(bookmarked.size > 0) {
//         localStorage.setItem(`exam_${examId}_bookmarks`, JSON.stringify([...bookmarked]));
//     }
//   }, [bookmarked, examId]);

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//   };

//   const selectAnswer = (questionNumber, answer) => {
//     setUserAnswers(prev => ({ ...prev, [questionNumber]: answer }));
//   };

//   const toggleBookmark = (questionNumber) => {
//     setBookmarked(prev => {
//       const newSet = new Set(prev);
//       newSet.has(questionNumber) ? newSet.delete(questionNumber) : newSet.add(questionNumber);
//       return newSet;
//     });
//   };

//   // Fix: Audio logic per question
//   const playAudio = (audioUrl) => {
//     if (!audioUrl) return;
//     if (currentAudioUrl === audioUrl && audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.pause();
//       } else {
//         audioRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     } else {
//       setCurrentAudioUrl(audioUrl);
//       if (audioRef.current) {
//         audioRef.current.src = audioUrl;
//         audioRef.current.play().catch(e => console.error("Audio play error", e));
//         setIsPlaying(true);
//       }
//     }
//   };

//   const handleSubmitExam = async () => {
//     if (!window.confirm("Bạn có chắc chắn muốn nộp bài?")) return;

//     setIsSubmitting(true);
//     try {
//       const payload = {
//         answers: userAnswers,
//         timeSpent: 7200 - timeLeft,
//         bookmarked: [...bookmarked] // Backend sẽ insert mảng này vào bảng bookmarked_questions
//       };

//       const res = await api.post(`/exams/${examId}/submit`, payload);

//       localStorage.removeItem(`exam_${examId}_answers`);
//       localStorage.removeItem(`exam_${examId}_bookmarks`);

//       navigate(`/exam/result/${res.data.attemptId || res.data._id}`);
//     } catch (err) {
//       console.error(err);
//       alert("Có lỗi khi nộp bài. Vui lòng thử lại.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-medium text-gray-500">Đang tải cấu trúc đề thi...</div>;
//   if (!exam) return <div className="text-center py-20 text-red-600">Không tìm thấy đề thi</div>;

//   const currentQuestion = questions[currentQuestionIndex];
//   const progress = questions.length > 0 ? ((Object.keys(userAnswers).length) / questions.length) * 100 : 0;
  
//   // Audio check for UI (Lấy từ bảng Question hoặc từ Exam nếu là file chung)
//   const questionAudio = currentQuestion?.audioUrl || currentQuestion?.audio_url;

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col">
//       {/* Top Navigation Bar */}
//       <div className="bg-white shadow-sm border-b sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <button onClick={() => navigate('/exams')} className="text-gray-500 hover:text-gray-800 font-bold text-xl">✕</button>
//             <div>
//               <h1 className="text-lg font-bold text-gray-800">{exam.name}</h1>
//               <p className="text-xs text-gray-500">Listening & Reading ({questions.length} questions)</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-6">
//             <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-800'}`}>
//               {formatTime(timeLeft)}
//             </div>
//             <button
//               onClick={handleSubmitExam}
//               disabled={isSubmitting}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-sm transition-all"
//             >
//               {isSubmitting ? "Đang xử lý..." : "Nộp bài"}
//             </button>
//           </div>
//         </div>
//         <div className="h-1.5 bg-gray-200">
//           <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }} />
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto w-full px-4 py-6 flex gap-6 flex-1 items-start">
//         {/* Left Sidebar - Navigator */}
//         <div className="w-72 flex-shrink-0 sticky top-24 bg-white rounded-2xl shadow-sm border p-4 flex flex-col max-h-[80vh]">
//           <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Bảng câu hỏi</h3>
          
//           <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
//             {/* Group questions by Part for better UX */}
//             {[1, 2, 3, 4, 5, 6, 7].map(partNum => {
//                const partQs = questions.filter(q => q.part === partNum);
//                if(partQs.length === 0) return null;
//                return (
//                  <div key={`nav-part-${partNum}`} className="mb-5">
//                    <div className="text-xs font-bold text-gray-500 uppercase mb-2">Part {partNum}</div>
//                    <div className="grid grid-cols-5 gap-1.5">
//                      {partQs.map((q) => {
//                        const globalIndex = questions.findIndex(item => item._id === q._id);
//                        return (
//                          <button
//                            key={q._id}
//                            onClick={() => setCurrentQuestionIndex(globalIndex)}
//                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold border transition-all
//                              ${currentQuestionIndex === globalIndex ? 'ring-2 ring-blue-500 ring-offset-1 border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}
//                              ${userAnswers[q.questionNumber] ? 'bg-green-500 text-white border-green-500' : ''}
//                            `}
//                          >
//                            {q.questionNumber}
//                            {bookmarked.has(q.questionNumber) && <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></div>}
//                          </button>
//                        )
//                      })}
//                    </div>
//                  </div>
//                )
//             })}
//           </div>
//         </div>

//         {/* Main Content - Question Area */}
//         <div className="flex-1 bg-white rounded-2xl shadow-sm border p-8">
//           {currentQuestion && (
//             <div className="animate-fade-in">
//               {/* Header Câu hỏi */}
//               <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
//                 <div className="flex items-center gap-3">
//                   <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold uppercase">
//                     Part {currentQuestion.part}
//                   </span>
//                   <h2 className="text-xl font-bold text-gray-800">Câu {currentQuestion.questionNumber}</h2>
//                 </div>

//                 <button
//                   onClick={() => toggleBookmark(currentQuestion.questionNumber)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border
//                     ${bookmarked.has(currentQuestion.questionNumber) ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
//                 >
//                   <span className="text-xl">{bookmarked.has(currentQuestion.questionNumber) ? '★' : '☆'}</span>
//                   <span>{bookmarked.has(currentQuestion.questionNumber) ? 'Đã lưu' : 'Lưu câu hỏi'}</span>
//                 </button>
//               </div>

//               {/* Audio Player (Dành cho Part 1-4 nếu có) */}
//               {questionAudio && currentQuestion.part <= 4 && (
//                 <div className="mb-8 p-5 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-violet-200 rounded-full flex items-center justify-center text-violet-700">🎧</div>
//                     <div>
//                       <h4 className="font-bold text-violet-900">Audio Playback</h4>
//                       <p className="text-xs text-violet-600">Nghe đoạn hội thoại để trả lời</p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => playAudio(questionAudio)}
//                     className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-lg hover:bg-violet-700 font-bold shadow-sm"
//                   >
//                     <span className="text-lg">{isPlaying && currentAudioUrl === questionAudio ? '⏸' : '▶'}</span>
//                     <span>{isPlaying && currentAudioUrl === questionAudio ? 'Tạm dừng' : 'Nghe Audio'}</span>
//                   </button>
//                 </div>
//               )}

//               {/* Passage (Đoạn văn đọc hiểu) */}
//               {currentQuestion.readingPassage && (
//                 <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl shadow-inner overflow-x-auto">
//                   <div className="prose max-w-none text-gray-800 font-medium leading-relaxed whitespace-pre-line">
//                     {currentQuestion.readingPassage}
//                   </div>
//                 </div>
//               )}
              
//               {/* Image (Hình ảnh minh họa nếu có) */}
//               {(currentQuestion.imageUrl || currentQuestion.image_url) && (
//                 <div className="mb-8 flex justify-center p-4 bg-gray-50 rounded-xl border">
//                    <img src={currentQuestion.imageUrl || currentQuestion.image_url} alt="Question figure" className="max-h-96 object-contain rounded-lg shadow-sm" />
//                 </div>
//               )}

//               {/* Question Text */}
//               <div className="mb-6">
//                 <h4 className="text-lg font-semibold text-gray-800">
//                   {currentQuestion.questionText || "Chọn đáp án đúng nhất:"}
//                 </h4>
//               </div>

//               {/* Options */}
//               <div className="space-y-3">
//                 {['A', 'B', 'C', 'D'].map((option) => {
//                   const optionText = currentQuestion.answers?.[option] || currentQuestion[`option_${option.toLowerCase()}`] || "";
//                   if(!optionText) return null; // Fallback in case options are empty
                  
//                   const isSelected = userAnswers[currentQuestion.questionNumber] === option;
                  
//                   return (
//                   <button
//                     key={option}
//                     onClick={() => selectAnswer(currentQuestion.questionNumber, option)}
//                     className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 group
//                       ${isSelected 
//                         ? 'border-blue-500 bg-blue-50 shadow-sm' 
//                         : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}`}
//                   >
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold border-2 
//                       ${isSelected ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500 border-gray-300 group-hover:border-blue-400 group-hover:text-blue-500'}`}>
//                       {option}
//                     </div>
//                     <span className={`text-lg pt-0.5 ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
//                        {optionText}
//                     </span>
//                   </button>
//                 )})}
//               </div>
//             </div>
//           )}

//           {/* Footer Controls */}
//           <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100">
//             <button
//               onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
//               disabled={currentQuestionIndex === 0}
//               className="px-6 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//             >
//               ← Câu trước
//             </button>
//             <button
//               onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
//               disabled={currentQuestionIndex === questions.length - 1}
//               className="px-6 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//             >
//               Câu tiếp theo →
//             </button>
//           </div>
//         </div>
//       </div>

//       <audio
//         ref={audioRef}
//         onEnded={() => setIsPlaying(false)}
//         className="hidden"
//       />
//     </div>
//   );
// };

// export default TakeExam;




import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarked, setBookmarked] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(7200);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // GIẢ LẬP API TẢI CÂU HỎI
    setTimeout(() => {
      setExam({ _id: examId, name: 'ETS TOEIC 2023 Mock Test', releaseYear: 2023 });
      setQuestions([
        { _id: 'q1', part: 1, questionNumber: 1, questionText: 'Look at the picture.', answers: { A: 'A', B: 'B', C: 'C', D: 'D' }, correctAnswer: 'A' },
        { _id: 'q2', part: 5, questionNumber: 101, questionText: 'The manager requested that all staff ------- the meeting.', answers: { A: 'attend', B: 'attends', C: 'attended', D: 'attending' }, correctAnswer: 'A' },
        { _id: 'q3', part: 7, questionNumber: 153, readingPassage: 'This is a mock reading passage. Please select the correct answer below based on the text.', questionText: 'What is the main idea?', answers: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' }, correctAnswer: 'B' },
      ]);
      setLoading(false);
    }, 1000);
  }, [examId]);

  useEffect(() => {
    if (timeLeft <= 0) { handleSubmitExam(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmitExam = () => {
    if (!window.confirm("Bạn có chắc chắn muốn nộp bài?")) return;
    setIsSubmitting(true);
    setTimeout(() => {
      // Giả lập nộp bài xong, điều hướng qua trang Kết Quả
      navigate(`/exam/result/mock_attempt_id_123`);
    }, 1000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-medium text-gray-500">Đang tải cấu trúc đề thi...</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((Object.keys(userAnswers).length) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/exams')} className="text-gray-500 font-bold text-xl">✕</button>
            <div><h1 className="text-lg font-bold">{exam.name}</h1></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-2xl font-mono font-bold bg-gray-100 px-4 py-2 rounded-lg">{formatTime(timeLeft)}</div>
            <button onClick={handleSubmitExam} disabled={isSubmitting} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold">
              {isSubmitting ? "Đang xử lý..." : "Nộp bài"}
            </button>
          </div>
        </div>
        <div className="h-1.5 bg-gray-200"><div className="h-full bg-green-500" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex gap-6 flex-1 items-start">
        {/* Navigator (Trái) */}
        <div className="w-72 bg-white rounded-2xl shadow-sm border p-4">
          <h3 className="font-bold text-gray-800 mb-4">Bảng câu hỏi</h3>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, idx) => (
              <button key={q._id} onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold border 
                ${currentQuestionIndex === idx ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'} 
                ${userAnswers[q.questionNumber] ? 'bg-green-500 text-white' : ''}`}>
                {q.questionNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Khung Câu hỏi (Phải) */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border p-8">
          <div className="mb-6"><h2 className="text-xl font-bold">Câu {currentQuestion.questionNumber}</h2></div>
          
          {currentQuestion.readingPassage && (
            <div className="mb-8 p-6 bg-gray-50 border rounded-xl">{currentQuestion.readingPassage}</div>
          )}

          <h4 className="text-lg font-semibold mb-6">{currentQuestion.questionText}</h4>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map(opt => (
              <button key={opt} onClick={() => setUserAnswers(prev => ({...prev, [currentQuestion.questionNumber]: opt}))}
                className={`w-full text-left p-4 rounded-xl border-2 flex items-start gap-4 ${userAnswers[currentQuestion.questionNumber] === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${userAnswers[currentQuestion.questionNumber] === opt ? 'bg-blue-500 text-white' : ''}`}>
                  {opt}
                </div>
                <span className="text-lg pt-0.5">{currentQuestion.answers[opt]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;