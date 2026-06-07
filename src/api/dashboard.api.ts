import { api } from './axios.config';
import type { DashboardData } from '@/types/api.types';
export const dashboardApi = {
  getUserDashboard: async (months = 6): Promise<DashboardData> => {
    const response = await api.get('/users/dashboard/user', { params: { months } });
    return response.data;
  },
};
