import { api } from './axios.config';

export type CouponValueType = 'amount' | 'percentage';

export interface MarketplaceCoupon {
  id: number;
  title: string;
  description: string;
  couponValue: number;
  valueType?: CouponValueType;
  tokenCost: number;
  quantity: number;
  expiryDate: string;
  imageUrl?: string | null;
  vendorName: string;
  vendorId: number;
  status: string;
  termsAndConditions?: string;
  createdAt?: string;
}

export interface CouponPurchaseResult {
  purchase: {
    id: number;
    tokensUsed: number;
    purchaseDate: string;
    status: string;
    txHash?: string | null;
    blockNumber?: number | null;
  };
  remainingBalance: number;
  vendorName: string;
  expiryDate: string;
  txHash: string;
  blockNumber: number;
}

export interface MyCoupon {
  id: number;
  couponId: number;
  couponTitle: string;
  couponValue: number;
  valueType?: CouponValueType;
  vendorName: string;
  couponCode: string;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'used' | 'expired';
  tokensUsed: number;
}

export interface VendorMarketplaceStats {
  totalCoupons: number;
  totalCouponsSold: number;
  walletBalance: number;
  pendingWithdrawals: number;
}

export interface VendorCoupon {
  id: number;
  title: string;
  description: string;
  couponValue: number;
  valueType?: CouponValueType;
  tokenCost: number;
  quantity: number;
  sold: number;
  expiryDate: string;
  status: string;
  redemptionCode?: string;
  imageUrl?: string | null;
  termsAndConditions?: string;
  createdAt: string;
}

export interface VendorWalletInfo {
  balance: number;
  canWithdraw: boolean;
  withdrawalMinimum: number;
  hasActiveWithdrawal?: boolean;
  pendingWithdrawals: WithdrawalRequest[];
}

export interface WithdrawalRequest {
  id: number;
  vendorId?: number;
  vendorName?: string;
  vendorEmail?: string;
  amount: number;
  bankDetails: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string | null;
}

export interface VendorTransaction {
  id: number;
  purchaseDate: string;
  userName: string;
  couponTitle: string;
  tokensUsed: number;
  txHash: string | null;
  status: string;
}

export interface AdminMarketplaceStats {
  totalCoupons: number;
  totalVendors: number;
  couponsSold: number;
  tokensRedeemed: number;
  pendingWithdrawRequests: number;
}

export interface CreateCouponRequest {
  title: string;
  description: string;
  couponValue: number;
  valueType?: CouponValueType;
  tokenCost: number;
  quantity: number;
  expiryDate: string;
  termsAndConditions: string;
  redemptionCode: string;
  imageUrl?: string;
}

export const marketplaceApi = {
  getCoupons: async (): Promise<MarketplaceCoupon[]> => {
    const response = await api.get('/marketplace/coupons');
    return response.data;
  },

  getCouponById: async (id: number): Promise<MarketplaceCoupon> => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },

  purchaseCoupon: async (couponId: number): Promise<CouponPurchaseResult> => {
    const response = await api.post('/coupons/purchase', { couponId });
    return response.data;
  },

  getMyCoupons: async (): Promise<MyCoupon[]> => {
    const response = await api.get('/user/my-coupons');
    return response.data;
  },

  redeemCoupon: async (purchaseId: number) => {
    const response = await api.post(`/user/my-coupons/${purchaseId}/redeem`);
    return response.data;
  },

  getVendorStats: async (): Promise<VendorMarketplaceStats> => {
    const response = await api.get('/vendor/marketplace/stats');
    return response.data;
  },

  getVendorCoupons: async (): Promise<VendorCoupon[]> => {
    const response = await api.get('/vendor/coupons');
    return response.data;
  },

  createCoupon: async (data: CreateCouponRequest): Promise<VendorCoupon> => {
    const response = await api.post('/vendor/coupons', data);
    return response.data;
  },

  updateCoupon: async (
    id: number,
    data: Partial<CreateCouponRequest> & { status?: string },
  ): Promise<VendorCoupon> => {
    const response = await api.put(`/vendor/coupons/${id}`, data);
    return response.data;
  },

  disableCoupon: async (id: number): Promise<VendorCoupon> => {
    const response = await api.patch(`/vendor/coupons/${id}/disable`);
    return response.data;
  },

  deleteCoupon: async (id: number): Promise<void> => {
    await api.delete(`/vendor/coupons/${id}`);
  },

  getVendorWallet: async (): Promise<VendorWalletInfo> => {
    const response = await api.get('/vendor/wallet');
    return response.data;
  },

  requestWithdrawal: async (data: {
    amount: number;
    bankDetails: string;
  }): Promise<WithdrawalRequest> => {
    const response = await api.post('/vendor/withdraw', data);
    return response.data;
  },

  getVendorWithdrawals: async (): Promise<WithdrawalRequest[]> => {
    const response = await api.get('/vendor/withdrawals');
    return response.data;
  },

  getAdminStats: async (): Promise<AdminMarketplaceStats> => {
    const response = await api.get('/admin/marketplace/stats');
    return response.data;
  },

  getAdminCoupons: async (): Promise<MarketplaceCoupon[]> => {
    const response = await api.get('/admin/marketplace/coupons');
    return response.data;
  },

  adminDisableCoupon: async (id: number) => {
    const response = await api.patch(`/admin/marketplace/coupons/${id}/disable`);
    return response.data;
  },

  getAdminWithdrawals: async (): Promise<WithdrawalRequest[]> => {
    const response = await api.get('/admin/withdrawals');
    return response.data;
  },

  processWithdrawal: async (
    id: number,
    status: 'in_progress' | 'approved' | 'rejected',
  ): Promise<WithdrawalRequest> => {
    const response = await api.post(`/admin/withdraw/${id}`, { status });
    return response.data;
  },

  getVendorTransactions: async (): Promise<VendorTransaction[]> => {
    const response = await api.get('/vendor/transactions');
    return response.data;
  },
};
