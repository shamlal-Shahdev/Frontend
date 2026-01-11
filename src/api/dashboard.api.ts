import { api } from './axios.config';

interface DashboardData {
  totalEnergyGenerated: number;
  totalTokensEarned: number;
  tokensRedeemed: number;
  tokensAvailable: number;
  activePredictions: number;
  certificatesEarned: number;
  recentActivity: Array<{
    type: string;
    description: string;
    date: Date;
  }>;
}

export const dashboardApi = {
  getUserDashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard/user');
    return response.data;
  },
};










