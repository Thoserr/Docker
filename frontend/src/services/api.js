import axios from 'axios';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { clearAuth } = useAuthStore.getState();
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuth();
      toast.error('Session expired. Please log in again.');
      // Redirect to login page
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Users API
export const usersAPI = {
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => api.get('/users/stats'),
  search: (query, type = 'all') => api.get(`/users/search?q=${query}&type=${type}`),
  getById: (id) => api.get(`/users/${id}`),
  getNotifications: () => api.get('/users/notifications'),
};

// Uploaders API
export const uploadersAPI = {
  apply: (data) => api.post('/uploaders/apply', data),
  updateProfile: (data) => api.put('/uploaders/profile', data),
  getPending: (page = 1, limit = 10) => api.get(`/uploaders/pending?page=${page}&limit=${limit}`),
  updateStatus: (id, data) => api.put(`/uploaders/${id}/status`, data),
  getApproved: (page = 1, limit = 20) => api.get(`/uploaders/approved?page=${page}&limit=${limit}`),
};

// Sheets API
export const sheetsAPI = {
  upload: (formData) => api.post('/sheets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/sheets?${queryString}`);
  },
  getById: (id) => api.get(`/sheets/${id}`),
  download: (id) => api.post(`/sheets/${id}/download`),
  getMyUploads: (page = 1, limit = 10) => api.get(`/sheets/my/uploads?page=${page}&limit=${limit}`),
  update: (id, data) => api.put(`/sheets/${id}`, data),
  delete: (id) => api.delete(`/sheets/${id}`),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  uploadPaymentSlip: (id, formData) => api.post(`/orders/${id}/payment`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMy: (page = 1, limit = 10, status) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    return api.get(`/orders/my?${params}`);
  },
  getPurchased: (page = 1, limit = 10) => api.get(`/orders/purchased?page=${page}&limit=${limit}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  getById: (id) => api.get(`/orders/${id}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (page = 1, limit = 20, search, role) => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    return api.get(`/admin/users?${params}`);
  },
  getPendingSheets: (page = 1, limit = 10) => api.get(`/admin/sheets/pending?page=${page}&limit=${limit}`),
  updateSheetStatus: (id, data) => api.put(`/admin/sheets/${id}/status`, data),
  getOrders: (page = 1, limit = 20, status) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    return api.get(`/admin/orders?${params}`);
  },
  confirmPayment: (id) => api.put(`/admin/orders/${id}/confirm-payment`),
  getAllSheets: (page = 1, limit = 20, status, search) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return api.get(`/admin/sheets?${params}`);
  },
  deleteSheet: (id) => api.delete(`/admin/sheets/${id}`),
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
};

export default api;