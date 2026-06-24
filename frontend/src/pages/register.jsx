import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../redux/authSlice.js";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
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
      const result = await dispatch(registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      }));

      if (result.type === registerUser.fulfilled.type) {
        setNotice({
          type: "success",
          message: "Account registered successfully! Please verify your email."
        });
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`, {
            state: { email: form.email }
          });
        }, 1000);
      }
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel auth-panel-wide">
        <div className="auth-brand">
          <span className="brand-mark">T</span>
          <div>
            <h1>Create account</h1>
            <p>Verify by OTP before signing in</p>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {notice && <div className={`alert alert-${notice.type}`}>{notice.message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="name">Name</label>
            <input
              className="form-control"
              id="name"
              name="name"
              value={form.name}
              onChange={updateField}
              required
            />
          </div>

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

          <div className="row">
            <div className="col-12 col-md-6 mb-3">
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
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
              <input
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={updateField}
                required
              />
            </div>
          </div>

          <button className="btn btn-primary w-100 mb-3" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>

          <div className="text-center">
            <Link to="/login" className="small text-decoration-none">Back to login</Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Register;
