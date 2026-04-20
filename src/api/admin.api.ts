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
  kyc: {
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  };
  installations: {
    submitted: number;
    assigned: number;
    inProgress: number;
    completed: number;
    rejected: number;
  };
  energyRequests: {
    pending: number;
    approved: number;
    rejected: number;
    rewardGenerated: number;
    blockchainFailed: number;
  };
}
export interface AdminRewardTransactionUser {
  id: number;
  name: string;
  email: string;
}
export interface AdminRewardTransactionInstallation {
  id: number;
  name?: string;
  location?: string;
}
export interface AdminRewardTransaction {
  id: number;
  userId: number;
  installationId: number;
  tokensAmount: string | number;
  tokensPerKwh: string | number;
  kwhRewarded: string | number;
  txHash: string | null;
  reason: string;
  oracleId: number | null;
  vendorUsageBatchId: number | null;
  usagePeriodYearMonth: string | null;
  issuedAt: string;
  user?: AdminRewardTransactionUser;
  installation?: AdminRewardTransactionInstallation;
}
export interface AdminRewardTransactionsResponse {
  items: AdminRewardTransaction[];
  total: number;
  page: number;
  limit: number;
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
  utilityMeterReference?: string | null;
  city: string;
  province: string;
  country: string;
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  /** Per-submission status (source of truth after backend refactor). */
  status?: string;
  rejectionReason?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
    /** Legacy; prefer `status` on the KYC row. */
    kycStatus?: string;
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
interface UpdateInstallationRequest {
  status?: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'rejected';
  isActive?: boolean;
}
interface AssignVendorRequest {
  vendorId: number;
}
interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
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
  getInstallations: async (page: number = 1, limit: number = 10): Promise<GetInstallationsResponse> => {
    const response = await api.get('/admin/installations', {
      params: { page, limit },
    });
    return response.data;
  },
  getInstallationById: async (id: number): Promise<InstallationEntity> => {
    const response = await api.get(`/admin/installations/${id}`);
    return response.data;
  },
  updateInstallation: async (id: number, data: UpdateInstallationRequest): Promise<InstallationEntity> => {
    const response = await api.patch(`/admin/installations/${id}`, data);
    return response.data;
  },
  assignVendor: async (id: number, data: AssignVendorRequest): Promise<InstallationEntity> => {
    const response = await api.patch(`/admin/installations/${id}/assign`, data);
    return response.data;
  },
  getVendors: async (): Promise<{ users: Vendor[] }> => {
    const response = await api.get('/admin/users', {
      params: { limit: 1000 }, 
    });
    return {
      users: (response.data.users || []).filter((user: any) => user.role === 'vendor' || user.role?.toLowerCase() === 'vendor')
    };
  },
  deleteInstallation: async (id: number): Promise<void> => {
    await api.delete(`/admin/installations/${id}`);
  },
  getRewardTransactions: async (
    page: number = 1,
    limit: number = 25,
  ): Promise<AdminRewardTransactionsResponse> => {
    const response = await api.get<AdminRewardTransactionsResponse>('/reward-transactions', {
      params: { page, limit },
    });
    return response.data;
  },
};
