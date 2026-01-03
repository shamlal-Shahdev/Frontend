import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { kycApi } from '@/api/kyc.api';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface LocationData {
  city: string;
  province: string;
  country: string;
}

export const KYC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [files, setFiles] = useState<{
    cnicFront?: File;
    cnicBack?: File;
    selfie?: File;
    utilityBill?: File;
  }>({});

  useEffect(() => {
    // Get location data from navigation state
    const state = location.state as { location?: LocationData } | null;
    if (state?.location) {
      setLocationData(state.location);
    } else {
      // If no location data, redirect back to info page
      navigate('/kyc/info');
    }
  }, [location, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!files.cnicFront || !files.cnicBack || !files.selfie || !files.utilityBill) {
      setError('Please upload all required documents');
      return;
    }

    if (!locationData) {
      setError('Location information is missing. Please go back and fill the form again.');
      return;
    }

    // Get user ID from localStorage or fetch from API
    let userId: number | null = null;
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUserId) {
      userId = parseInt(storedUserId, 10);
    } else {
      // Fallback: fetch user ID from API
      try {
        const currentUser = await authApi.getCurrentUser();
        userId = currentUser.id;
        localStorage.setItem('userId', userId.toString());
      } catch (err) {
        setError('Failed to get user information. Please login again.');
        setLoading(false);
        return;
      }
    }

    if (!userId) {
      setError('User ID not found. Please login again.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Upload all files first to get URLs
      const [cnicFrontUpload, cnicBackUpload, selfieUpload, utilityBillUpload] = await Promise.all([
        kycApi.uploadFile(files.cnicFront!),
        kycApi.uploadFile(files.cnicBack!),
        kycApi.uploadFile(files.selfie!),
        kycApi.uploadFile(files.utilityBill!),
      ]);
      console.log('Upload file responses', cnicFrontUpload, cnicBackUpload, selfieUpload, utilityBillUpload);

      // Get URLs from upload responses
      const cnicFrontUrl = cnicFrontUpload.url;
      const cnicBackUrl = cnicBackUpload.url;
      const selfieUrl = selfieUpload.url;
      const utilityBillUrl = utilityBillUpload.url;

      console.log('URLs', cnicFrontUrl, cnicBackUrl, selfieUrl, utilityBillUrl);

      // Validate all URLs are present
      if (!cnicFrontUrl || !cnicBackUrl || !selfieUrl || !utilityBillUrl) {
        throw new Error('Failed to upload one or more files. Please try again.');
      }

      // Submit all documents in a single request according to API documentation
      await kycApi.submit({
        userId: userId,
        CnicFrontUrl: cnicFrontUrl,
        CnicBackUrl: cnicBackUrl,
        SelfieUrl: selfieUrl,
        UtilityBillUrl: utilityBillUrl,
        city: locationData.city,
        province: locationData.province,
        country: locationData.country,
      });

      navigate('/kyc-status');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/kyc/info', {
      state: {
        location: locationData,
      },
    });
  };

  if (!locationData) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Upload KYC Documents</CardTitle>
          <CardDescription>Please upload your verification documents</CardDescription>
          {locationData && (
            <div className="mt-2 text-sm text-gray-600">
              <p>Location: {locationData.city}, {locationData.province}, {locationData.country}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Document Upload Fields */}
            <div>
              <label className="block text-sm font-medium mb-2">
                CNIC Front <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                required
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'cnicFront')}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                CNIC Back <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                required
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'cnicBack')}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Selfie <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                required
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'selfie')}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Utility Bill <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                required
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'utilityBill')}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit KYC'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

