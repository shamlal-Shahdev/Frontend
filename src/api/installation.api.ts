import { api } from './axios.config';

interface InstallationResponse {
  id: number;
  userId: number;
  name: string;
  installationType: 'rooftop_solar';
  capacityKw: number;
  location: string;
  status: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  registeredAt: string;
  verifiedAt?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  };
}

interface SubmitInstallationRequest {
  name: string;
  installationType: 'rooftop_solar';
  capacityKw: number;
  location: string;
}

export const installationApi = {
  submit: async (data: SubmitInstallationRequest): Promise<InstallationResponse> => {
    const response = await api.post('/installations', data);
    return response.data;
  },

  getAll: async (): Promise<InstallationResponse[]> => {
    const response = await api.get('/installations');
    return response.data;
  },

  getById: async (id: number): Promise<InstallationResponse> => {
    const response = await api.get(`/installations/${id}`);
    return response.data;
  },
};

