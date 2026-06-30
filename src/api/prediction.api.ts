import { api } from './axios.config';

export type PredictionStatus = 'locked' | 'evaluated';

export interface PredictionResult {
  id: number;
  actualKwh: number;
  accuracyPercent: number | null;
  rewardTokens: number;
  bonusAwarded: boolean;
  rewardTransactionId: number | null;
  evaluatedAt: string;
}

export interface Prediction {
  id: number;
  userId: number;
  installationId: number;
  month: number;
  year: number;
  predictedKwh: number;
  status: PredictionStatus;
  submittedAt: string;
  installation?: { id: number; name: string };
  predictionResult?: PredictionResult | null;
  user?: { id: number; name: string; email: string };
}

export interface PredictionWindowStatus {
  isOpen: boolean;
  windowStartDay: number;
  windowEndDay: number;
  currentDay: number;
  targetMonth: number;
  targetYear: number;
  message: string;
}

export interface PredictionEligibility {
  kycApproved: boolean;
  installationCompleted: boolean;
  eligible: boolean;
  completedInstallations: Array<{ id: number; name: string }>;
  reasons: string[];
}

export interface PredictionRewardTier {
  minAccuracy: number;
  maxAccuracy: number | null;
  label: string;
  tokens: number;
}

export interface PredictionRewardTiers {
  tiers: PredictionRewardTier[];
  maxTokens: number;
}

export interface PredictionStatusResponse {
  window: PredictionWindowStatus;
  eligibility: PredictionEligibility;
  currentMonthPrediction: Prediction | null;
  hasSubmittedThisMonth: boolean;
  rewardTiers: PredictionRewardTiers;
}

export interface PredictionsListResponse {
  data: Prediction[];
  total: number;
  page: number;
  limit: number;
}

export interface SubmitPredictionPayload {
  installationId: number;
  predictedKwh: number;
}

export const predictionApi = {
  getStatus: async (): Promise<PredictionStatusResponse> => {
    const response = await api.get('/predictions/status');
    return response.data;
  },

  submit: async (data: SubmitPredictionPayload): Promise<Prediction> => {
    const response = await api.post('/predictions', data);
    return response.data;
  },

  getHistory: async (page = 1, limit = 10): Promise<PredictionsListResponse> => {
    const response = await api.get('/predictions/history', {
      params: { page, limit },
    });
    return response.data;
  },

  getAll: async (page = 1, limit = 25): Promise<PredictionsListResponse> => {
    const response = await api.get('/predictions', {
      params: { page, limit },
    });
    return response.data;
  },

  getAdminAll: async (page = 1, limit = 25): Promise<PredictionsListResponse> => {
    const response = await api.get('/admin/predictions', {
      params: { page, limit },
    });
    return response.data;
  },
};
