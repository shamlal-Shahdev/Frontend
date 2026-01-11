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
    // Only redirect to login if 401 and NOT already on login/register pages
    // Also exclude form submission pages to let components handle errors
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/admin/login', '/vendor/login', '/vendor/register'].includes(currentPath);
      const isFormPage = ['/install-to-earn', '/kyc/documents', '/kyc/info'].includes(currentPath);
      
      // Only redirect if not on auth/form pages and token exists (meaning user was logged in)
      // For form pages, let the component handle the error gracefully
      if (!isAuthPage && !isFormPage && localStorage.getItem('token')) {
        const userRole = localStorage.getItem('userRole');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        // Redirect to appropriate login page based on role
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



