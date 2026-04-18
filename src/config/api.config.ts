export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000, 
  retryAttempts: 3,
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/api/auth/register',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      verifyEmail: '/auth/verify-email',
    },
    users: {
      profile: '/users/profile',
      updateProfile: '/users/profile',
      changePassword: '/users/change-password',
    },
  },
} as const;
