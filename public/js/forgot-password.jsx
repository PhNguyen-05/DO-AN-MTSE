const { Provider, useDispatch, useSelector } = ReactRedux;
const { createStore } = Redux;

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

const initialState = {
  form: initialForm,
  step: 0,
  loading: false,
  notice: null,
  showPassword: false
};

const actionTypes = {
  UPDATE_FIELD: "forgotPassword/updateField",
  SET_STEP: "forgotPassword/setStep",
  SET_LOADING: "forgotPassword/setLoading",
  SET_NOTICE: "forgotPassword/setNotice",
  TOGGLE_PASSWORD: "forgotPassword/togglePassword",
  RESET_FLOW: "forgotPassword/resetFlow"
};

function forgotPasswordReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.UPDATE_FIELD:
      return {
        ...state,
        form: {
          ...state.form,
          [action.payload.name]: action.payload.value
        }
      };
    case actionTypes.SET_STEP:
      return { ...state, step: action.payload };
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_NOTICE:
      return { ...state, notice: action.payload };
    case actionTypes.TOGGLE_PASSWORD:
      return { ...state, showPassword: !state.showPassword };
    case actionTypes.RESET_FLOW:
      return initialState;
    default:
      return state;
  }
}

const store = createStore(
  forgotPasswordReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const updateField = (name, value) => ({
  type: actionTypes.UPDATE_FIELD,
  payload: { name, value }
});

const setStep = (step) => ({ type: actionTypes.SET_STEP, payload: step });
const setLoading = (loading) => ({ type: actionTypes.SET_LOADING, payload: loading });
const setNotice = (notice) => ({ type: actionTypes.SET_NOTICE, payload: notice });
const togglePassword = () => ({ type: actionTypes.TOGGLE_PASSWORD });
const resetFlow = () => ({ type: actionTypes.RESET_FLOW });

const selectForm = (state) => state.form;
const selectStep = (state) => state.step;
const selectLoading = (state) => state.loading;
const selectNotice = (state) => state.notice;
const selectShowPassword = (state) => state.showPassword;

function getPasswordScore(password) {
  let score = 0;

  if (password.length >= 6) score += 35;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;

  return Math.min(score, 100);
}

function getMeterColor(score) {
  if (score < 45) return "#dc3545";
  if (score < 75) return "#f59e0b";
  return "#198754";
}

async function requestApi(url, body) {
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
}

function useForgotPasswordActions() {
  const dispatch = useDispatch();

  const runAction = async (action) => {
    dispatch(setLoading(true));
    dispatch(setNotice(null));

    try {
      await action();
    } catch (error) {
      dispatch(setNotice({ type: "danger", text: error.message }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const submitEmail = (email) =>
    runAction(async () => {
      const data = await requestApi("/api/forgot-password", { email });
      dispatch(setStep(1));
      dispatch(setNotice({ type: "success", text: data.message }));
    });

  const submitOtp = ({ email, otp }) =>
    runAction(async () => {
      const data = await requestApi("/api/verify-otp", { email, otp });
      dispatch(setStep(2));
      dispatch(setNotice({ type: "success", text: data.message }));
    });

  const submitPassword = ({ email, otp, newPassword, confirmPassword }) => {
    if (newPassword !== confirmPassword) {
      dispatch(setNotice({ type: "danger", text: "Mật khẩu nhập lại chưa khớp" }));
      return Promise.resolve();
    }

    return runAction(async () => {
      const data = await requestApi("/api/reset-password", { email, otp, newPassword });
      dispatch(setNotice({ type: "success", text: data.message }));
      window.location.href = "/login";
    });
  };

  const resendOtp = (email) =>
    runAction(async () => {
      const data = await requestApi("/api/forgot-password", { email });
      dispatch(setNotice({
        type: "success",
        text: `${data.message}. Vui lòng kiểm tra email hoặc terminal.`
      }));
    });

  return {
    updateField: (event) => dispatch(updateField(event.target.name, event.target.value)),
    submitEmail,
    submitOtp,
    submitPassword,
    resendOtp,
    togglePassword: () => dispatch(togglePassword()),
    resetFlow: () => dispatch(resetFlow())
  };
}

function Stepper() {
  const step = useSelector(selectStep);

  return (
    <div className="stepper" aria-label="Các bước đặt lại mật khẩu">
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
  );
}

function Notice() {
  const notice = useSelector(selectNotice);

  if (!notice) return null;

  return (
    <div className={`alert alert-${notice.type} d-flex align-items-start gap-2`} role="alert">
      <i className={`bi ${notice.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
      <span>{notice.text}</span>
    </div>
  );
}

function SubmitButton({ icon, children }) {
  const loading = useSelector(selectLoading);

  return (
    <button className="btn btn-brand w-100" disabled={loading}>
      {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className={`bi ${icon} me-2`}></i>}
      {children}
    </button>
  );
}

function FormField({ id, label, icon, children }) {
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{label}</label>
      {icon ? (
        <div className="input-group">
          <span className="input-group-text"><i className={`bi ${icon}`}></i></span>
          {children}
        </div>
      ) : children}
    </div>
  );
}

function EmailStep() {
  const form = useSelector(selectForm);
  const { updateField, submitEmail } = useForgotPasswordActions();

  const handleSubmit = (event) => {
    event.preventDefault();
    submitEmail(form.email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField id="email" label="Email tài khoản" icon="bi-envelope">
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
      </FormField>
      <SubmitButton icon="bi-send">Gửi mã OTP</SubmitButton>
    </form>
  );
}

function OtpStep() {
  const form = useSelector(selectForm);
  const loading = useSelector(selectLoading);
  const { updateField, submitOtp, resendOtp } = useForgotPasswordActions();

  const handleSubmit = (event) => {
    event.preventDefault();
    submitOtp({ email: form.email, otp: form.otp });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField id="otp" label="Mã OTP">
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
      </FormField>
      <SubmitButton icon="bi-shield-check">Xác thực OTP</SubmitButton>
      <button type="button" className="ghost-action mt-3 px-0" onClick={() => resendOtp(form.email)} disabled={loading}>
        Gửi lại mã
      </button>
    </form>
  );
}

function PasswordStep() {
  const form = useSelector(selectForm);
  const showPassword = useSelector(selectShowPassword);
  const { updateField, submitPassword, togglePassword } = useForgotPasswordActions();
  const passwordScore = getPasswordScore(form.newPassword);
  const meterColor = getMeterColor(passwordScore);

  const handleSubmit = (event) => {
    event.preventDefault();
    submitPassword(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField id="newPassword" label="Mật khẩu mới" icon="bi-lock">
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
          onClick={togglePassword}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
        </button>
      </FormField>
      <div className="password-meter mt-2 mb-3" style={{ "--strength": `${passwordScore}%`, "--meter": meterColor }}>
        <span></span>
      </div>

      <FormField id="confirmPassword" label="Nhập lại mật khẩu" icon="bi-check2-square">
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
      </FormField>

      <SubmitButton icon="bi-key">Đặt lại mật khẩu</SubmitButton>
    </form>
  );
}

function SuccessStep() {
  const { resetFlow } = useForgotPasswordActions();

  return (
    <div className="text-center py-2">
      <div className="display-5 text-success mb-3"><i className="bi bi-check-circle-fill"></i></div>
      <h3 className="h5 fw-bold">Mật khẩu đã được cập nhật</h3>
      <p className="text-secondary mb-4">
        Bạn có thể đăng nhập lại vào hệ thống luyện thi TOEIC bằng mật khẩu mới.
      </p>
      <button className="btn btn-brand w-100" onClick={resetFlow}>
        <i className="bi bi-arrow-clockwise me-2"></i>
        Thực hiện lại
      </button>
    </div>
  );
}

function StepContent() {
  const step = useSelector(selectStep);

  if (step === 0) return <EmailStep />;
  if (step === 1) return <OtpStep />;
  if (step === 2) return <PasswordStep />;
  return <SuccessStep />;
}

function SupportRow() {
  return (
    <div className="support-row d-flex align-items-center justify-content-between gap-3 flex-wrap">
      <span><i className="bi bi-headset me-2"></i>Cần hỗ trợ tài khoản?</span>
      <a className="link-success fw-bold text-decoration-none" href="mailto:support@toeicmastery.local">
        Liên hệ hỗ trợ
      </a>
    </div>
  );
}

function ForgotPasswordPage() {
  return (
    <main className="auth-shell">
      <section className="form-panel">
        <div className="reset-card">
          <p className="eyebrow">Bảo mật tài khoản</p>
          <h2>Quên mật khẩu</h2>
          <p className="lead">
            Nhập email đã đăng ký để nhận OTP, xác thực mã và tạo mật khẩu mới.
          </p>

          <Stepper />
          <Notice />
          <StepContent />
          <SupportRow />
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ForgotPasswordPage />
    </Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
