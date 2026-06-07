export type AchievementLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export type CertificateStatus = 'active' | 'revoked';

export type SustainabilityBadge =
  | 'green_starter'
  | 'solar_champion'
  | 'clean_energy_advocate'
  | 'carbon_reducer'
  | 'sustainability_leader';

export type CertificateSortOrder = 'newest' | 'oldest';

export interface Certificate {
  id: number;
  certificateId: string;
  userId: number;
  installationId: number;
  vendorId: number | null;
  walletAddress: string;
  month: number;
  year: number;
  energyGenerated: number;
  co2Offset: number;
  rewardAmount: number;
  treesEquivalent: number;
  achievementLevel: AchievementLevel;
  badge: SustainabilityBadge;
  transactionHash: string;
  status: CertificateStatus;
  meterId: string | null;
  verifiedAt: string | null;
  issueDate: string;
  vendorName: string | null;
  installationCapacityKw: number | null;
}

export interface CertificateListResponse {
  certificates: Certificate[];
  total: number;
}

export interface CertificateStats {
  totalCertificates: number;
  totalEnergyGenerated: number;
  totalRewardsEarned: number;
  totalCo2OffsetKg: number;
  totalCo2OffsetTons: number;
  previousMonthEnergy: number;
  currentMonthEnergy: number;
  monthOverMonthPercentChange: number;
  currentBadge: SustainabilityBadge | null;
}

export interface CertificateVerifyResult {
  certificateId: string;
  status: CertificateStatus;
  userName: string;
  month: number;
  year: number;
  energyGenerated: number;
  co2Offset: number;
  achievementLevel: AchievementLevel;
  issueDate: string;
  transactionHash: string;
  digitallyVerified: boolean;
}

export interface LatestCertificateSummary {
  id: number;
  certificateId: string;
  month: number;
  year: number;
  energyGenerated: number;
  rewardAmount: number;
  achievementLevel: AchievementLevel;
  issueDate: string;
}

export type CertificateMonthStatus = 'downloadable' | 'pending_certificate';

export interface CertificateMonthOverview {
  month: number;
  year: number;
  energyGeneratedKwh: number;
  rewardAmount: number;
  status: CertificateMonthStatus;
  downloadable: boolean;
  certificate: Certificate | null;
}

export interface CertificateAdminStats {
  totalCertificatesGenerated: number;
  certificatesThisMonth: number;
  totalEnergyCertified: number;
  totalCo2Offset: number;
  totalRewardsDistributed: number;
}

export interface CertificateUserSummary {
  userId: number;
  user: { id: number; name: string; email: string };
  certificateCount: number;
  totalEnergy: number;
  totalRewards: number;
  lastIssuedAt: string;
}

export interface CertificateUsersResponse {
  items: CertificateUserSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface CertificateListQuery {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  sort?: CertificateSortOrder;
  userId?: number;
  vendorId?: number;
  status?: CertificateStatus;
}

export const ACHIEVEMENT_LABELS: Record<AchievementLevel, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

export const BADGE_LABELS: Record<SustainabilityBadge, string> = {
  green_starter: 'Green Starter',
  solar_champion: 'Solar Champion',
  clean_energy_advocate: 'Clean Energy Advocate',
  carbon_reducer: 'Carbon Reducer',
  sustainability_leader: 'Sustainability Leader',
};

export function formatCertificateMonth(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response
      ?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
