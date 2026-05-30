import { api } from './axios.config';
import axios from 'axios';
import type {
  Certificate,
  CertificateAdminStats,
  CertificateListQuery,
  CertificateListResponse,
  CertificateStats,
  CertificateVerifyResult,
  LatestCertificateSummary,
  CertificateMonthOverview,
} from '@/types/certificate.types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const certificateApi = {
  getMine: async (query?: CertificateListQuery): Promise<CertificateListResponse> => {
    const response = await api.get<CertificateListResponse>('/certificates/me', {
      params: query,
    });
    return response.data;
  },

  getMyStats: async (): Promise<CertificateStats> => {
    const response = await api.get<CertificateStats>('/certificates/me/stats');
    return response.data;
  },

  getMyMonthlyOverview: async (): Promise<CertificateMonthOverview[]> => {
    const response = await api.get<CertificateMonthOverview[]>('/certificates/me/months');
    return response.data;
  },

  getMyLatest: async (): Promise<LatestCertificateSummary | null> => {
    const response = await api.get<LatestCertificateSummary | null>(
      '/certificates/me/latest',
    );
    return response.data;
  },

  downloadMine: async (id: number): Promise<Blob> => {
    const response = await api.get(`/certificates/me/${id}/download`, {
      responseType: 'blob',
    });
    const blob = response.data as Blob;
    const contentType = response.headers['content-type'] as string | undefined;
    if (
      contentType?.includes('application/json') ||
      (blob.type && blob.type.includes('application/json'))
    ) {
      const message = await blob.text();
      throw new Error(
        message.includes('message')
          ? (JSON.parse(message) as { message?: string }).message ??
              'Failed to download certificate PDF'
          : 'Failed to download certificate PDF',
      );
    }
    if (blob.size < 5) {
      throw new Error('Downloaded certificate file is empty');
    }
    return blob;
  },

  verify: async (certificateId: string): Promise<CertificateVerifyResult> => {
    const response = await axios.get<CertificateVerifyResult>(
      `${BASE_URL}/api/v1/certificates/verify/${encodeURIComponent(certificateId)}`,
    );
    return response.data;
  },
};

export const adminCertificateApi = {
  getAll: async (query?: CertificateListQuery): Promise<CertificateListResponse> => {
    const response = await api.get<CertificateListResponse>('/admin/certificates', {
      params: query,
    });
    return response.data;
  },

  getStats: async (): Promise<CertificateAdminStats> => {
    const response = await api.get<CertificateAdminStats>('/admin/certificates/stats');
    return response.data;
  },

  revoke: async (id: number): Promise<Certificate> => {
    const response = await api.post<Certificate>(`/admin/certificates/${id}/revoke`);
    return response.data;
  },
};
