import { client } from './client';
import { User } from '../types/api.types';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  province?: string;
  country?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userApi = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await fetch(`${client.API_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }

    return response.json();
  },

  // Update user profile
  updateProfile: async (data: { name?: string; phone?: string }): Promise<User> => {
    const response = await fetch(`${client.API_URL}/api/v1/auth/me`, {
      method: 'PUT',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await fetch(`${client.API_URL}/api/v1/users/change-password`, {
      method: 'PATCH',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    return response.json();
  },

  // Delete account
  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await fetch(`${client.API_URL}/api/v1/me`, {
      method: 'DELETE',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete account');
    }

    return response.json();
  },
};

