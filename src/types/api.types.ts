export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}
export interface RegisterWithKycRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  province: string;
  country: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string; 
  cnicNumber: string; 
  cnicFront: File;
  cnicBack: File;
  selfie: File;
}
export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: User;
}
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  phone?: string;
  city?: string;
  province?: string;
  country?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  role: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
export type KycStatus =
  | 'not_submitted'
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'additional_docs_required';
export type DocumentType = 'cnic_front' | 'cnic_back' | 'selfie' | 'additional';
export interface Document {
  id: string;
  type: DocumentType;
  s3Key: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}
export interface KycSubmission {
  id: string;
  user: User;
  cnicNumber: string;
  status: KycStatus;
  rejectionReason?: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}
export interface KycStatusResponse {
  id: string;
  status: KycStatus;
  rejectionReason?: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}
export interface PaginatedUsersResponse {
  data: User[];
  hasNextPage: boolean;
}
export interface FilterUsersParams {
  email?: string;
  cnicNumber?: string;
  kycStatus?: KycStatus;
  page?: number;
  limit?: number;
}
export interface AuditLog {
  id: string;
  action: string;
  targetUserId: string;
  details?: string;
  timestamp: string;
  admin: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
export interface FileUploadResponse {
  file: {
    id: string;
    path: string;
  };
}
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
export interface SuccessResponse {
  message: string;
  success?: boolean;
}

export interface EnergyTrendData {
  month: string;
  energy: number;
}

export interface CarbonReductionTrendData {
  month: string;
  carbonReducedKg: number;
}

export interface RewardDistributionData {
  category: string;
  amount: number;
  percentage: number;
}

export interface DashboardActivity {
  type: string;
  description: string;
  date: Date | string;
  amount?: number;
}

export interface LatestCertificateSummary {
  id: number;
  certificateId: string;
  month: number;
  year: number;
  energyGenerated: number;
  rewardAmount: number;
  achievementLevel: string;
  issueDate: string;
}

export interface DashboardData {
  totalEnergyGenerated: number;
  totalTokensEarned: number;
  tokensRedeemed: number;
  tokensAvailable: number;
  activePredictions: number;
  certificatesEarned: number;
  monthlyCarbonReducedKg: number;
  totalCarbonReducedKg: number;
  energyGenerationTrend: EnergyTrendData[];
  carbonReductionTrend: CarbonReductionTrendData[];
  rewardsDistribution: RewardDistributionData[];
  recentActivity: DashboardActivity[];
  latestCertificate?: LatestCertificateSummary | null;
}
