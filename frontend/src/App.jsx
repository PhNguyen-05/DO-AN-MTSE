import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import Exams from "./pages/Exams.jsx";
import Vocabulary from "./pages/Vocabulary.jsx";
import Cart from "./pages/Cart.jsx";
import Promotions from "./pages/Promotions.jsx";
import Blog from "./pages/Blog.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import EditProfile from "./components/EditProfile.jsx";

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
          path="/admin/dashboard"
          element={(
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <AdminDashboard />
            </ProtectedRoute>
          )}
        />
        <Route path="/exams" element={<Exams />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
