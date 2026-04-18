import { useState, useCallback } from 'react';
import {
  adminApi,
  DashboardStats,
  UserListItem,
  UserDetail,
  FilterUsersParams,
  ApproveKycRequest,
  RejectKycRequest,
  RequestDocumentsRequest,
  AuditLogsResponse,
} from '@/integration/admin.api';
import { getErrorMessage } from '@/utils/error-handler';
interface UseAdminReturn {
  stats: DashboardStats | null;
  users: UserListItem[];
  userDetail: UserDetail | null;
  auditLogs: AuditLogsResponse | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  fetchDashboardStats: () => Promise<void>;
  fetchUsers: (params?: FilterUsersParams) => Promise<void>;
  fetchUserDetails: (userId: string) => Promise<void>;
  approveKyc: (userId: string, data: ApproveKycRequest) => Promise<void>;
  rejectKyc: (userId: string, data: RejectKycRequest) => Promise<void>;
  requestDocuments: (userId: string, data: RequestDocumentsRequest) => Promise<void>;
  fetchAuditLogs: (params?: { userId?: string; page?: number; limit?: number }) => Promise<void>;
  clearError: () => void;
}
export function useAdmin(): UseAdminReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchUsers = useCallback(async (params?: FilterUsersParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUsers(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchUserDetails = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUserDetails(userId);
      setUserDetail(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const approveKyc = useCallback(async (userId: string, data: ApproveKycRequest) => {
    try {
      setLoading(true);
      setError(null);
      await adminApi.approveKyc(userId, data);
      if (userDetail?.id === userId) {
        await fetchUserDetails(userId);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userDetail, fetchUserDetails]);
  const rejectKyc = useCallback(async (userId: string, data: RejectKycRequest) => {
    try {
      setLoading(true);
      setError(null);
      await adminApi.rejectKyc(userId, data);
      if (userDetail?.id === userId) {
        await fetchUserDetails(userId);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userDetail, fetchUserDetails]);
  const requestDocuments = useCallback(async (userId: string, data: RequestDocumentsRequest) => {
    try {
      setLoading(true);
      setError(null);
      await adminApi.requestDocuments(userId, data);
      if (userDetail?.id === userId) {
        await fetchUserDetails(userId);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userDetail, fetchUserDetails]);
  const fetchAuditLogs = useCallback(async (params?: { userId?: string; page?: number; limit?: number }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getAuditLogs(params);
      setAuditLogs(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  return {
    stats,
    users,
    userDetail,
    auditLogs,
    loading,
    error,
    pagination,
    fetchDashboardStats,
    fetchUsers,
    fetchUserDetails,
    approveKyc,
    rejectKyc,
    requestDocuments,
    fetchAuditLogs,
    clearError,
  };
}
