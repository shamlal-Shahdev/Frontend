import { api } from './axios.config';

export interface WalletBalance {
  id: number;
  userId: number;
  balance: string;
  updatedAt: string;
}

export const walletBalanceApi = {
  /**
   * Get current user's wallet balance (synced from blockchain)
   * @returns Promise<WalletBalance>
   */
  getMyBalance: async (): Promise<WalletBalance> => {
    const response = await api.get('/wallet-balances/my-balance');
    return response.data;
  },

  /**
   * Get wallet balance by user ID (admin or user)
   * @param userId - User ID
   * @returns Promise<WalletBalance>
   */
  getByUserId: async (userId: number): Promise<WalletBalance> => {
    const response = await api.get(`/wallet-balances/user/${userId}`);
    return response.data;
  },

  /**
   * Sync wallet balance from blockchain for a user (admin only)
   * @param userId - User ID
   * @returns Promise<WalletBalance>
   */
  syncUserBalance: async (userId: number): Promise<WalletBalance> => {
    const response = await api.get(`/wallet-balances/user/${userId}/sync`);
    return response.data;
  },
};
