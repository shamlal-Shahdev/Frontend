/**
 * Centralized API Types for WattsUp Energy Platform
 */

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
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
  dateOfBirth: string; // YYYY-MM-DD
  cnicNumber: string; // 42101-1234567-1
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

// User Types
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

// KYC Types
export type KycStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'additional_docs_required';
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

// Admin Types
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

// File Upload Types
export interface FileUploadResponse {
  file: {
    id: string;
    path: string;
  };
}

// API Response Types
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface SuccessResponse {
  message: string;
  success?: boolean;
}

