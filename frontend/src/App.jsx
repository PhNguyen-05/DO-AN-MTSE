
import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import ChatBubble from "./components/ChatBubble.jsx";

// ── Layouts ──
import GuestLayout from "./components/layout/GuestLayout.jsx";
import UserLayout from "./components/layout/UserLayout.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";

// ── Guest pages ──
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import PaymentResult from "./pages/PaymentResult.jsx";
import Exams from "./pages/Exams.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import BlogList from "./pages/BlogList.jsx";
import BlogDetail from "./pages/BlogDetail.jsx";
import Promotions from "./pages/Promotions.jsx";
import Premium from "./pages/Premium.jsx";

// ── User pages ──

import Profile from "./pages/Profile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import Favorites from "./pages/Favorites.jsx";
import Cart from "./pages/Cart.jsx";
import ProductReview from "./pages/ProductReview.jsx";
import ExamList from "./pages/ExamList.jsx";
import TakeExam from "./pages/TakeExam.jsx";
import ExamResult from "./pages/ExamResult.jsx";
import ExamHistory from "./pages/ExamHistory.jsx";
import BookmarkedQuestions from "./pages/BookmarkedQuestions.jsx";
import UserAnalytics from "./pages/UserAnalytics.jsx";
import VocabularyHub from "./pages/VocabularyHub.jsx";
import PracticeByPart from "./pages/PracticeByPart.jsx";
import PremiumDashboard from "./pages/Premiumdashboard.jsx";

// ── Admin/Manager pages ──
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminQLUser from "./pages/AdminQLUser.jsx";

/* ─────────────────────────────────────────────
   ProtectedRoute – bảo vệ route theo role
───────────────────────────────────────────── */
function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Chuyển hướng về trang chủ đúng vai trò
    if (user?.role === "Admin") {
      return <Navigate to="/admin/home" replace />;
    } else if (["Manager", "Employee"].includes(user?.role)) {
      return <Navigate to="/manager/dashboard" replace />;
    } else {
      return <Navigate to="/user/Home" replace />;
    }
  }

  return <Outlet />;
}

/* ─────────────────────────────────────────────
   App
───────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ═════════════════ GUEST Layout ═════════════════ */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgotpassword" element={<Navigate to="/forgot-password" replace />} />
          <Route path="/payment-result" element={<PaymentResult />} />

          {/* Public store/content pages */}
          <Route path="/exams" element={<Exams />} />
          <Route path="/exams/:productId" element={<ProductDetail />} />
          <Route path="/vocabulary/:productId" element={<ProductDetail />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:articleId" element={<BlogDetail />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/premium" element={<Premium />} />
        </Route>

        {/* ═════════════════ USER Layout (chỉ role User) ═════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={["User"]} />}>
          <Route element={<UserLayout />}>
            <Route path="/user/home" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/rate-products" element={<ProductReview />} />

            {/* Practice and learning modules */}
            <Route path="/practice" element={<ExamList />} />
            <Route path="/practice-by-part" element={<PracticeByPart />} />
            <Route path="/exam/:examId" element={<TakeExam />} />
            <Route path="/exam/result/:attemptId" element={<ExamResult />} />
            <Route path="/exam/:examId/history" element={<ExamHistory />} />
            <Route path="/bookmarks" element={<BookmarkedQuestions />} />
            <Route path="/analytics" element={<UserAnalytics />} />
            <Route path="/vocabulary" element={<VocabularyHub />} />
            <Route path="/premium-dashboard" element={<PremiumDashboard />} />
          </Route>
        </Route>

        {/* ═════════════════ ADMIN – Dashboard with own sidebar ═════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin/home" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* ═════════════════ MANAGER / EMPLOYEE – same dashboard as Admin ═════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={["Manager", "Employee"]} />}>
          <Route path="/manager/home" element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="/manager/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* ═════════════════ ADMIN Layout (profile + user management) ═════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={["Admin", "Manager", "Employee"]} />}>
          <Route element={<AdminLayout />}>
            {/* Admin only subroutes */}
            <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
              <Route path="/admin/users" element={<AdminQLUser />} />
            </Route>

            {/* Profile pages accessible to Admin / Manager / Employee */}
            <Route path="/admin/profile" element={<Profile />} />
            <Route path="/admin/profile/edit" element={<EditProfile />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      {/* Chat bubble – hiển thị trên mọi trang */}
      <ChatBubble />
    </BrowserRouter>
  );
}

export default App;
