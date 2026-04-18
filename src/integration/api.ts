import { client } from './client';
export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
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
  dateOfBirth: string; 
  cnicNumber: string; 
  cnicFront: File;
  cnicBack: File;
  selfie: File;
}
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
            if (response.status === 401) {
              errorMessage = error.message || 'Please verify your email before logging in';
            } else if (response.status === 422) {
              console.log('🔍 Processing 422 error:', error);
              if (error.message) {
                const msg = error.message;
                if (msg.includes('not registered') || 
                    msg.includes('register first') ||
                    msg.includes('not found')) {
                  errorMessage = msg;
                  console.log('✅ User not found message detected:', errorMessage);
                } else if (msg.includes('Invalid credentials') || 
                          msg.includes('invalid password') ||
                          msg.includes('Invalid password') ||
                          msg.includes('credentials') ||
                          msg.toLowerCase().includes('incorrect password')) {
                  errorMessage = 'Invalid password or credentials. Please check your email and password.';
                  console.log('✅ Invalid credentials message detected');
                } else {
                  errorMessage = msg;
                }
              }
              if (error.errors) {
                console.log('🔍 Error errors object:', error.errors);
                if (error.errors.email) {
                  const emailError = Array.isArray(error.errors.email) 
                    ? error.errors.email[0] 
                    : error.errors.email;
                  if (emailError.includes('not registered') || 
                      emailError.includes('register first') ||
                      emailError.includes('not found')) {
                    errorMessage = emailError;
                    console.log('✅ User not found in errors.email:', errorMessage);
                  }
                }
                if (error.errors.password) {
                  const passwordError = Array.isArray(error.errors.password) 
                    ? error.errors.password[0] 
                    : error.errors.password;
                  if (passwordError.includes('Invalid') || 
                      passwordError.includes('invalid') ||
                      passwordError.includes('credentials')) {
                    errorMessage = 'Invalid password or credentials. Please check your email and password.';
                    console.log('✅ Invalid password in errors.password');
                  }
                }
                if (error.errors.user && !errorMessage.includes('not registered')) {
                  errorMessage = 'This email is not registered. Please register first to create an account.';
                }
                if (!errorMessage || errorMessage === 'Login failed') {
                  const fieldErrors = Object.values(error.errors).flat();
                  errorMessage = Array.isArray(fieldErrors) && fieldErrors.length > 0
                    ? fieldErrors[0]
                    : error.message || 'Invalid password or credentials. Please check your email and password.';
                }
              }
              if (!errorMessage || errorMessage === 'Login failed') {
                errorMessage = error.message || 'Invalid password or credentials. Please check your email and password.';
              }
            } else {
              errorMessage = error.message || error.error || errorMessage;
            }
          }
        } catch (e) {
          if (responseText && (responseText.includes('Request failed') || responseText.includes('status code'))) {
            if (response.status === 422 || response.status === 401) {
              errorMessage = 'Invalid password or credentials. Please check your email and password.';
            } else {
              errorMessage = 'Login failed. Please try again.';
            }
          } else if (response.status === 422 || response.status === 401) {
            errorMessage = 'Invalid password or credentials. Please check your email and password.';
          } else {
            errorMessage = responseText || response.statusText || errorMessage;
          }
        }
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
          ...client.getAuthHeader(),
        },
        body: formData,
      });
      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response URL:', response.url);
      const responseText = await response.text();
      console.log('📄 Response text:', responseText);
      if (!response.ok) {
        let errorMessage = `Registration failed (${response.status})`;
        try {
          if (responseText) {
            const error = JSON.parse(responseText);
            console.log('❌ Error details:', error);
            if (response.status === 422 && error.message) {
              if (typeof error.message === 'string') {
                errorMessage = error.message;
              } else if (Array.isArray(error.message)) {
                errorMessage = error.message.join(', ');
              } else if (error.errors) {
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
      if (!responseText) {
        throw new Error('Empty response from server');
      }
      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.warn('Response is not JSON, but request was successful:', responseText);
        return { message: 'Registration successful. Please check your email for verification.' };
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to connect to server');
    }
  },
  verifyEmail: async (token: string): Promise<{ message: string; redirectUrl: string; role: string }> => {
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
  resendVerificationEmail: async (data: { email: string }): Promise<{ message: string }> => {
    const response = await fetch(`${client.API_URL}/api/v1/auth/resend-verification`, {
      method: 'POST',
      headers: client.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.message || 'Failed to resend verification email';
      throw new Error(errorMessage);
    }
    return response.json();
  },
};
