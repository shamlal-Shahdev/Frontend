import { API_CONFIG } from '@/config/api.config';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string>;
}
interface ApiResponse<T = any> {
  data: T;
  error?: string;
  status: number;
}
class ApiClient {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  private async request<T>(
    endpoint: string,
    method: HttpMethod,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      token,
      params,
      headers: customHeaders,
      ...restOptions
    } = options;
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    });
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        ...restOptions,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500,
      };
    }
  }
  public async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', options);
  }
  public async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', {
      ...options,
      body: JSON.stringify(data),
    });
  }
  public async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', {
      ...options,
      body: JSON.stringify(data),
    });
  }
  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', options);
  }
  public async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', {
      ...options,
      body: JSON.stringify(data),
    });
  }
}
export const apiClient = new ApiClient(API_CONFIG.baseUrl);
