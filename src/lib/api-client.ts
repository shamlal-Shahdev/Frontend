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

/**
 * API Client for handling HTTP requests
 * Provides a wrapper around fetch with:
 * - Automatic token handling
 * - Error handling
 * - Response parsing
 * - Query parameter support
 * - Proper typing
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Main request method that handles all API calls
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param options - Request options including body, headers, etc.
   */
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

    // Build URL with query parameters
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Prepare headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    });

    // Add authorization token if provided
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

  // HTTP method wrappers
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

// Create and export singleton instance
export const apiClient = new ApiClient(API_CONFIG.baseUrl);