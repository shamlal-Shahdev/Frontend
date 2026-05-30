import { api } from './axios.config';
export type KycMeterCrosscheck =
  | 'skipped'
  | 'match'
  | 'mismatch'
  | 'no_kyc_reference';
export interface EnergyRequest {
  id: number;
  userId: number;
  meterImageUrl: string;
  meterIdFromImage: string | null;
  ocrRawText: string | null;
  ocrAvgConfidence: number | null;
  ocrMeterIdCandidate: string | null;
  kycMeterCrosscheck: KycMeterCrosscheck | null;
  month: number;
  year: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REWARD_GENERATED' | 'BLOCKCHAIN_FAILED';
  adminRemark: string | null;
  approvedByAdminId: number | null;
  rewardAmount: number | null;
  blockchainTxHash: string | null;
  energyGeneratedKwh: number | null;
  createdAt: string;
  updatedAt: string;
}
export interface EnergyRequestStatusResponse {
  requests: EnergyRequest[];
  total: number;
}
export const energyApi = {
  getStatus: async (): Promise<EnergyRequestStatusResponse> => {
    const response = await api.get('/energy/status');
    return response.data;
  },
  getById: async (id: number): Promise<EnergyRequest> => {
    const response = await api.get(`/energy/${id}`);
    return response.data;
  },
};
