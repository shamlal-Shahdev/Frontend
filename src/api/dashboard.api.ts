import { api } from './axios.config';
interface EnergyTrendData {
  month: string;
  energy: number;
}
interface RewardDistributionData {
  category: string;
  amount: number;
  percentage: number;
}
interface DashboardData {
  totalEnergyGenerated: number;
  totalTokensEarned: number;
  tokensRedeemed: number;
  tokensAvailable: number;
  activePredictions: number;
  certificatesEarned: number;
  energyGenerationTrend: EnergyTrendData[];
  rewardsDistribution: RewardDistributionData[];
  recentActivity: Array<{
    type: string;
    description: string;
    date: Date | string;
    amount?: number;
  }>;
}
export const dashboardApi = {
  getUserDashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/users/dashboard/user');
    return response.data;
  },
};
