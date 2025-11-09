/**
 * HTTP client configuration
 */
// In development, use relative URL (proxy will handle it)
// In production, use full backend URL
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '' : 'http://localhost:3000');

export const client = {
  API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};