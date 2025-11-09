import { client } from './client';

// ==================== REQUEST TYPES ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterWithKycRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  province: string;
  country: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string; // YYYY-MM-DD format
  cnicNumber: string; // Format: 42101-1234567-1
  cnicFront: File;
  cnicBack: File;
  selfie: File;
}

// ==================== RESPONSE TYPES ====================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  province?: string;
  country?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  role: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('🔐 Frontend: Starting login request for email:', data.email);
      console.log('🔐 Frontend: API URL:', `${client.API_URL}/api/v1/auth/login`);
      
      const response = await fetch(`${client.API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: client.headers,
        body: JSON.stringify(data),
      });

      console.log('🔐 Frontend: Response status:', response.status, response.statusText);
      console.log('🔐 Frontend: Response OK:', response.ok);
      console.log('🔐 Frontend: Response URL:', response.url);

      const responseText = await response.text();
      console.log('🔐 Frontend: Response text (first 200 chars):', responseText.substring(0, 200));
      
      if (!response.ok) {
        console.log('❌ Frontend: Login failed with status:', response.status);
        let errorMessage = 'Login failed';
        try {
          if (responseText) {
            const error = JSON.parse(responseText);
            console.log('🔐 Login error:', error);
            
            // Handle different error types
            if (response.status === 401) {
              // Unverified user or unauthorized
              errorMessage = error.message || 'Please verify your email before logging in';
            } else if (response.status === 422) {
              // Validation errors (422 Unprocessable Entity)
              console.log('🔍 Processing 422 error:', error);
              
              // First check for message field (most common)
              if (error.message) {
                // Check if it's a "user not found" message
                if (error.message.includes('not registered') || 
                    error.message.includes('register first') ||
                    error.message.includes('not registered')) {
                  errorMessage = error.message;
                  console.log('✅ User not found message detected:', errorMessage);
                } else {
                  errorMessage = error.message;
                }
              }
              
              // Then check errors object
              if (error.errors) {
                console.log('🔍 Error errors object:', error.errors);
                
                // Check for email error (user not found)
                if (error.errors.email) {
                  const emailError = Array.isArray(error.errors.email) 
                    ? error.errors.email[0] 
                    : error.errors.email;
                  if (emailError.includes('not registered') || 
                      emailError.includes('register first')) {
                    errorMessage = emailError;
                    console.log('✅ User not found in errors.email:', errorMessage);
                  }
                }
                
                // Check for user error (fallback)
                if (error.errors.user && !errorMessage.includes('not registered')) {
                  errorMessage = 'This email is not registered. Please register first to create an account.';
                }
                
                // If no specific message found, use first error
                if (!errorMessage || errorMessage === 'Login failed') {
                  const fieldErrors = Object.values(error.errors).flat();
                  errorMessage = Array.isArray(fieldErrors) && fieldErrors.length > 0
                    ? fieldErrors[0]
                    : error.message || 'Invalid credentials';
                }
              }
              
              // Final fallback
              if (!errorMessage || errorMessage === 'Login failed') {
                errorMessage = error.message || 'Invalid credentials';
              }
            } else {
              errorMessage = error.message || error.error || errorMessage;
            }
          }
        } catch (e) {
          errorMessage = responseText || response.statusText || errorMessage;
        }
        
        // Create custom error with status code
        const customError = new Error(errorMessage) as any;
        customError.status = response.status;
        customError.isUnverified = response.status === 401;
        throw customError;
      }

      if (!responseText) {
        console.error('❌ Frontend: Empty response from server');
        throw new Error('Empty response from server');
      }

      console.log('✅ Frontend: Login successful, parsing response...');
      const loginResponse = JSON.parse(responseText);
      console.log('✅ Frontend: Login response received:', {
        hasToken: !!loginResponse.token,
        hasUser: !!loginResponse.user,
        userEmail: loginResponse.user?.email,
        userId: loginResponse.user?.id,
        fullResponse: loginResponse,
      });
      
      // CRITICAL CHECK: If user email doesn't match, something is wrong
      // Only check if both user and email exist
      if (loginResponse.user && loginResponse.user.email && data.email) {
        const responseEmail = loginResponse.user.email.toLowerCase().trim();
        const requestEmail = data.email.toLowerCase().trim();
        
        if (responseEmail !== requestEmail) {
          console.error('🚨 CRITICAL: User email mismatch!', {
            requested: requestEmail,
            received: responseEmail,
          });
          throw new Error('Authentication error: Email mismatch detected');
        }
      }
      
      return loginResponse;
    } catch (error) {
      console.error('❌ Frontend: Login error caught:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to connect to server');
    }
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${client.API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: client.headers,
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `Registration failed (${response.status})`;
        try {
          if (responseText) {
            const error = JSON.parse(responseText);
            errorMessage = error.message || error.error || errorMessage;
          }
        } catch (e) {
          errorMessage = responseText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      return JSON.parse(responseText);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to connect to server');
    }
  },

  registerWithKyc: async (data: RegisterWithKycRequest): Promise<{ message: string }> => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('phone', data.phone);
    formData.append('city', data.city);
    formData.append('province', data.province);
    formData.append('country', data.country);
    formData.append('gender', data.gender);
    formData.append('dateOfBirth', data.dateOfBirth);
    formData.append('cnicNumber', data.cnicNumber);
    
    // Add file fields
    formData.append('cnicFront', data.cnicFront);
    formData.append('cnicBack', data.cnicBack);
    formData.append('selfie', data.selfie);

    const apiUrl = `${client.API_URL}/api/v1/auth/register-with-kyc`;
    console.log('🚀 Registering with KYC...');
    console.log('📍 API URL:', apiUrl);
    console.log('📦 FormData fields:', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      hasFiles: {
        cnicFront: !!data.cnicFront,
        cnicBack: !!data.cnicBack,
        selfie: !!data.selfie,
      },
    });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          // Don't set Content-Type for FormData - browser will set it with boundary
          ...client.getAuthHeader(),
        },
        body: formData,
      });

      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response URL:', response.url);

      // Get response text first to check if it's empty
      const responseText = await response.text();
      console.log('📄 Response text:', responseText);
      
      if (!response.ok) {
        // Try to parse error JSON, if fails use status text
        let errorMessage = `Registration failed (${response.status})`;
        try {
          if (responseText) {
            const error = JSON.parse(responseText);
            console.log('❌ Error details:', error);
            
            // Handle validation errors (422)
            if (response.status === 422 && error.message) {
              // NestJS validation errors format
              if (typeof error.message === 'string') {
                errorMessage = error.message;
              } else if (Array.isArray(error.message)) {
                // Array of validation errors
                errorMessage = error.message.join(', ');
              } else if (error.errors) {
                // Object with field errors
                const fieldErrors = Object.entries(error.errors)
                  .map(([field, messages]) => {
                    const msgArray = Array.isArray(messages) ? messages : [messages];
                    return `${field}: ${msgArray.join(', ')}`;
                  })
                  .join('; ');
                errorMessage = `Validation failed: ${fieldErrors}`;
              } else {
                errorMessage = error.message || error.error || errorMessage;
              }
            } else {
              errorMessage = error.message || error.error || errorMessage;
            }
          } else {
            errorMessage = response.statusText || errorMessage;
          }
        } catch (e) {
          console.error('Error parsing response:', e);
          errorMessage = responseText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse success response
      if (!responseText) {
        throw new Error('Empty response from server');
      }

      try {
        return JSON.parse(responseText);
      } catch (e) {
        // If JSON parsing fails, return a default success message
        console.warn('Response is not JSON, but request was successful:', responseText);
        return { message: 'Registration successful. Please check your email for verification.' };
      }
    } catch (error) {
      // Handle network errors or other fetch errors
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to connect to server');
    }
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await fetch(`${client.API_URL}/api/v1/auth/verify?token=${token}`, {
      method: 'GET',
      headers: client.headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Email verification failed');
    }

    return response.json();
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${client.API_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: client.headers,
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.message || error.errors?.user || error.errors?.email || 'This email is not registered. Please check your email address.';
      throw new Error(errorMessage);
    }

    return response.json();
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${client.API_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: client.headers,
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }

    return response.json();
  },

  // Get current user (me)
  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${client.API_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user');
    }

    return response.json();
  },
};