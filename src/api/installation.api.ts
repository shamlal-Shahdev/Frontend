import { api } from './axios.config';

interface InstallationResponse {
  id: number;
  userId: number;
  name: string;
  installationType: 'rooftop_solar';
  capacityKw: number;
  location: string;
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'rejected';
  isActive: boolean;
  registeredAt: string;
  verifiedAt?: string | null;
  vendorId?: number | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  };
  vendor?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface GetInstallationsResponse {
  data: InstallationResponse[];
  total: number;
  page: number;
  limit: number;
}

interface SubmitInstallationRequest {
  name: string;
  installationType: 'rooftop_solar';
  capacityKw: number;
  location: string;
  vendorId: number;
}

export const installationApi = {
  submit: async (data: SubmitInstallationRequest): Promise<InstallationResponse> => {
    const response = await api.post('/installations', data);
    return response.data;
  },

  getAll: async (page: number = 1, limit: number = 10): Promise<GetInstallationsResponse> => {
    const response = await api.get('/installations', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: number): Promise<InstallationResponse> => {
    const response = await api.get(`/installations/${id}`);
    return response.data;
  },

  cancel: async (id: number): Promise<void> => {
    await api.delete(`/installations/${id}`);
  },

  getUserInstallations: async (): Promise<InstallationResponse[]> => {
    const response = await api.get('/installations/user/installations');
    return response.data;
  },
};

