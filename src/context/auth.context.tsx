import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState } from '@/types/auth';
import { authService } from '@/services/auth.service';
import { User, LoginRequest, RegisterRequest, RegisterWithKycRequest } from '@/integration/api';

// Create context with initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

interface AuthContextValue {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  registerWithKyc: (data: RegisterWithKycRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  state: initialState,
  login: async () => {},
  register: async () => {},
  registerWithKyc: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  clearError: () => {},
});

/**
 * AuthProvider: Manages global authentication state
 * Features:
 * - Automatic token validation
 * - User session persistence
 * - Login/logout/register functionality
 * - Error handling
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: !!user,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const { user } = await authService.login(credentials);
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      await authService.register(data);
      setState(prev => ({
        ...prev,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      throw error;
    }
  };

  const registerWithKyc = async (data: RegisterWithKycRequest) => {
    try {
      await authService.registerWithKyc(data);
      setState(prev => ({
        ...prev,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Registration with KYC failed',
      }));
      throw error;
    }
  };

  const logout = () => {
    // Clear all data from localStorage
    authService.clearAllStorage();
    setState({
      ...initialState,
      isLoading: false,
    });
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider value={{ state, login, register, registerWithKyc, logout, refreshUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};