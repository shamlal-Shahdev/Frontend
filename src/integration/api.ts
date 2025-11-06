import { client } from './client';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${client.API_URL}/api/auth/login`, {
      method: 'POST',
      headers: client.headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await fetch(`${client.API_URL}/api/auth/register`, {
      method: 'POST',
      headers: client.headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await fetch(`${client.API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: client.headers,
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Email verification failed');
    }

    return response.json();
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${client.API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: client.headers,
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send reset password email');
    }

    return response.json();
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${client.API_URL}/api/auth/reset-password`, {
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
};