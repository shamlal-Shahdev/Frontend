import { api } from './axios.config';

interface AdminLoginRequest {
  email: string;
  password: string;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  kycStatus: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminLoginResponse {
  token: string;
  user: AdminUser;
}

interface AdminDashboardData {
  users: {
    total: number;
    verified: number;
  };
  kyc: {
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  };
}

interface KycDocument {
  id: number;
  userId: number;
  docType: string;
  filePath: string;
  fileHash: string;
  city: string;
  province: string;
  country: string;
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface KycEntity {
  id: number;
  userId: number;
  CnicFrontUrl: string;
  CnicBackUrl: string;
  SelfieUrl: string;
  UtilityBillUrl: string;
  city: string;
  province: string;
  country: string;
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
    kycStatus: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface UserWithKyc {
  id: number;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
  kycDocuments: KycDocument[];
  kycDocumentsCount: number;
}

interface GetUsersWithKycResponse {
  users: UserWithKyc[];
  total: number;
}

interface GetUserDocumentsResponse {
  documents: KycEntity[];
  userId: number;
  total: number;
}

interface ApproveKycRequest {
  note?: string;
}

interface ApproveKycResponse {
  message: string;
  userId: number;
  status: string;
}

interface RejectKycRequest {
  reason: string;
}

interface RejectKycResponse {
  message: string;
  userId: number;
  status: string;
  reason: string;
}

export const adminApi = {
  login: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await api.post('/admin/auth/login', data);
    return response.data;
  },

  getDashboard: async (): Promise<AdminDashboardData> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getUsersWithKyc: async (): Promise<GetUsersWithKycResponse> => {
    const response = await api.get('/admin/kyc/users');
    return response.data;
  },

  getUserDocuments: async (userId: number): Promise<GetUserDocumentsResponse> => {
    const response = await api.get(`/admin/kyc/${userId}/documents`);
    return response.data;
  },

  approveKyc: async (userId: number, data?: ApproveKycRequest): Promise<ApproveKycResponse> => {
    const response = await api.put(`/admin/kyc/${userId}/approve`, data || {});
    return response.data;
  },

  rejectKyc: async (userId: number, data: RejectKycRequest): Promise<RejectKycResponse> => {
    const response = await api.put(`/admin/kyc/${userId}/reject`, data);
    return response.data;
  },
};





