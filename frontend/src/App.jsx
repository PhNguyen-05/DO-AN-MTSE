import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import ChatBubble from "./components/ChatBubble.jsx";

// ── Layouts ──
import GuestLayout   from "./components/layout/GuestLayout.jsx";
import UserLayout    from "./components/layout/UserLayout.jsx";
import AdminLayout   from "./components/layout/AdminLayout.jsx";

// ── Guest pages ──
import Home          from "./pages/Home.jsx";
import Login         from "./pages/Login.jsx";
import Register      from "./pages/Register.jsx";
import VerifyOtp     from "./pages/VerifyOtp.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

// ── User pages ──
import UserHome      from "./pages/UserHome.jsx";
import Profile       from "./pages/Profile.jsx";
import EditProfile   from "./pages/EditProfile.jsx";
import Checkout      from "./pages/Checkout.jsx";
import PaymentResult from "./pages/PaymentResult.jsx";
import OrderHistory  from "./pages/OrderHistory.jsx";

// ── Admin/Manager pages ──
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminQLUser   from "./pages/AdminQLUser.jsx";

/* ─────────────────────────────────────────────
   ProtectedRoute – bảo vệ route theo role
───────────────────────────────────────────── */
function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect về trang chủ đúng role
    if (user?.role === "Admin") {
      return <Navigate to="/admin/home" replace />;
    } else if (["Manager", "Employee"].includes(user?.role)) {
      return <Navigate to="/manager/dashboard" replace />;
    } else {
      return <Navigate to="/user/home" replace />;
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

        {/* ════ GUEST Layout ════ */}
        <Route element={<GuestLayout />}>
          <Route path="/"                element={<Home />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/verify-otp"      element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgotpassword"  element={<Navigate to="/forgot-password" replace />} />
          <Route path="/payment-result" element={<PaymentResult />} />
        </Route>

        {/* ════ USER Layout (chỉ role User) ════ */}
        <Route element={<ProtectedRoute allowedRoles={["User"]} />}>
          <Route element={<UserLayout />}>
            <Route path="/user/home"     element={<UserHome />} />
            <Route path="/checkout"      element={<Checkout />} />
            <Route path="/orders"        element={<OrderHistory />} />
            <Route path="/profile"       element={<Profile />} />
            <Route path="/profile/edit"  element={<EditProfile />} />
          </Route>
        </Route>

        {/* ════ ADMIN – Dashboard with own sidebar ════ */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin/home"      element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* ════ MANAGER / EMPLOYEE – same dashboard as Admin, without user management ════ */}
        <Route element={<ProtectedRoute allowedRoles={["Manager", "Employee"]} />}>
          <Route path="/manager/home"      element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="/manager/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* ════ ADMIN Layout (profile + admin-only user management) ════ */}
        <Route element={<ProtectedRoute allowedRoles={["Admin", "Manager", "Employee"]} />}>
          <Route element={<AdminLayout />}>

            {/* Admin only subroutes */}
            <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
              <Route path="/admin/users"     element={<AdminQLUser />} />
            </Route>

            {/* Profile pages accessible to Admin / Manager / Employee */}
            <Route path="/admin/profile"     element={<Profile />} />
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
