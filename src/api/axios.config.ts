import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/admin/login', '/vendor/login', '/vendor/register'].includes(currentPath);
      const isFormPage = ['/install-to-earn', '/kyc/documents', '/kyc/info'].includes(currentPath);
      if (!isAuthPage && !isFormPage && localStorage.getItem('token')) {
        const userRole = localStorage.getItem('userRole');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        if (userRole === 'admin') {
          window.location.href = '/admin/login';
        } else if (userRole === 'vendor') {
          window.location.href = '/vendor/login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
