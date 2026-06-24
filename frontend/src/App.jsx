// import { useSelector } from "react-redux";
// import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// import AdminDashboard from "./pages/AdminDashboard.jsx";
// import ForgotPassword from "./pages/ForgotPassword.jsx";
// import Login from "./pages/Login.jsx";
// import Register from "./pages/Register.jsx";
// import VerifyOtp from "./pages/VerifyOtp.jsx";
// import EditProfile from "./components/EditProfile.jsx";


// import ExamList from "./pages/ExamList.jsx";
// import TakeExam from "./pages/TakeExam.jsx";
// import ExamResult from "./pages/ExamResult.jsx";
// import ExamHistory from "./pages/ExamHistory.jsx";
// import BookmarkedQuestions from "./BookmarkedQuestions";
// import UserAnalytics from "./UserAnalytics";
// import VocabularyHub from "./VocabularyHub";

// function ProtectedRoute({ children, requiredRole = null, allowedRoles = [] }) {
//   const { isAuthenticated, user } = useSelector((state) => state.auth);

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   const roles = requiredRole ? [requiredRole] : allowedRoles;

//   if (roles.length && !roles.includes(user?.role)) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// }

// // Route cho User (cần đăng nhập)
// function UserProtectedRoute({ children }) {
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Navigate to="/exams" replace />} />   {/* Thay đổi thành /exams */}

//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/verify-otp" element={<VerifyOtp />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />

     
//         { <Route path="/bookmarks" element={<BookmarkedQuestions />} /> }
//         {<Route path="/analytics" element={<UserAnalytics />} /> }
//         {<Route path="/vocabulary" element={<VocabularyHub />} /> }

//         {/* ==================== USER ROUTES ==================== */}
//         <Route 
//           path="/exams" 
//           element={
//             <UserProtectedRoute>
//               <ExamList />
//             </UserProtectedRoute>
//           } 
//         />
//         <Route 
//           path="/exam/:examId" 
//           element={
//             <UserProtectedRoute>
//               <TakeExam />
//             </UserProtectedRoute>
//           } 
//         />
//         <Route 
//           path="/exam/result/:attemptId" 
//           element={
//             <UserProtectedRoute>
//               <ExamResult />
//             </UserProtectedRoute>
//           } 
//         />

//         <Route 
//           path="/exams/:examId/history" 
//           element={
//             <UserProtectedRoute>
//               <ExamHistory />
//             </UserProtectedRoute>
//           } 
//         />

//         <Route
//           path="/profile"
//           element={
//             <ProtectedRoute allowedRoles={["user", "admin", "manager"]}>
//               <EditProfile />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/admin/dashboard"
//           element={
//             <ProtectedRoute allowedRoles={["admin", "manager"]}>
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />

//         <Route path="*" element={<Navigate to="/exams" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;



import React from "react";
// Đã tạm thời gỡ bỏ useSelector để bypass đăng nhập
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import EditProfile from "./components/EditProfile.jsx";

import ExamList from "./pages/ExamList.jsx";
import TakeExam from "./pages/TakeExam.jsx";
import ExamResult from "./pages/ExamResult.jsx";
import ExamHistory from "./pages/ExamHistory.jsx";

// ĐẢM BẢO BẠN ĐÃ TẠO 4 FILE NÀY TRONG THƯ MỤC "src/pages/". NẾU BẠN ĐỂ CHỖ KHÁC, HÃY SỬA LẠI ĐƯỜNG DẪN IMPORT NHÉ.
import BookmarkedQuestions from "./pages/BookmarkedQuestions.jsx";
import UserAnalytics from "./pages/UserAnalytics.jsx";
import VocabularyHub from "./pages/VocabularyHub.jsx";
import PracticeByPart from "./pages/PracticeByPart.jsx";

// Giữ lại hàm ProtectedRoute gốc cho Admin
function ProtectedRoute({ children, requiredRole = null, allowedRoles = [] }) {
  const isAuthenticated = false; // Bỏ qua auth logic tạm thời
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/exams" replace />} />

        {/* Các trang xác thực */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ==================== MÔI TRƯỜNG TEST (ĐÃ BỎ QUA ĐĂNG NHẬP) ==================== */}
        {/* Chỉ dùng thẻ <Route> trực tiếp, không bọc UserProtectedRoute nữa */}
        <Route path="/exams" element={<ExamList />} />
        <Route path="/exam/:examId" element={<TakeExam />} />
        <Route path="/exam/result/:attemptId" element={<ExamResult />} />
        <Route path="/exams/:examId/history" element={<ExamHistory />} />
        
        {/* CÁC TÍNH NĂNG MỚI */}
        <Route path="/bookmarks" element={<BookmarkedQuestions />} />
        <Route path="/analytics" element={<UserAnalytics />} />
        <Route path="/vocabulary" element={<VocabularyHub />} />
        <Route path="/practice" element={<PracticeByPart />} />

        {/* Các Route cũ (Tạm ẩn bảo vệ) */}
        <Route path="/profile" element={<EditProfile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/exams" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;