import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000", // Backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Errors like 401 Unauthorized or 403 Forbidden
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      // Clear token and force logout if unauthorized or forbidden (blocked/session expired)
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
