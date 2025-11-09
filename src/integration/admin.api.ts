import { client } from './client';
import { KycStatus, Document } from './kyc.api';

// ==================== TYPES ====================

export interface DashboardStats {
  totalUsers: number;
  totalKyc: number;
  stats: {
    pending: number;
    in_review: number;
    approved: number;
    rejected: number;
  };
}

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  kycStatus?: KycStatus;
  kycSubmissionCount?: number;
  createdAt: string;
}

export interface PaginatedUsersResponse {
  users: UserListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FilterUsersParams {
  email?: string;
  cnicNumber?: string;
  kycStatus?: KycStatus;
  page?: number;
  limit?: number;
}

export interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  kyc?: {
    id: string;
    status: KycStatus;
    city: string;
    province: string;
    country: string;
    gender: string;
    dateOfBirth: string;
    cnicNumber: string;
    rejectionReason?: string;
    submissionCount: number;
    reviewedAt?: string;
    approvedAt?: string;
    documents: Document[];
  };
  auditLogs?: AuditLog[];
}

export interface AuditLog {
  action: string;
  description: string;
  createdAt: string;
}

export interface ApproveKycRequest {
  note?: string;
}

export interface RejectKycRequest {
  reason: string;
}

export interface RequestDocumentsRequest {
  documentTypes: string[];
  message: string;
}

export interface AuditLogsResponse {
  logs: {
    id: string;
    action: string;
    description: string;
    createdAt: string;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${client.API_URL}/api/v1/admin/dashboard/stats`, {
      method: 'GET',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch dashboard stats');
    }

    return response.json();
  },

  // Get all users with filters and pagination
  getUsers: async (params: FilterUsersParams = {}): Promise<PaginatedUsersResponse> => {
    const queryParams = new URLSearchParams();
    if (params.email) queryParams.append('email', params.email);
    if (params.cnicNumber) queryParams.append('cnicNumber', params.cnicNumber);
    if (params.kycStatus) queryParams.append('kycStatus', params.kycStatus);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${client.API_URL}/api/v1/admin/users?${queryParams}`, {
      method: 'GET',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return response.json();
  },

  // Get specific user details
  getUserDetails: async (userId: string): Promise<UserDetail> => {
    const response = await fetch(`${client.API_URL}/api/v1/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user details');
    }

    return response.json();
  },

  // Approve KYC submission
  approveKyc: async (userId: string, data: ApproveKycRequest): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${client.API_URL}/api/v1/admin/kyc/${userId}/approve`, {
      method: 'PUT',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve KYC');
    }

    return response.json();
  },

  // Reject KYC submission
  rejectKyc: async (userId: string, data: RejectKycRequest): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${client.API_URL}/api/v1/admin/kyc/${userId}/reject`, {
      method: 'PUT',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject KYC');
    }

    return response.json();
  },

  // Request additional documents
  requestDocuments: async (userId: string, data: RequestDocumentsRequest): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${client.API_URL}/api/v1/admin/kyc/${userId}/request-documents`, {
      method: 'POST',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request documents');
    }

    return response.json();
  },

  // Get audit logs with optional filters
  getAuditLogs: async (params: { userId?: string; page?: number; limit?: number } = {}): Promise<AuditLogsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${client.API_URL}/api/v1/admin/audit-logs?${queryParams}`, {
      method: 'GET',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch audit logs');
    }

    return response.json();
  },
};