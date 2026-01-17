import { api } from './axios.config';
import { EnergyRequest } from './energy.api';

export interface EnergyRequestListResponse {
  requests: EnergyRequest[];
  total: number;
}

export interface ApproveEnergyRequestDto {
  remark?: string;
  rewardAmount?: number;
}

export interface RejectEnergyRequestDto {
  reason: string;
}

export const adminEnergyApi = {
  /**
   * Get all energy requests (optionally filtered by status)
   */
  getAll: async (status?: string): Promise<EnergyRequestListResponse> => {
    const params = status ? { status } : {};
    const response = await api.get('/admin/energy-requests', { params });
    return response.data;
  },

  /**
   * Get pending energy requests
   */
  getPending: async (): Promise<EnergyRequestListResponse> => {
    const response = await api.get('/admin/energy-requests/pending');
    return response.data;
  },

  /**
   * Get energy request by ID
   */
  getById: async (id: number): Promise<EnergyRequest> => {
    const response = await api.get(`/admin/energy-requests/${id}`);
    return response.data;
  },

  /**
   * Approve energy request and generate reward
   */
  approve: async (
    id: number,
    dto?: ApproveEnergyRequestDto,
  ): Promise<EnergyRequest> => {
    const response = await api.post(`/admin/energy-requests/${id}/approve`, dto || {});
    return response.data;
  },

  /**
   * Reject energy request
   */
  reject: async (id: number, dto: RejectEnergyRequestDto): Promise<EnergyRequest> => {
    const response = await api.post(`/admin/energy-requests/${id}/reject`, dto);
    return response.data;
  },
};


