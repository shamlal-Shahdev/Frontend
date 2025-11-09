import { authApi, LoginRequest, RegisterRequest, RegisterWithKycRequest, User } from '@/integration/api';

/**
 * AuthService: Handles all authentication-related API calls
 * This service provides:
 * - Type safety
 * - Error handling
 * - Token management
 * - Consistent API patterns
 */
export class AuthService {
  private static instance: AuthService;
  private tokenKey = 'token';

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
  public async login(credentials: LoginRequest) {
    const response = await authApi.login(credentials);
    this.setToken(response.token);
    return response;
  }

  /**
   * Register new user (simple registration)
   */
  public async register(data: RegisterRequest) {
    const response = await authApi.register(data);
    return response;
  }

  /**
   * Register with KYC
   */
  public async registerWithKyc(data: RegisterWithKycRequest) {
    const response = await authApi.registerWithKyc(data);
    return response;
  }

  /**
   * Verify email with token
   */
  public async verifyEmail(token: string) {
    const response = await authApi.verifyEmail(token);
    return response;
  }

  /**
   * Request password reset
   */
  public async forgotPassword(email: string) {
    const response = await authApi.forgotPassword(email);
    return response;
  }

  /**
   * Reset password with token
   */
  public async resetPassword(token: string, newPassword: string) {
    const response = await authApi.resetPassword(token, newPassword);
    return response;
  }

  /**
   * Get current authenticated user
   */
  public async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const user = await authApi.getCurrentUser();
      return user;
    } catch (error) {
      // If token is invalid, clear it
      this.clearToken();
      return null;
    }
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

  /**
   * Clear all data from localStorage
   * Use this when logging out to ensure no user data remains
   */
  public clearAllStorage(): void {
    // Clear all localStorage items
    // This ensures complete cleanup of user session data
    localStorage.clear();
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();