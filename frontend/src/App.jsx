import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

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

// ── Admin/Manager pages ──
import AdminHome     from "./pages/AdminHome.jsx";
import AdminQLUser   from "./pages/AdminQLUser.jsx";
import ManagerHome   from "./pages/ManagerHome.jsx";

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
      return <Navigate to="/manager/home" replace />;
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
        </Route>

        {/* ════ USER Layout (chỉ role User) ════ */}
        <Route element={<ProtectedRoute allowedRoles={["User"]} />}>
          <Route element={<UserLayout />}>
            <Route path="/user/home"     element={<UserHome />} />
            <Route path="/profile"       element={<Profile />} />
            <Route path="/profile/edit"  element={<EditProfile />} />
          </Route>
        </Route>

        {/* ════ ADMIN Layout (Admin / Manager / Employee) ════ */}
        <Route element={<ProtectedRoute allowedRoles={["Admin", "Manager", "Employee"]} />}>
          <Route element={<AdminLayout />}>
            
            {/* Admin only subroutes */}
            <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
              <Route path="/admin/home"      element={<AdminHome />} />
              <Route path="/admin/users"     element={<AdminQLUser />} />
            </Route>

            {/* Manager / Employee only subroutes */}
            <Route element={<ProtectedRoute allowedRoles={["Manager", "Employee"]} />}>
              <Route path="/manager/home"    element={<ManagerHome />} />
            </Route>

            {/* Profile pages accessible to Admin / Manager / Employee */}
            <Route path="/admin/profile"     element={<Profile />} />
            <Route path="/admin/profile/edit" element={<EditProfile />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
