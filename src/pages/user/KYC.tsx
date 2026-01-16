import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { kycApi } from '@/api/kyc.api';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  X, 
  Image as ImageIcon, 
  User,
  CreditCard,
  Receipt,
  MapPin,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface LocationData {
  city: string;
  province: string;
  country: string;
}

export const KYC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [files, setFiles] = useState<{
    cnicFront?: File;
    cnicBack?: File;
    selfie?: File;
    utilityBill?: File;
  }>({});
  const [previews, setPreviews] = useState<{
    cnicFront?: string;
    cnicBack?: string;
    selfie?: string;
    utilityBill?: string;
  }>({});
  
  const fileInputRefs = {
    cnicFront: useRef<HTMLInputElement>(null),
    cnicBack: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
    utilityBill: useRef<HTMLInputElement>(null),
  };

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
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setFiles({ ...files, [field]: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (field: string) => {
    const newFiles = { ...files };
    delete newFiles[field as keyof typeof newFiles];
    setFiles(newFiles);
    
    const newPreviews = { ...previews };
    delete newPreviews[field as keyof typeof newPreviews];
    setPreviews(newPreviews);
    
    // Reset file input
    if (fileInputRefs[field as keyof typeof fileInputRefs]?.current) {
      fileInputRefs[field as keyof typeof fileInputRefs].current!.value = '';
    }
  };

  const handleChangeFile = (field: 'cnicFront' | 'cnicBack' | 'selfie' | 'utilityBill') => {
    // Clear the input value first to ensure file picker opens
    if (fileInputRefs[field]?.current) {
      fileInputRefs[field].current!.value = '';
      // Trigger click after a small delay to ensure the value is cleared
      setTimeout(() => {
        fileInputRefs[field].current?.click();
      }, 0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

      toast({
        title: 'Success!',
        description: 'Your KYC documents have been submitted successfully.',
      });
      navigate('/kyc-status');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit KYC';
      setError(errorMessage);
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive',
      });
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

  const renderFileUpload = (
    field: 'cnicFront' | 'cnicBack' | 'selfie' | 'utilityBill',
    label: string,
    icon: React.ReactNode,
    description: string
  ) => {
    const file = files[field];
    const preview = previews[field];
    const hasFile = !!file;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">{description}</p>
        
        {/* Hidden file input - always present in DOM */}
        <input
          ref={fileInputRefs[field]}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, field)}
          className="hidden"
          required
        />
        
        {!hasFile ? (
          <div
            onClick={() => fileInputRefs[field].current?.click()}
            className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer group"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                {icon}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG up to 5MB
              </p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start gap-4">
              {preview && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                  <img
                    src={preview}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Uploaded</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(field)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeFile(field)}
                  className="mt-3 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Change File
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Upload KYC Documents
                </CardTitle>
                <CardDescription className="mt-2 text-gray-600">
                  Please upload your verification documents. All fields are required.
                </CardDescription>
              </div>
            </div>
            {locationData && (
              <div className="mt-4 flex items-center gap-2 text-sm bg-white/60 rounded-lg px-4 py-2 border border-blue-100">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700 font-medium">
                  {locationData.city}, {locationData.province}, {locationData.country}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg flex items-start gap-3">
                  <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CNIC Front */}
                {renderFileUpload(
                  'cnicFront',
                  'CNIC Front',
                  <CreditCard className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />,
                  'Upload the front side of your CNIC'
                )}

                {/* CNIC Back */}
                {renderFileUpload(
                  'cnicBack',
                  'CNIC Back',
                  <CreditCard className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />,
                  'Upload the back side of your CNIC'
                )}

                {/* Selfie */}
                {renderFileUpload(
                  'selfie',
                  'Selfie',
                  <User className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />,
                  'Upload a clear selfie'
                )}

                {/* Utility Bill */}
                {renderFileUpload(
                  'utilityBill',
                  'Utility Bill',
                  <Receipt className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />,
                  'Upload a recent utility bill as proof of address'
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submit KYC
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

