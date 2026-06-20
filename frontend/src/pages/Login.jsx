import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../redux/authSlice.js";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);
    dispatch(clearError());

    try {
      const result = await dispatch(loginUser({
        email: form.email,
        password: form.password
      }));

      if (result.type === loginUser.fulfilled.type) {
        const user = result.payload.user;
        const redirectUrl = ["admin", "manager"].includes(user.role) ? "/admin/dashboard" : "/profile";
        navigate(redirectUrl, { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">T</span>
          <div>
            <h1>TOEIC Luyen Thi</h1>
            <p>Sign in to continue</p>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {notice && <div className={`alert alert-${notice.type}`}>{notice.message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="form-control"
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-control"
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <Link to="/forgot-password" className="small text-decoration-none">Forgot password?</Link>
            <Link to="/register" className="small text-decoration-none">Create account</Link>
          </div>

          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
