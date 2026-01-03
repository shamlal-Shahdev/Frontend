import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, FileCheck } from 'lucide-react';

interface KycEntity {
  id: number;
  userId: number;
  CnicFrontUrl: string;
  CnicBackUrl: string;
  SelfieUrl: string;
  UtilityBillUrl: string;
  city: string;
  province: string;
  country: string;
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
    kycStatus: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface UserDocumentsResponse {
  documents: KycEntity[];
  userId: number;
  total: number;
}

export const KYCDetail = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [kycData, setKycData] = useState<KycEntity | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError('');
    try {
      // Get user documents
      const documentsResponse = await adminApi.getUserDocuments(parseInt(userId));
      console.log('Documents Response:', documentsResponse);
      
      // Get the most recent KYC document (first one in the array)
      if (documentsResponse.documents && documentsResponse.documents.length > 0) {
        const kyc = documentsResponse.documents[0];
        setKycData(kyc);
        
        // Set user details from the KYC document
        if (kyc.user) {
          setUserDetails({
            id: kyc.user.id,
            name: kyc.user.name,
            email: kyc.user.email,
            phone: kyc.user.phone || '',
            isVerified: kyc.user.isVerified,
            kycStatus: kyc.user.kycStatus,
            createdAt: kyc.user.createdAt,
            updatedAt: kyc.user.updatedAt,
          });
        }
      } else {
        // Fallback: get user details from users list
        const usersResponse = await adminApi.getUsersWithKyc();
        const user = usersResponse.users.find(u => u.id === parseInt(userId));
        if (user) {
          setUserDetails({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            isVerified: user.isVerified,
            kycStatus: user.kycStatus,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to load user KYC details', err);
      setError(err.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = () => {
    setApprovalNote('');
    setApproveModalOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!userId) return;

    setSubmitting(true);
    try {
      await adminApi.approveKyc(parseInt(userId), approvalNote ? { note: approvalNote } : undefined);
      alert('KYC approved successfully');
      setApproveModalOpen(false);
      setApprovalNote('');
      navigate('/admin/kyc');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve KYC';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectClick = () => {
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!userId || !rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.rejectKyc(parseInt(userId), { reason: rejectionReason });
      alert('KYC rejected successfully. User will be notified to resubmit documents.');
      setRejectModalOpen(false);
      setRejectionReason('');
      navigate('/admin/kyc');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reject KYC';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDocType = (docType: string | undefined) => {
    if (!docType) return 'Document';
    return docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getImageUrl = (filePath: string | undefined | null) => {
    if (!filePath) return '';
    
    // Fix backslashes to forward slashes (Windows path issue)
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // If already a full URL, return as is (with normalized slashes)
    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
      return normalizedPath;
    }
    
    // Get base URL from environment or default
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    // If filePath starts with /, it's already a path, just prepend base URL
    if (normalizedPath.startsWith('/')) {
      return `${baseUrl}${normalizedPath}`;
    }
    
    // Otherwise, assume it's a relative path
    return `${baseUrl}/${normalizedPath}`;
  };

  // Create document array from KYC entity
  const getDocuments = () => {
    if (!kycData) return [];
    
    const docs = [];
    if (kycData.CnicFrontUrl) {
      docs.push({
        id: 1,
        docType: 'cnic_front',
        url: kycData.CnicFrontUrl,
        label: 'CNIC Front',
      });
    }
    if (kycData.CnicBackUrl) {
      docs.push({
        id: 2,
        docType: 'cnic_back',
        url: kycData.CnicBackUrl,
        label: 'CNIC Back',
      });
    }
    if (kycData.SelfieUrl) {
      docs.push({
        id: 3,
        docType: 'selfie',
        url: kycData.SelfieUrl,
        label: 'Selfie',
      });
    }
    if (kycData.UtilityBillUrl) {
      docs.push({
        id: 4,
        docType: 'utility_bill',
        url: kycData.UtilityBillUrl,
        label: 'Utility Bill',
      });
    }
    return docs;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error && !userDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/admin/kyc')}>Back to KYC Review</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/kyc')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to KYC Review
          </Button>
        </div>

        {/* User Information Card */}
        {userDetails && (
          <Card className="mb-6 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <CardTitle className="text-2xl font-bold text-gray-900">{userDetails.name}</CardTitle>
                    <Badge className={`${getStatusBadgeColor(userDetails.kycStatus)} px-3 py-1 text-sm font-semibold`}>
                      {userDetails.kycStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Email:</span>
                      <span className="text-gray-600">{userDetails.email}</span>
                    </div>
                    {userDetails.phone && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Phone:</span>
                        <span className="text-gray-600">{userDetails.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Verified:</span>
                      <span className={userDetails.isVerified ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {userDetails.isVerified ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Submitted:</span>
                      <span className="text-gray-600">{new Date(userDetails.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Documents Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">KYC Documents</h2>
            <Badge variant="outline" className="text-lg px-4 py-1">
              {getDocuments().length} {getDocuments().length === 1 ? 'Document' : 'Documents'}
            </Badge>
          </div>
          {!kycData || getDocuments().length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-2">
                  <FileCheck className="w-16 h-16 mx-auto opacity-50" />
                </div>
                <p className="text-gray-500 text-lg">No documents available</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Location and Submission Info */}
              <Card className="mb-6 shadow-md">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {(kycData.city || kycData.province || kycData.country) && (
                      <div>
                        <span className="font-semibold text-gray-700">Location: </span>
                        <span className="text-gray-600">
                          {[kycData.city, kycData.province, kycData.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {kycData.submittedAt && (
                      <div>
                        <span className="font-semibold text-gray-700">Submitted: </span>
                        <span className="text-gray-600">
                          {new Date(kycData.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {kycData.reviewedAt && (
                      <div>
                        <span className="font-semibold text-gray-700">Reviewed: </span>
                        <span className="text-gray-600">
                          {new Date(kycData.reviewedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  {kycData.adminNotes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="font-semibold text-gray-700 block mb-2">Admin Notes:</span>
                      <p className="text-gray-600 italic text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                        {kycData.adminNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getDocuments().map((doc) => (
                  <Card key={doc.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {doc.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {/* Document Image */}
                      <div className="bg-gray-100 rounded-lg p-2 border-2 border-gray-200">
                        <a
                          href={getImageUrl(doc.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group"
                        >
                          <div className="relative overflow-hidden rounded-lg bg-white">
                            <img
                              src={getImageUrl(doc.url)}
                              alt={doc.label}
                              className="w-full h-80 object-contain group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/400x300?text=Document+Not+Available';
                                target.className = 'w-full h-80 object-contain opacity-50';
                              }}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded">
                                Click to view full size
                              </span>
                            </div>
                          </div>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons at Bottom */}
        {userDetails && (userDetails.kycStatus === 'pending' || userDetails.kycStatus === 'in_review') && (
          <Card className="sticky bottom-4 bg-white border-2 border-gray-300 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Review Status:</span> Ready for review
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                    onClick={handleRejectClick}
                    disabled={submitting}
                    size="lg"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject KYC
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleApproveClick}
                    disabled={submitting}
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Approve KYC
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Approve Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Approve KYC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Approval Note <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  className="w-full border rounded p-2 min-h-[100px]"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Enter optional note for approval..."
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setApproveModalOpen(false);
                    setApprovalNote('');
                  }}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApproveSubmit}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={submitting}
                >
                  {submitting ? 'Approving...' : 'Confirm Approve'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reject KYC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border rounded p-2 min-h-[100px]"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection (required)..."
                  required
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={submitting}
                >
                  {submitting ? 'Rejecting...' : 'Confirm Reject'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

