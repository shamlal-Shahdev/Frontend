import { api } from './axios.config';

export interface UserWalletInfo {
  address: string | null;
}

export const userWalletApi = {
  getMyWallet: async (): Promise<UserWalletInfo> => {
    const response = await api.get('/user-wallet/me');
    return response.data;
  },
  connectWallet: async (address: string) => {
    const response = await api.post('/user-wallet/connect', { address });
    return response.data;
  },
};
