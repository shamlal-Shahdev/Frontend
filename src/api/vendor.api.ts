import { api } from './axios.config';

interface VendorRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface VendorLoginRequest {
  email: string;
  password: string;
}

interface VendorUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface VendorLoginResponse {
  token: string;
  user: VendorUser;
}

interface VendorRegisterResponse {
  message: string;
}

interface InstallationEntity {
  id: number;
  userId: number;
  name: string;
  installationType: string;
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
  data: InstallationEntity[];
  total: number;
  page: number;
  limit: number;
}

interface UpdateInstallationStatusRequest {
  status: 'in_progress' | 'completed' | 'rejected';
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  isVerified: boolean;
  role: string;
}

interface GetVendorsResponse {
  vendors: Vendor[];
  total: number;
}

export const vendorApi = {
  register: async (data: VendorRegisterRequest): Promise<VendorRegisterResponse> => {
    const response = await api.post('/vendor/auth/register', data);
    return response.data;
  },

  login: async (data: VendorLoginRequest): Promise<VendorLoginResponse> => {
    const response = await api.post('/vendor/auth/login', data);
    return response.data;
  },

  getInstallations: async (page: number = 1, limit: number = 10): Promise<GetInstallationsResponse> => {
    const response = await api.get('/vendor/installations', {
      params: { page, limit },
    });
    return response.data;
  },

  getInstallationById: async (id: number): Promise<InstallationEntity> => {
    const response = await api.get(`/vendor/installations/${id}`);
    return response.data;
  },

  updateInstallationStatus: async (
    id: number,
    data: UpdateInstallationStatusRequest
  ): Promise<InstallationEntity> => {
    const response = await api.patch(`/vendor/installations/${id}/status`, data);
    return response.data;
  },

  getVendors: async (verified: boolean = true): Promise<GetVendorsResponse> => {
    const response = await api.get('/vendors', {
      params: { verified },
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/vendor/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/vendor/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};


