/**
 * Error handling utilities
 */

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    
    // Check for validation errors
    if (apiError.errors) {
      const firstKey = Object.keys(apiError.errors)[0];
      const firstError = apiError.errors[firstKey]?.[0];
      return firstError || apiError.message || 'An error occurred';
    }

    // Check for message
    if (apiError.message) {
      return apiError.message;
    }
  }

  return 'An unexpected error occurred';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message === 'Network Error' || 
           error.message === 'Failed to fetch';
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    return apiError.statusCode === 401 || apiError.statusCode === 403;
  }
  return false;
}

/**
 * Format validation errors for form fields
 */
export function formatValidationErrors(errors?: Record<string, string[]>): Record<string, string> {
  if (!errors) return {};
  
  const formatted: Record<string, string> = {};
  Object.keys(errors).forEach(key => {
    formatted[key] = errors[key][0] || '';
  });
  
  return formatted;
}

