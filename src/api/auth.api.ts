import { api } from './axios.config';

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  kycStatus?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const authApi = {
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};





