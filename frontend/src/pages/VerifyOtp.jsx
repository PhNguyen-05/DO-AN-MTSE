import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyOTP, clearError } from "../redux/authSlice.js";

function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const initialEmail = useMemo(
    () => location.state?.email || searchParams.get("email") || "",
    [location.state, searchParams]
  );
  
  const [form, setForm] = useState({ email: initialEmail, otp: "" });
  const [notice, setNotice] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);
    dispatch(clearError());

    try {
      const result = await dispatch(verifyOTP({
        email: form.email,
        otp: form.otp
      }));

      if (result.type === verifyOTP.fulfilled.type) {
        setNotice({
          type: "success",
          message: "Account verified successfully."
        });
        setTimeout(() => navigate("/login", { replace: true }), 1000);
      }
    } catch (err) {
      console.error("OTP verification error:", err);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">T</span>
          <div>
            <h1>Verify OTP</h1>
            <p>Activate your TOEIC account</p>
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

          <div className="mb-4">
            <label className="form-label" htmlFor="otp">OTP</label>
            <input
              className="form-control"
              id="otp"
              name="otp"
              value={form.otp}
              onChange={updateField}
              required
            />
          </div>

          <button className="btn btn-primary w-100 mb-3" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify account"}
          </button>

          <div className="text-center">
            <Link to="/login" className="small text-decoration-none">Back to login</Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default VerifyOtp;
