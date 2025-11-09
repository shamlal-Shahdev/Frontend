// Re-export from API types for consistency
export type { User, LoginRequest as LoginCredentials, RegisterRequest as RegisterData } from '@/integration/api';

export interface AuthState {
  user: import('@/integration/api').User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}