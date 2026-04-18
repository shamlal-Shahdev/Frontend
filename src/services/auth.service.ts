import { authApi, LoginRequest, RegisterRequest, RegisterWithKycRequest, User } from '@/integration/api';
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
  public async login(credentials: LoginRequest) {
    const response = await authApi.login(credentials);
    this.setToken(response.token);
    return response;
  }
  public async register(data: RegisterRequest) {
    const response = await authApi.register(data);
    return response;
  }
  public async registerWithKyc(data: RegisterWithKycRequest) {
    const response = await authApi.registerWithKyc(data);
    return response;
  }
  public async verifyEmail(token: string) {
    const response = await authApi.verifyEmail(token);
    return response;
  }
  public async forgotPassword(email: string) {
    const response = await authApi.forgotPassword(email);
    return response;
  }
  public async resetPassword(token: string, newPassword: string) {
    const response = await authApi.resetPassword(token, newPassword);
    return response;
  }
  public async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const user = await authApi.getCurrentUser();
      return user;
    } catch (error) {
      this.clearToken();
      return null;
    }
  }
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  public clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }
  public clearAllStorage(): void {
    localStorage.clear();
  }
  public isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
export const authService = AuthService.getInstance();
