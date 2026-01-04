import { api } from './axios.config';
import { authApi } from './auth.api';

interface UpdateProfileRequest {
  name?: string;
  phone?: string;
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

export const profileApi = {
  getProfile: async (): Promise<User> => {
    return authApi.getCurrentUser();
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.patch('/auth/me', data);
    return response.data;
  },
};
