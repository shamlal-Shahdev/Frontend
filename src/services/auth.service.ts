import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { User, LoginCredentials, RegisterData } from '@/types/auth';

/**
 * AuthService: Handles all authentication-related API calls
 * This service demonstrates best practices for:
 * - Type safety
 * - Error handling
 * - Token management
 * - Consistent API patterns
 */
export class AuthService {
  private static instance: AuthService;
  private tokenKey = 'auth_token';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Authenticate user and store token
   */
  public async login(credentials: LoginCredentials) {
    const response = await apiClient.post<{ token: string; user: User }>(
      API_CONFIG.endpoints.auth.login,
      credentials
    );

    if (response.data) {
      this.setToken(response.data.token);
      return response.data;
    }

    throw new Error(response.error);
  }

  /**
   * Register new user
   */
  public async register(data: RegisterData) {
    const response = await apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.auth.register,
      data
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data;
  }

  /**
   * Get current authenticated user
   */
  public async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    const response = await apiClient.get<User>('/auth/me', {
      token,
    });

    return response.data;
  }

  /**
   * Token management methods
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();