import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { energyApi } from '@/api/energy.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const EnergyUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [meterId, setMeterId] = useState('');
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  useEffect(() => {
    checkExistingRequest();
  }, []);

  const checkExistingRequest = async () => {
    setCheckingStatus(true);
    try {
      const response = await energyApi.getStatus();
      // Find request for current month/year
      const existing = response.requests.find(
        (req) => req.month === currentMonth && req.year === currentYear,
      );
      setExistingRequest(existing || null);
    } catch (err: any) {
      console.error('Failed to check existing request', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type (jpg/png)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPG or PNG image file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getMonthName = (month: number) => {
    const date = new Date(2000, month - 1, 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a meter image file');
      return;
    }

    setLoading(true);

    try {
      await energyApi.upload(file, currentMonth, currentYear, meterId || undefined);

      toast({
        title: 'Success!',
        description: 'Request submitted successfully. Waiting for admin approval.',
        className: 'bg-green-50 border-green-200',
      });

      // Navigate to status page
      navigate('/energy/status');
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to upload request';

      // Handle specific error cases
      if (errorMessage.includes('already have a pending request')) {
        setError('You have already submitted your request. Please wait for admin response.');
        toast({
          title: 'Request Already Submitted',
          description: 'You have already submitted your request for this month. Please wait for admin response.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('already been generated')) {
        setError('You have already availed rewards for this month.');
        toast({
          title: 'Reward Already Generated',
          description: 'You have already availed rewards for this month.',
          variant: 'destructive',
        });
      } else {
        setError(errorMessage);
        toast({
          title: 'Upload Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Checking existing requests...</p>
        </div>
      </div>
    );
  }

  // Check if user already has a request for this month
  const hasPendingRequest =
    existingRequest?.status === 'PENDING' || existingRequest?.status === 'APPROVED';
  const hasRewardGenerated = existingRequest?.status === 'REWARD_GENERATED';
  const hasRejectedRequest = existingRequest?.status === 'REJECTED';
  const hasRequest = hasPendingRequest || hasRewardGenerated || hasRejectedRequest;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>;
      case 'APPROVED':
        return <Badge className="bg-blue-100 text-blue-800">APPROVED</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">REJECTED</Badge>;
      case 'REWARD_GENERATED':
        return <Badge className="bg-green-100 text-green-800">REWARD_GENERATED</Badge>;
      case 'BLOCKCHAIN_FAILED':
        return <Badge className="bg-orange-100 text-orange-800">BLOCKCHAIN_FAILED</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // If request already exists and is not rejected, show status message only
  if (hasRequest && !hasRejectedRequest) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Energy Generation Verification</CardTitle>
              <CardDescription>
                Request for <strong>{getMonthName(currentMonth)} {currentYear}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                        Request Already Submitted
                      </h3>
                      <p className="text-yellow-800 mb-4">
                        You have already submitted your request for this month. Please wait for admin response.
                      </p>
                      
                      {existingRequest && (
                        <div className="mt-4 pt-4 border-t border-yellow-300">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-yellow-900">Status:</span>
                              {getStatusBadge(existingRequest.status)}
                            </div>
                            {existingRequest.createdAt && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-yellow-900">Submitted:</span>
                                <span className="text-sm text-yellow-800">
                                  {new Date(existingRequest.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/energy/status')}
                    className="flex-1"
                  >
                    View All Requests
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Upload Smart Meter Image</CardTitle>
            <CardDescription>
              Submit your energy generation verification for{' '}
              <strong>{getMonthName(currentMonth)} {currentYear}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="meterImage">Smart Meter Image *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {preview ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-64 rounded-lg mx-auto"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveFile}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      {file && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <Label
                          htmlFor="meterImage"
                          className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Click to upload or drag and drop
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          JPG or PNG (max 5MB)
                        </p>
                      </div>
                      <Input
                        id="meterImage"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !file || hasPendingRequest || hasRewardGenerated}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Request
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

