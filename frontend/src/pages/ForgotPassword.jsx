import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, verifyOTP, resetPassword, clearError } from "../redux/authSlice.js";

function ForgotPassword() {
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState(null);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (form.newPassword.length >= 8) score += 35;
    if (/[A-Z]/.test(form.newPassword)) score += 20;
    if (/[0-9]/.test(form.newPassword)) score += 20;
    if (/[^A-Za-z0-9]/.test(form.newPassword)) score += 25;
    return Math.min(score, 100);
  }, [form.newPassword]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitEmail = async (event) => {
    event.preventDefault();
    setNotice(null);
    dispatch(clearError());

    try {
      const result = await dispatch(forgotPassword({ email: form.email }));
      if (result.type === forgotPassword.fulfilled.type) {
        setStep(1);
        setNotice({ type: "success", message: "OTP sent to your email" });
      }
    } catch (err) {
      console.error("Forgot password error:", err);
    }
  };

  const submitOtp = async (event) => {
    event.preventDefault();
    setNotice(null);
    dispatch(clearError());

    try {
      const result = await dispatch(verifyOTP({
        email: form.email,
        otp: form.otp
      }));
      if (result.type === verifyOTP.fulfilled.type) {
        setStep(2);
        setNotice({ type: "success", message: "OTP verified successfully" });
      }
    } catch (err) {
      console.error("OTP verification error:", err);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setNotice(null);
    dispatch(clearError());

    if (form.newPassword !== form.confirmPassword) {
      setNotice({ type: "danger", message: "Password confirmation does not match." });
      return;
    }

    try {
      const result = await dispatch(resetPassword({
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword
      }));
      if (result.type === resetPassword.fulfilled.type) {
        setStep(3);
        setNotice({ type: "success", message: "Password reset successfully" });
      }
    } catch (err) {
      console.error("Reset password error:", err);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">T</span>
          <div>
            <h1>Reset password</h1>
            <p>{["Email", "OTP", "New password", "Done"][step]}</p>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {notice && <div className={`alert alert-${notice.type}`}>{notice.message}</div>}

        {step === 0 && (
          <form onSubmit={submitEmail}>
            <div className="mb-4">
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
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={submitOtp}>
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
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Checking..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitPassword}>
            <div className="mb-3">
              <label className="form-label" htmlFor="newPassword">New password</label>
              <input
                className="form-control"
                id="newPassword"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={updateField}
                required
              />
              <div className="progress mt-2" role="progressbar" aria-valuenow={passwordScore}>
                <div className="progress-bar" style={{ width: `${passwordScore}%` }} />
              </div>
            </div>

            <div className="mb-4">
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

            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Reset password"}
            </button>
          </form>
        )}

        {step === 3 && (
          <Link className="btn btn-primary w-100" to="/login">Back to login</Link>
        )}

        {step !== 3 && (
          <div className="text-center mt-3">
            <Link to="/login" className="small text-decoration-none">Back to login</Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default ForgotPassword;
