import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  Trash2,
  Eye
} from 'lucide-react';

interface InstallationEntity {
  id: number;
  userId: number;
  name: string;
  installationType: string;
  capacityKw: number;
  location: string;
  status: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  registeredAt: string;
  verifiedAt?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export const InstallationRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [installations, setInstallations] = useState<InstallationEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [error, setError] = useState('');
  const [selectedInstallation, setSelectedInstallation] = useState<InstallationEntity | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadInstallations();
  }, [page]);

  const loadInstallations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.getInstallations(page, limit);
      setInstallations(response.data || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      console.error('Failed to load installation requests', err);
      setError(err.response?.data?.message || 'Failed to load installation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: 'verified' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status === 'verified' ? 'approve' : 'reject'} this installation request?`)) {
      return;
    }

    try {
      await adminApi.updateInstallation(id, { status });
      alert(`Installation request ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
      loadInstallations();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${status} installation request`;
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this installation request? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.deleteInstallation(id);
      alert('Installation request deleted successfully');
      loadInstallations();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete installation request';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleViewDetails = (installation: InstallationEntity) => {
    setSelectedInstallation(installation);
    setDetailsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Installation Requests</h1>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 text-red-700">{error}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Installation Requests ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            {installations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No installation requests found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold">ID</th>
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">User</th>
                        <th className="text-left py-3 px-4 font-semibold">Capacity (kWh)</th>
                        <th className="text-left py-3 px-4 font-semibold">Location</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Submitted</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {installations.map((installation) => (
                        <tr key={installation.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{installation.id}</td>
                          <td className="py-3 px-4 font-medium">{installation.name}</td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{installation.user?.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{installation.user?.email || ''}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{installation.capacityKw} kWh</td>
                          <td className="py-3 px-4">
                            <div className="max-w-xs truncate" title={installation.location}>
                              {installation.location}
                            </div>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(installation.status)}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {formatDate(installation.registeredAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(installation)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {installation.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => handleStatusUpdate(installation.id, 'verified')}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleStatusUpdate(installation.id, 'rejected')}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(installation.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {total > limit && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} requests
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page * limit >= total}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Modal */}
      {detailsModalOpen && selectedInstallation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Installation Request Details</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setDetailsModalOpen(false)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500">ID</label>
                  <p className="mt-1">{selectedInstallation.id}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Status</label>
                  <p className="mt-1">{getStatusBadge(selectedInstallation.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Installation Name</label>
                  <p className="mt-1">{selectedInstallation.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Type</label>
                  <p className="mt-1 capitalize">{selectedInstallation.installationType.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Capacity</label>
                  <p className="mt-1">{selectedInstallation.capacityKw} kWh</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Active</label>
                  <p className="mt-1">{selectedInstallation.isActive ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">Location</label>
                <p className="mt-1">{selectedInstallation.location}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Name</label>
                    <p className="mt-1">{selectedInstallation.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Email</label>
                    <p className="mt-1">{selectedInstallation.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Phone</label>
                    <p className="mt-1">{selectedInstallation.user?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Timestamps</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Submitted</label>
                    <p className="mt-1">{formatDate(selectedInstallation.registeredAt)}</p>
                  </div>
                  {selectedInstallation.verifiedAt && (
                    <div>
                      <label className="text-sm font-semibold text-gray-500">Verified</label>
                      <p className="mt-1">{formatDate(selectedInstallation.verifiedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedInstallation.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      handleStatusUpdate(selectedInstallation.id, 'verified');
                      setDetailsModalOpen(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleStatusUpdate(selectedInstallation.id, 'rejected');
                      setDetailsModalOpen(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

