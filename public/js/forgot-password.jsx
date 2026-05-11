const { useMemo, useState } = React;

const steps = [
  { title: "Email", icon: "bi-envelope-paper" },
  { title: "OTP", icon: "bi-shield-check" },
  { title: "Mật khẩu", icon: "bi-key" }
];

const initialForm = {
  email: "",
  otp: "",
  newPassword: "",
  confirmPassword: ""
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (form.newPassword.length >= 6) score += 35;
    if (/[A-Z]/.test(form.newPassword)) score += 20;
    if (/[0-9]/.test(form.newPassword)) score += 20;
    if (/[^A-Za-z0-9]/.test(form.newPassword)) score += 25;
    return Math.min(score, 100);
  }, [form.newPassword]);

  const meterColor = passwordScore < 45 ? "#dc3545" : passwordScore < 75 ? "#f59e0b" : "#198754";

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const requestApi = async (url, body) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Có lỗi xảy ra, vui lòng thử lại");
    }

    return data;
  };

  const runAction = async (action) => {
    setLoading(true);
    setNotice(null);

    try {
      await action();
    } catch (error) {
      setNotice({ type: "danger", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const submitEmail = async (event) => {
    event.preventDefault();
    await runAction(async () => {
      const data = await requestApi("/api/forgot-password", { email: form.email });
      setStep(1);
      setNotice({ type: "success", text: data.message });
    });
  };

  const submitOtp = async (event) => {
    event.preventDefault();
    await runAction(async () => {
      const data = await requestApi("/api/verify-otp", {
        email: form.email,
        otp: form.otp
      });
      setStep(2);
      setNotice({ type: "success", text: data.message });
    });
  };

  const submitPassword = async (event) => {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setNotice({ type: "danger", text: "Mật khẩu nhập lại chưa khớp" });
      return;
    }

    await runAction(async () => {
      const data = await requestApi("/api/reset-password", {
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword
      });
      setStep(3);
      setNotice({ type: "success", text: data.message });
    });
  };

  const resendOtp = async () => {
    await runAction(async () => {
      const data = await requestApi("/api/forgot-password", { email: form.email });
      setNotice({ type: "success", text: `${data.message}. Vui lòng kiểm tra email hoặc terminal.` });
    });
  };

  const resetFlow = () => {
    setForm(initialForm);
    setStep(0);
    setNotice(null);
    setShowPassword(false);
  };

  return (
    <main className="auth-shell">
      <section className="form-panel">
        <div className="reset-card">
          <div className="reset-card-header">
            <i className="bi bi-shield-lock" style={{ fontSize: "3rem" }}></i>
            <p className="eyebrow mt-2">Bảo mật tài khoản</p>
            <h2>Quên mật khẩu</h2>
            <p className="lead">
              Nhập email đã đăng ký để nhận OTP, xác thực mã và tạo mật khẩu mới.
            </p>
          </div>

          <div className="reset-card-body">
            <div className="stepper" aria-label="Reset password steps">
              {steps.map((item, index) => (
                <div
                  key={item.title}
                  className={`step ${step === index ? "active" : ""} ${step > index ? "done" : ""}`}
                >
                  <span className="step-number">
                    {step > index ? <i className="bi bi-check-lg"></i> : index + 1}
                  </span>
                  <span className="step-label">
                    <i className={`bi ${item.icon} me-1`}></i>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>

            {notice && (
              <div className={`alert alert-${notice.type} d-flex align-items-start gap-2`} role="alert">
                <i className={`bi ${notice.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
                <span>{notice.text}</span>
              </div>
            )}

            {step === 0 && (
              <form onSubmit={submitEmail}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="email">Email tài khoản</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input
                      id="email"
                      className="form-control"
                      type="email"
                      name="email"
                      placeholder="vidu@gmail.com"
                      value={form.email}
                      onChange={updateField}
                      required
                    />
                  </div>
                </div>
                <button className="btn btn-brand w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send me-2"></i>}
                  Gửi mã OTP
                </button>
              </form>
            )}

            {step === 1 && (
              <form onSubmit={submitOtp}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="otp">Mã OTP</label>
                  <input
                    id="otp"
                    className="form-control otp-input"
                    type="text"
                    name="otp"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="------"
                    value={form.otp}
                    onChange={updateField}
                    required
                  />
                  <div className="form-text">Mã gồm 6 chữ số, có hiệu lực trong 5 phút.</div>
                </div>
                <button className="btn btn-brand w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-shield-check me-2"></i>}
                  Xác thực OTP
                </button>
                <button type="button" className="ghost-action mt-3 px-0" onClick={resendOtp} disabled={loading}>
                  Gửi lại mã
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={submitPassword}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="newPassword">Mật khẩu mới</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock"></i></span>
                    <input
                      id="newPassword"
                      className="form-control"
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      minLength="6"
                      placeholder="Tối thiểu 6 ký tự"
                      value={form.newPassword}
                      onChange={updateField}
                      required
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                  <div className="password-meter mt-2" style={{ "--strength": `${passwordScore}%`, "--meter": meterColor }}>
                    <span></span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="confirmPassword">Nhập lại mật khẩu</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-check2-square"></i></span>
                    <input
                      id="confirmPassword"
                      className="form-control"
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      minLength="6"
                      placeholder="Nhập lại mật khẩu mới"
                      value={form.confirmPassword}
                      onChange={updateField}
                      required
                    />
                  </div>
                </div>

                <button className="btn btn-brand w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-key me-2"></i>}
                  Đặt lại mật khẩu
                </button>
              </form>
            )}

            {step === 3 && (
              <div className="text-center py-2">
                <div className="display-5 text-success mb-3"><i className="bi bi-check-circle-fill"></i></div>
                <h3 className="h5 fw-bold">Mật khẩu đã được cập nhật</h3>
                <p className="text-secondary mb-4">
                  Bạn có thể đăng nhập lại vào hệ thống luyện thi TOEIC bằng mật khẩu mới.
                </p>
                <a className="btn btn-brand w-100 mb-2" href="/login">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Về trang đăng nhập
                </a>
                <button className="ghost-action mt-2" onClick={resetFlow}>
                  Thực hiện lại
                </button>
              </div>
            )}

            <div className="support-row d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <span><i className="bi bi-headset me-2"></i>Cần hỗ trợ tài khoản?</span>
              <a className="link-success fw-bold text-decoration-none" href="mailto:toeic@hcmute.edu.vn">
                Liên hệ hỗ trợ
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
