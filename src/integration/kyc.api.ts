import { client } from './client';

// ==================== TYPES ====================

export type KycStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'additional_docs_required';
export type DocumentType = 'cnic_front' | 'cnic_back' | 'selfie' | 'additional';
export type DocumentStatus = 'pending' | 'verified' | 'rejected';
export type Gender = 'male' | 'female' | 'other';

export interface Document {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  url?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface KycStatusResponse {
  id: string;
  status: KycStatus;
  city: string;
  province: string;
  country: string;
  gender: string;
  dateOfBirth: string;
  cnicNumber: string;
  rejectionReason?: string | null;
  submissionCount: number;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface ResubmitKycRequest {
  cnicFront?: File;
  cnicBack?: File;
  selfie?: File;
  notes?: string;
}

export interface UpdateKycRequest {
  city?: string;
  province?: string;
  country?: string;
  gender?: Gender;
  dateOfBirth?: string;
  phone?: string;
}

export const kycApi = {
  // Get KYC Status
  getStatus: async (): Promise<KycStatusResponse> => {
    const response = await fetch(`${client.API_URL}/api/v1/kyc/status`, {
      method: 'GET',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch KYC status');
    }

    return response.json();
  },

  // Resubmit KYC Documents
  resubmit: async (data: ResubmitKycRequest): Promise<{ success: boolean; message: string }> => {
    const formData = new FormData();

    if (data.cnicFront) {
      formData.append('cnicFront', data.cnicFront);
    }
    if (data.cnicBack) {
      formData.append('cnicBack', data.cnicBack);
    }
    if (data.selfie) {
      formData.append('selfie', data.selfie);
    }
    if (data.notes) {
      formData.append('notes', data.notes);
    }

    const response = await fetch(`${client.API_URL}/api/v1/kyc/resubmit`, {
      method: 'POST',
      headers: {
        ...client.getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to resubmit KYC');
    }

    return response.json();
  },

  // Update KYC Information
  update: async (data: UpdateKycRequest): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${client.API_URL}/api/v1/kyc/update`, {
      method: 'PUT',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update KYC');
    }

    return response.json();
  },

  // Upload File (for general file uploads)
  uploadFile: async (file: File): Promise<{ url: string; id: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${client.API_URL}/api/v1/files/upload`, {
      method: 'POST',
      headers: {
        ...client.getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'File upload failed');
    }

    const data = await response.json();
    return { 
      url: data.url || data.publicUrl || data.path,
      id: data.id || data.file?.id 
    };
  },

  // Get Document URL (if needed)
  getDocumentUrl: async (documentId: string): Promise<{ url: string }> => {
    const response = await fetch(`${client.API_URL}/api/v1/kyc/document/${documentId}/url`, {
      method: 'GET',
      headers: {
        ...client.headers,
        ...client.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get document URL');
    }

    return response.json();
  },
};
