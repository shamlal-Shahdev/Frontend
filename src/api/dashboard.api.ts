import { api } from './axios.config';
import type { DashboardData } from '@/types/api.types';
export const dashboardApi = {
  getUserDashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/users/dashboard/user');
    return response.data;
  },
};
