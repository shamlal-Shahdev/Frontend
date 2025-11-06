import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '@/types/auth';
import { authService } from '@/services/auth.service';

// Create context with initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}>({
  state: initialState,
  login: async () => {},
  logout: () => {},
  clearError: () => {},
});

/**
 * AuthProvider: Manages global authentication state
 * Features:
 * - Automatic token validation
 * - User session persistence
 * - Login/logout functionality
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

  const login = async (email: string, password: string) => {
    try {
      const { user } = await authService.login({ email, password });
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

  const logout = () => {
    authService.clearToken();
    setState({
      ...initialState,
      isLoading: false,
    });
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, clearError }}>
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