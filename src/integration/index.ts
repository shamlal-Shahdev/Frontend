/**
 * Central API export point
 * Import all your API functions from here
 */

// ==================== AUTH API ====================
export { authApi } from './api';
export type { 
  LoginRequest, 
  RegisterRequest, 
  RegisterWithKycRequest, 
  LoginResponse,
  User 
} from './api';

// ==================== KYC API ====================
export { kycApi } from './kyc.api';
export type { 
  KycStatus, 
  KycStatusResponse, 
  ResubmitKycRequest, 
  UpdateKycRequest, 
  Document, 
  DocumentType, 
  DocumentStatus, 
  Gender 
} from './kyc.api';

// ==================== ADMIN API ====================
export { adminApi } from './admin.api';
export type { 
  DashboardStats,
  UserListItem, 
  UserDetail,
  PaginatedUsersResponse, 
  FilterUsersParams, 
  AuditLog,
  AuditLogsResponse,
  ApproveKycRequest, 
  RejectKycRequest, 
  RequestDocumentsRequest 
} from './admin.api';

// ==================== USER API ====================
export { userApi } from './user.api';
export type { 
  UpdateProfileRequest, 
  ChangePasswordRequest 
} from './user.api';

// ==================== CLIENT CONFIG ====================
export { client } from './client';

