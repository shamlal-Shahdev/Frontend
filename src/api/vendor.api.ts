import { api } from './axios.config';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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
  companyName?: string | null;
  companyProfileComplete?: boolean;
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
  meterId?: string | null;
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
  /** Required when status is `completed` (utility meter ID). */
  meterId?: string;
}
export interface VendorUsageImportRow {
  id: number;
  batchId: number;
  rowNumber: number;
  meterId: string;
  totalKwh: string | number;
  status: 'pending' | 'accepted' | 'rejected';
  reasonCode?: string | null;
  installationId?: number | null;
  rewardTransactionId?: number | null;
}
export interface VendorUsageImportBatch {
  id: number;
  vendorUserId: number;
  periodYearMonth: string;
  originalFilename: string;
  fileId?: string | null;
  fileHash?: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summaryJson?: Record<string, unknown> | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  rows?: VendorUsageImportRow[];
}
interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  isVerified: boolean;
  role: string;
}
interface GetVendorsResponse {
  vendors: Vendor[];
  total: number;
}
interface VendorDashboardData {
  installations: {
    submitted: number;
    assigned: number;
    inProgress: number;
    completed: number;
    rejected: number;
  };
}

export interface VendorCompanyProfile {
  id: number;
  userId: number;
  companyName: string;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  addressLine?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertVendorCompanyProfileRequest {
  companyName: string;
  city?: string;
  province?: string;
  country?: string;
  addressLine?: string;
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
  getCompanyProfile: async (): Promise<VendorCompanyProfile | null> => {
    const response = await api.get('/vendor/company-profile');
    return response.data ?? null;
  },
  upsertCompanyProfile: async (
    data: UpsertVendorCompanyProfileRequest
  ): Promise<VendorCompanyProfile> => {
    const response = await api.put('/vendor/company-profile', data);
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
  getDashboard: async (): Promise<VendorDashboardData> => {
    const response = await api.get('/vendor/dashboard/stats');
    return response.data;
  },
  resendVerificationEmail: async (data: { email: string }): Promise<{ message: string }> => {
    const response = await api.post('/vendor/auth/resend-verification', data);
    return response.data;
  },
  downloadUsageImportTemplate: async (): Promise<Blob> => {
    const response = await api.get('/vendor/usage-imports/template.csv', {
      responseType: 'blob',
    });
    return response.data;
  },
  uploadUsageImport: async (
    periodYearMonth: string,
    file: File
  ): Promise<VendorUsageImportBatch> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('periodYearMonth', periodYearMonth);
    const token = localStorage.getItem('token');
    const res = await fetch(`${apiBase}/api/v1/vendor/usage-imports`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }
    if (!res.ok) {
      const raw = (data as { message?: string | string[] })?.message;
      const msg = Array.isArray(raw)
        ? raw.join(', ')
        : raw || `Upload failed (${res.status})`;
      throw new Error(msg);
    }
    return data as VendorUsageImportBatch;
  },
  listUsageImports: async (
    page = 1,
    limit = 10
  ): Promise<{ data: VendorUsageImportBatch[]; total: number; page: number; limit: number }> => {
    const response = await api.get('/vendor/usage-imports', { params: { page, limit } });
    return response.data;
  },
  getUsageImport: async (id: number): Promise<VendorUsageImportBatch> => {
    const response = await api.get(`/vendor/usage-imports/${id}`);
    return response.data;
  },
};
