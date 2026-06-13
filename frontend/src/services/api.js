import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ""
});

export const getAuthorizationHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

export const getApiMessage = (error, fallback) => {
  const data = error.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((item) => item.msg).join(" ");
  }

  return data?.message || fallback;
};
