/**
 * Custom hook for KYC management
 */

import { useState, useCallback } from 'react';
import { kycApi, KycStatusResponse, ResubmitKycRequest, UpdateKycRequest } from '@/integration/kyc.api';
import { getErrorMessage } from '@/utils/error-handler';

interface UseKYCReturn {
  kycStatus: KycStatusResponse | null;
  loading: boolean;
  error: string | null;
  fetchKycStatus: () => Promise<void>;
  resubmitKyc: (data: ResubmitKycRequest) => Promise<void>;
  updateKyc: (data: UpdateKycRequest) => Promise<void>;
  clearError: () => void;
}

export function useKYC(): UseKYCReturn {
  const [kycStatus, setKycStatus] = useState<KycStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current KYC status
   */
  const fetchKycStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await kycApi.getStatus();
      setKycStatus(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Resubmit KYC documents
   */
  const resubmitKyc = useCallback(async (data: ResubmitKycRequest) => {
    try {
      setLoading(true);
      setError(null);
      await kycApi.resubmit(data);
      // Refresh KYC status after resubmission
      await fetchKycStatus();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchKycStatus]);

  /**
   * Update KYC information
   */
  const updateKyc = useCallback(async (data: UpdateKycRequest) => {
    try {
      setLoading(true);
      setError(null);
      await kycApi.update(data);
      // Refresh KYC status after update
      await fetchKycStatus();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchKycStatus]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    kycStatus,
    loading,
    error,
    fetchKycStatus,
    resubmitKyc,
    updateKyc,
    clearError,
  };
}

