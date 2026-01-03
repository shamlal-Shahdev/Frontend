import { api } from './axios.config';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  walletAddress: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
}

interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await api.put('/profile', data);
    return response.data;
  },
};


