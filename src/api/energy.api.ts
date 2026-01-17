import { api } from './axios.config';

export interface EnergyRequest {
  id: number;
  userId: number;
  meterImageUrl: string;
  meterIdFromImage: string | null;
  month: number;
  year: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REWARD_GENERATED' | 'BLOCKCHAIN_FAILED';
  adminRemark: string | null;
  approvedByAdminId: number | null;
  rewardAmount: number | null;
  blockchainTxHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnergyRequestStatusResponse {
  requests: EnergyRequest[];
  total: number;
}

export interface UploadEnergyRequestResponse extends EnergyRequest {}

export const energyApi = {
  /**
   * Upload smart meter image for energy generation verification
   */
  upload: async (
    file: File,
    month: number,
    year: number,
    meterIdFromImage?: string,
  ): Promise<UploadEnergyRequestResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', month.toString());
    formData.append('year', year.toString());
    if (meterIdFromImage) {
      formData.append('meterIdFromImage', meterIdFromImage);
    }

    const response = await api.post('/energy/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get user's energy request status
   */
  getStatus: async (): Promise<EnergyRequestStatusResponse> => {
    const response = await api.get('/energy/status');
    return response.data;
  },

  /**
   * Get specific energy request by ID
   */
  getById: async (id: number): Promise<EnergyRequest> => {
    const response = await api.get(`/energy/${id}`);
    return response.data;
  },
};


