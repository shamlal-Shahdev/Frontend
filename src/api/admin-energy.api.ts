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
  getAll: async (status?: string): Promise<EnergyRequestListResponse> => {
    const params = status ? { status } : {};
    const response = await api.get('/admin/energy-requests', { params });
    return response.data;
  },
  getPending: async (): Promise<EnergyRequestListResponse> => {
    const response = await api.get('/admin/energy-requests/pending');
    return response.data;
  },
  getById: async (id: number): Promise<EnergyRequest> => {
    const response = await api.get(`/admin/energy-requests/${id}`);
    return response.data;
  },
  approve: async (
    id: number,
    dto?: ApproveEnergyRequestDto,
  ): Promise<EnergyRequest> => {
    const response = await api.post(`/admin/energy-requests/${id}/approve`, dto || {});
    return response.data;
  },
  reject: async (id: number, dto: RejectEnergyRequestDto): Promise<EnergyRequest> => {
    const response = await api.post(`/admin/energy-requests/${id}/reject`, dto);
    return response.data;
  },
};
