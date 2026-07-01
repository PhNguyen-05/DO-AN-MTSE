import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_LOGOUT_MESSAGES = [
  "tài khoản của bạn đã bị khóa",
  "phiên đăng nhập đã hết hạn",
  "đăng nhập ở thiết bị khác",
  "access token is required",
  "token is invalid",
  "token verification failed",
  "user not found",
  "unauthorized"
];

const shouldForceLogout = (error) => {
  const status = error.response?.status;
  const message = String(
    error.response?.data?.message ||
    error.response?.data?.errors?.[0]?.msg ||
    ""
  ).toLowerCase();

  if (status === 401) {
    return true;
  }

  if (status === 403) {
    return AUTH_LOGOUT_MESSAGES.some((text) => message.includes(text));
  }

  return false;
};

// Request Interceptor: Attach Token + Fix FormData Content-Type
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CRITICAL: Khi gửi FormData, KHÔNG set Content-Type = application/json
    // Axios / browser phải tự set multipart/form-data với boundary đúng
    // Nếu không xóa, multer sẽ không parse được req.files → file không lưu được
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: only force logout for auth/session/account-lock errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config && (
      error.config.url.includes("/api/auth/login") ||
      error.config.url.includes("/api/auth/google-login")
    );

    if (shouldForceLogout(error) && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
