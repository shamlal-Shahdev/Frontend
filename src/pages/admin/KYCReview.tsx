import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithKyc[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [error, setError] = useState('');

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

    try {
      await adminApi.approveKyc(selectedUserId, approvalNote ? { note: approvalNote } : undefined);
      alert('KYC approved successfully');
      setApproveModalOpen(false);
      setApprovalNote('');
      setSelectedUserId(null);
      loadUsersWithKyc();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve KYC';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleRejectClick = (userId: number) => {
    setSelectedUserId(userId);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedUserId || !rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    try {
      await adminApi.rejectKyc(selectedUserId, { reason: rejectionReason });
      alert('KYC rejected successfully. User will be notified to resubmit documents.');
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedUserId(null);
      loadUsersWithKyc();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reject KYC';
      alert(`Error: ${errorMessage}`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">KYC Review</h1>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 text-red-700">
              {error}
            </CardContent>
          </Card>
        )}

        {users.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No users with KYC submissions found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-xl font-bold">{user.name}</div>
                        <Badge className={getStatusBadgeColor(user.kycStatus)}>
                          {user.kycStatus}
                        </Badge>
                      </div>
                      <div className="text-sm font-normal text-gray-500 mt-1">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Documents: {user.kycDocumentsCount} | 
                        Submitted: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/kyc/${user.id}`)}
                        className="mr-2"
                      >
                        View Details
                      </Button>
                      {user.kycStatus === 'pending' || user.kycStatus === 'in_review' ? (
                        <>
                          <Button 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700" 
                            onClick={() => handleRejectClick(user.id)}
                          >
                            Reject
                          </Button>
                          <Button 
                            className="bg-green-600 hover:bg-green-700" 
                            onClick={() => handleApproveClick(user.id)}
                          >
                            Approve
                          </Button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {user.kycStatus === 'approved' ? '✓ Approved' : '✗ Rejected'}
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.kycDocuments && user.kycDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {user.kycDocuments.map((doc) => (
                        <div key={doc.id} className="border p-4 rounded-lg bg-gray-50">
                          <p className="font-medium mb-2 text-sm">
                            {doc.docType 
                              ? doc.docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                              : 'Document'}
                          </p>
                          {(doc.city || doc.province || doc.country) && (
                            <p className="text-xs text-gray-500 mb-2">
                              Location: {[doc.city, doc.province, doc.country].filter(Boolean).join(', ') || 'N/A'}
                            </p>
                          )}
                          {doc.submittedAt && (
                            <p className="text-xs text-gray-500 mb-2">
                              Submitted: {new Date(doc.submittedAt).toLocaleString()}
                            </p>
                          )}
                          {doc.filePath && (
                            <div className="mt-2">
                              <a 
                                href={doc.filePath.startsWith('http') ? doc.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${doc.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img 
                                  src={doc.filePath.startsWith('http') ? doc.filePath : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${doc.filePath}`}
                                  alt={doc.docType || 'Document'}
                                  className="w-full h-32 object-cover rounded border hover:opacity-80 transition-opacity cursor-pointer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Document+Not+Available';
                                  }}
                                />
                              </a>
                            </div>
                          )}
                          {doc.adminNotes && (
                            <p className="text-xs text-gray-600 mt-2 italic">
                              Note: {doc.adminNotes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No documents available</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
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
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setApproveModalOpen(false);
                  setApprovalNote('');
                  setSelectedUserId(null);
                }} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleApproveSubmit} className="flex-1 bg-green-600 hover:bg-green-700">
                  Confirm Approve
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
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setRejectModalOpen(false);
                  setRejectionReason('');
                  setSelectedUserId(null);
                }} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleRejectSubmit} className="flex-1 bg-red-600 hover:bg-red-700">
                  Confirm Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};




