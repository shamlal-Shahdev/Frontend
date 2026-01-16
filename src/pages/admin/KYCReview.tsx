import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield,
  Mail,
  Phone,
  FileText,
  User,
  Eye,
  Calendar,
  MapPin
} from 'lucide-react';

interface UserWithKyc {
  id: number;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
  kycDocuments: Array<{
    id: number;
    userId: number;
    docType: string;
    filePath: string;
    fileHash: string;
    city: string;
    province: string;
    country: string;
    adminNotes: string | null;
    submittedAt: string;
    reviewedAt: string | null;
  }>;
  kycDocumentsCount: number;
}

export const KYCReview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithKyc[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [error, setError] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    loadUsersWithKyc();
  }, []);

  const loadUsersWithKyc = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.getUsersWithKyc();
      console.log('KYC Users Response:', response);
      // Ensure kycDocuments is an array for each user
      const usersWithDocuments = (response.users || []).map(user => ({
        ...user,
        kycDocuments: Array.isArray(user.kycDocuments) ? user.kycDocuments : []
      }));
      setUsers(usersWithDocuments);
    } catch (err: any) {
      console.error('Failed to load users with KYC', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (userId: number) => {
    setSelectedUserId(userId);
    setApprovalNote('');
    setApproveModalOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedUserId) return;

    setIsApproving(true);
    try {
      await adminApi.approveKyc(selectedUserId, approvalNote ? { note: approvalNote } : undefined);
      toast({
        title: 'Success!',
        description: 'KYC approved successfully. The user has been notified.',
        className: 'bg-green-50 border-green-200',
      });
      setApproveModalOpen(false);
      setApprovalNote('');
      setSelectedUserId(null);
      await loadUsersWithKyc();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve KYC';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectClick = (userId: number) => {
    setSelectedUserId(userId);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedUserId || !rejectionReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    setIsRejecting(true);
    try {
      await adminApi.rejectKyc(selectedUserId, { reason: rejectionReason });
      toast({
        title: 'KYC Rejected',
        description: 'KYC rejected successfully. User will be notified to resubmit documents.',
        className: 'bg-amber-50 border-amber-200',
      });
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedUserId(null);
      await loadUsersWithKyc();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reject KYC';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'not_submitted':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatStatusText = (status: string) => {
    return status?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-lg font-medium text-gray-600">Loading KYC reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">KYC Review</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <p className="text-gray-600 ml-12">Review and manage user KYC verifications</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {users.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No KYC Submissions Found</h3>
              <p className="text-gray-500">There are no users with KYC submissions at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {users.map((user) => (
              <Card key={user.id} className="shadow-md hover:shadow-lg transition-shadow border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                            <Badge className={`${getStatusBadgeColor(user.kycStatus)} border font-medium`}>
                              {formatStatusText(user.kycStatus)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span>{user.kycDocumentsCount} Document{user.kycDocumentsCount !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 ml-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/kyc/${user.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      {user.kycStatus === 'pending' || user.kycStatus === 'in_review' ? (
                        <>
                          <Button 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50 flex items-center gap-2" 
                            onClick={() => handleRejectClick(user.id)}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-sm" 
                            onClick={() => handleApproveClick(user.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                        </>
                      ) : user.kycStatus === 'approved' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-md">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">Approved</span>
                        </div>
                      ) : user.kycStatus === 'rejected' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-md">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-700 font-medium">Rejected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">No Action</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {user.kycDocuments && user.kycDocuments.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Submitted Documents ({user.kycDocuments.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {user.kycDocuments.map((doc) => (
                          <div key={doc.id} className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow overflow-hidden">
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="font-semibold text-sm text-gray-900">
                                  {doc.docType 
                                    ? doc.docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                    : 'Document'}
                                </p>
                              </div>
                              {(doc.city || doc.province || doc.country) && (
                                <div className="flex items-start gap-1.5 mb-2">
                                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-gray-600">
                                    {[doc.city, doc.province, doc.country].filter(Boolean).join(', ') || 'N/A'}
                                  </p>
                                </div>
                              )}
                              {doc.submittedAt && (
                                <p className="text-xs text-gray-500 mb-3">
                                  {new Date(doc.submittedAt).toLocaleDateString()}
                                </p>
                              )}
                              {doc.filePath && (
                                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                                  <a 
                                    href={doc.filePath.startsWith('http') ? doc.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${doc.filePath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img 
                                      src={doc.filePath.startsWith('http') ? doc.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${doc.filePath}`}
                                      alt={doc.docType || 'Document'}
                                      className="w-full h-40 object-cover hover:scale-105 transition-transform cursor-pointer"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Document+Not+Available';
                                      }}
                                    />
                                  </a>
                                </div>
                              )}
                              {doc.adminNotes && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Admin Note:</p>
                                  <p className="text-xs text-gray-600 italic bg-yellow-50 p-2 rounded">
                                    {doc.adminNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No documents available</p>
                      <p className="text-sm text-gray-400 mt-1">This user hasn't submitted any documents yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Approve KYC</CardTitle>
              </div>
              <CardDescription className="mt-2">Confirm approval of this user's KYC verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="approvalNote" className="text-sm font-medium mb-2 block">
                  Approval Note <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </Label>
                <Textarea
                  id="approvalNote"
                  className="min-h-[100px] resize-none"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Enter optional note for approval..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setApproveModalOpen(false);
                    setApprovalNote('');
                    setSelectedUserId(null);
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleApproveSubmit} 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  disabled={isApproving}
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Approve
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Reject KYC</CardTitle>
              </div>
              <CardDescription className="mt-2">Please provide a reason for rejection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="rejectionReason" className="text-sm font-medium mb-2 block">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejectionReason"
                  className="min-h-[120px] resize-none"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection (required)..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This feedback will be sent to the user</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectionReason('');
                    setSelectedUserId(null);
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRejectSubmit} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                  disabled={!rejectionReason.trim() || isRejecting}
                >
                  {isRejecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Confirm Reject
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};




