import { api } from './axios.config';

interface KycStatusResponse {
  status: 'pending' | 'approved' | 'rejected' | 'none' | 'in_review' | 'additional_docs_required' | 'not_submitted';
  rejectionReason?: string | null;
  documents?: Array<{
    docType: string;
    status: string;
    submittedAt: Date;
    adminNotes?: string;
  }>;
}

export const kycApi = {
  submit: async (data: { 
    userId: number;
    CnicFrontUrl: string;
    CnicBackUrl: string;
    SelfieUrl: string;
    UtilityBillUrl: string;
    city: string;
    province: string;
    country: string;
  }) => {
    const response = await api.post('/kyc/submit', {
      userId: data.userId,
      CnicFrontUrl: data.CnicFrontUrl,
      CnicBackUrl: data.CnicBackUrl,
      SelfieUrl: data.SelfieUrl,
      UtilityBillUrl: data.UtilityBillUrl,
      city: data.city,
      province: data.province,
      country: data.country,
    });
    return response.data;
  },

  uploadFile: async (file: File): Promise<{ url: string; }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = response.data;
    console.log('Upload file response', data);
    return {url: data.file.path,};
  },

  getStatus: async (): Promise<KycStatusResponse> => {
    const response = await api.get('/kyc/status');
    return response.data;
  },
};





