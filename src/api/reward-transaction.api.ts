import { api } from './axios.config';

export interface RewardTransaction {
  id: number;
  userId: number;
  installationId?: number | null;
  tokensAmount: number | string;
  tokensPerKwh: number | string;
  kwhRewarded: number | string;
  txHash?: string | null;
  reason: string;
  vendorUsageBatchId?: number | null;
  usagePeriodYearMonth?: string | null;
  issuedAt: string;
}

export interface RewardTransactionsPaginatedResponse {
  data: RewardTransaction[];
  total: number;
  page: number;
  limit: number;
}

export const rewardTransactionApi = {
  getMyRewards: async (page = 1, limit = 20): Promise<RewardTransactionsPaginatedResponse> => {
    const response = await api.get('/reward-transactions', {
      params: { page, limit },
    });
    return response.data;
  },
};
