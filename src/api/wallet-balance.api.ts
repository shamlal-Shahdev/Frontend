import { api } from './axios.config';
export interface WalletBalance {
  id: number;
  userId: number;
  balance: string;
  updatedAt: string;
}
export const walletBalanceApi = {
  getMyBalance: async (): Promise<WalletBalance> => {
    const response = await api.get('/wallet-balances/my-balance');
    return response.data;
  },
  syncMyBalance: async (): Promise<WalletBalance> => {
    const response = await api.get('/wallet-balances/my-balance/sync');
    return response.data;
  },
  getByUserId: async (userId: number): Promise<WalletBalance> => {
    const response = await api.get(`/wallet-balances/user/${userId}`);
    return response.data;
  },
  syncUserBalance: async (userId: number): Promise<WalletBalance> => {
    const response = await api.get(`/wallet-balances/user/${userId}/sync`);
    return response.data;
  },
};
