import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ""
});

export const getAuthorizationHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

export const getApiMessage = (error, fallback = "Request failed.") => (
  error.response?.data?.message ||
  error.response?.data?.errors?.[0]?.msg ||
  fallback
);
