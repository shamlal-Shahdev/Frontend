import { client } from './client';

interface KYCSubmission {
  id: string;
  user_id: string;
  cnic_front_url: string;
  cnic_back_url: string;
  utility_bill_url: string;
  selfie_url: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

interface Installation {
  id: string;
  user_id: string;
  installation_type: string;
  capacity_kw: number;
  inverter_id: string;
  location: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  verification_date?: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

export const adminApi = {
  checkAdminRole: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${client.API_URL}/admin/check-role`, {
        headers: {
          ...client.headers,
          ...client.getAuthHeader(),
        },
      });

      if (!response.ok) return false;
      
      const data = await response.json();
      return data.isAdmin;
    } catch (error) {
      return false;
    }
  },

  getPendingKYC: async (): Promise<KYCSubmission[]> => {
    const response = await fetch(`${client.API_URL}/admin/kyc?status=pending`, {
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch KYC submissions');
    }

    return response.json();
  },

  getPendingInstallations: async (): Promise<Installation[]> => {
    const response = await fetch(`${client.API_URL}/admin/installations?status=pending`, {
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch installations');
    }

    return response.json();
  },

  reviewKYC: async (submissionId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    const response = await fetch(`${client.API_URL}/admin/kyc/${submissionId}/review`, {
      method: 'POST',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
      body: JSON.stringify({
        status,
        rejectionReason,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to review KYC');
    }

    return response.json();
  },

  reviewInstallation: async (installationId: string, status: 'verified' | 'rejected') => {
    const response = await fetch(`${client.API_URL}/admin/installations/${installationId}/review`, {
      method: 'POST',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to review installation');
    }

    return response.json();
  },
};