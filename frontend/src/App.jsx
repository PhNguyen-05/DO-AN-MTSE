import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import Exams from "./pages/Exams.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Promotions from "./pages/Promotions.jsx";
import Checkout from "./pages/Checkout.jsx";
import PurchaseHistory from "./pages/PurchaseHistory.jsx";
import ProductReview from "./pages/ProductReview.jsx";
import BlogList from "./pages/BlogList.jsx";
import BlogDetail from "./pages/BlogDetail.jsx";
import Premium from "./pages/Premium.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import EditProfile from "./components/EditProfile.jsx";
import Favorites from "./pages/Favorites.jsx";

import ExamList from "./pages/ExamList.jsx";
import TakeExam from "./pages/TakeExam.jsx";
import ExamResult from "./pages/ExamResult.jsx";
import ExamHistory from "./pages/ExamHistory.jsx";
import BookmarkedQuestions from "./pages/BookmarkedQuestions.jsx";
import UserAnalytics from "./pages/UserAnalytics.jsx";
import VocabularyHub from "./pages/VocabularyHub.jsx";
import PracticeByPart from "./pages/PracticeByPart.jsx";

function ProtectedRoute({ children, requiredRole = null, allowedRoles = [] }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roles = requiredRole ? [requiredRole] : allowedRoles;

  if (roles.length && !roles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgotpassword" element={<Navigate to="/forgot-password" replace />} />

        <Route
          path="/profile"
          element={(
            <ProtectedRoute allowedRoles={["user", "admin", "manager"]}>
              <EditProfile />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/favorites"
          element={(
            <ProtectedRoute allowedRoles={["user", "admin", "manager"]}>
              <Favorites />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/dashboard"
          element={(
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <AdminDashboard />
            </ProtectedRoute>
          )}
        />

        {/* Cửa hàng đề thi trên trang chủ */}
        <Route path="/exams" element={<Exams />} />
        <Route path="/exams/:productId" element={<ProductDetail />} />
        <Route path="/vocabulary/:productId" element={<ProductDetail />} />

        {/* Module luyện thi / từ vựng của Nguyên */}
        <Route path="/practice" element={<ExamList />} />
        <Route path="/practice-by-part" element={<PracticeByPart />} />
        <Route path="/exam/:examId" element={<TakeExam />} />
        <Route path="/exam/result/:attemptId" element={<ExamResult />} />
        <Route path="/exam/:examId/history" element={<ExamHistory />} />
        <Route path="/bookmarks" element={<BookmarkedQuestions />} />
        <Route path="/analytics" element={<UserAnalytics />} />
        <Route path="/vocabulary" element={<VocabularyHub />} />

        <Route path="/premium" element={<Premium />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/rate-products" element={<ProductReview />} />
        <Route path="/purchase-history" element={<PurchaseHistory />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:articleId" element={<BlogDetail />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
