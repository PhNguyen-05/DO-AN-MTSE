import axios from './axios';

const api = {
  // ================== AUTH ==================
  register: (data) => axios.post('/register', data),
  
  verifyOTP: (data) => axios.post('/verify-otp', data),
  
  login: (data) => axios.post('/login', data),

  // ================== USER ==================
  getProfile: () => axios.get('/profile'),
  
  updateProfile: (data) => axios.put('/profile', data),

  // ================== ADMIN ==================
  getAdminDashboard: () => axios.get('/admin/dashboard'),

  // ================== OTHER ==================
  // Thêm các API khác sau này
};

export default api;