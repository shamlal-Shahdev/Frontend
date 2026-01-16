import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorApi } from '@/api/vendor.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Activity,
  Eye,
  Package,
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface InstallationEntity {
  id: number;
  userId: number;
  name: string;
  installationType: string;
  capacityKw: number;
  location: string;
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'rejected';
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

export const VendorInstallations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [installations, setInstallations] = useState<InstallationEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [error, setError] = useState('');
  const [selectedInstallation, setSelectedInstallation] = useState<InstallationEntity | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: number;
    status: 'in_progress' | 'completed' | 'rejected';
  } | null>(null);

  useEffect(() => {
    loadInstallations();
  }, [page]);

  const loadInstallations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await vendorApi.getInstallations(page, limit);
      setInstallations(response.data || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      console.error('Failed to load installations', err);
      setError(err.response?.data?.message || 'Failed to load installations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdateClick = (id: number, status: 'in_progress' | 'completed' | 'rejected') => {
    setPendingAction({ id, status });
    setConfirmDialogOpen(true);
  };

  const handleStatusUpdateConfirm = async () => {
    if (!pendingAction) return;

    const { id, status } = pendingAction;
    setConfirmDialogOpen(false);
    setUpdating(id);
    
    try {
      await vendorApi.updateInstallationStatus(id, { status });
      
      const statusText = status === 'rejected' 
        ? 'rejected' 
        : status === 'completed' 
        ? 'completed' 
        : 'started';
      
      toast({
        title: 'Success!',
        description: `Installation has been ${statusText} successfully.`,
        className: status === 'rejected' 
          ? 'bg-amber-50 border-amber-200' 
          : status === 'completed'
          ? 'bg-green-50 border-green-200'
          : 'bg-blue-50 border-blue-200',
      });
      
      loadInstallations();
      if (detailsModalOpen) {
        setDetailsModalOpen(false);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || `Failed to update installation status`;
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
      setPendingAction(null);
    }
  };

  const handleViewDetails = async (installation: InstallationEntity) => {
    try {
      const fullDetails = await vendorApi.getInstallationById(installation.id);
      setSelectedInstallation(fullDetails);
      setDetailsModalOpen(true);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load installation details',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Activity className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'assigned':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Assigned
          </Badge>
        );
      case 'submitted':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Package className="w-3 h-3 mr-1" />
            Submitted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            {status}
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
          <h1 className="text-3xl font-bold">My Installations</h1>
          <Button variant="outline" onClick={() => navigate('/vendor/dashboard')}>
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
            <CardTitle>Assigned Installations ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            {installations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No installations assigned yet
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold">ID</th>
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold">Capacity (kW)</th>
                        <th className="text-left py-3 px-4 font-semibold">Location</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Assigned</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {installations.map((installation) => (
                        <tr key={installation.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{installation.id}</td>
                          <td className="py-3 px-4 font-medium">{installation.name}</td>
                          <td className="py-3 px-4">
                              <div className="font-medium">{installation.user?.name || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-4">{installation.capacityKw} kW</td>
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
                              {installation.status === 'assigned' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-orange-600 hover:text-orange-700"
                                  onClick={() => handleStatusUpdateClick(installation.id, 'in_progress')}
                                  disabled={updating === installation.id}
                                >
                                  {updating === installation.id ? (
                                    <Clock className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Activity className="w-4 h-4" />
                                      <span className="ml-1">Start</span>
                                    </>
                                  )}
                                </Button>
                              )}
                              {installation.status === 'in_progress' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => handleStatusUpdateClick(installation.id, 'completed')}
                                    disabled={updating === installation.id}
                                  >
                                    {updating === installation.id ? (
                                      <Clock className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="ml-1">Complete</span>
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleStatusUpdateClick(installation.id, 'rejected')}
                                    disabled={updating === installation.id}
                                  >
                                    {updating === installation.id ? (
                                      <Clock className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <XCircle className="w-4 h-4" />
                                        <span className="ml-1">Reject</span>
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                              {installation.status === 'submitted' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => handleStatusUpdateClick(installation.id, 'in_progress')}
                                    disabled={updating === installation.id}
                                  >
                                    {updating === installation.id ? (
                                      <Clock className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="ml-1">Accept</span>
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleStatusUpdateClick(installation.id, 'rejected')}
                                    disabled={updating === installation.id}
                                  >
                                    {updating === installation.id ? (
                                      <Clock className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <XCircle className="w-4 h-4" />
                                        <span className="ml-1">Reject</span>
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                              {installation.status === 'assigned' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleStatusUpdateClick(installation.id, 'rejected')}
                                  disabled={updating === installation.id}
                                >
                                  {updating === installation.id ? (
                                    <Clock className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4" />
                                      <span className="ml-1">Reject</span>
                                    </>
                                  )}
                                </Button>
                              )}
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
                      Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} installations
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
                <CardTitle>Installation Details</CardTitle>
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
                  <p className="mt-1">{selectedInstallation.capacityKw} kW</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">Location</label>
                <p className="mt-1">{selectedInstallation.location}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Name</label>
                    <p className="mt-1">{selectedInstallation.user?.name || 'N/A'}</p>
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
                      <label className="text-sm font-semibold text-gray-500">Completed</label>
                      <p className="mt-1">{formatDate(selectedInstallation.verifiedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedInstallation.status === 'assigned' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    onClick={() => handleStatusUpdateClick(selectedInstallation.id, 'in_progress')}
                    disabled={updating === selectedInstallation.id}
                  >
                    {updating === selectedInstallation.id ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 mr-2" />
                        Start Installation
                      </>
                    )}
                  </Button>
                </div>
              )}

              {selectedInstallation.status === 'in_progress' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => handleStatusUpdateClick(selectedInstallation.id, 'completed')}
                    disabled={updating === selectedInstallation.id}
                  >
                    {updating === selectedInstallation.id ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleStatusUpdateClick(selectedInstallation.id, 'rejected')}
                    disabled={updating === selectedInstallation.id}
                  >
                    {updating === selectedInstallation.id ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Installation
                      </>
                    )}
                  </Button>
                </div>
              )}
              {(selectedInstallation.status === 'submitted' || selectedInstallation.status === 'assigned') && (
                <div className="flex gap-2 pt-4 border-t">
                  {selectedInstallation.status === 'submitted' && (
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => {
                        handleStatusUpdateClick(selectedInstallation.id, 'in_progress');
                      }}
                      disabled={updating === selectedInstallation.id}
                    >
                      {updating === selectedInstallation.id ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Installation
                        </>
                      )}
                    </Button>
                  )}
                  {selectedInstallation.status === 'assigned' && (
                    <Button
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                      onClick={() => {
                        handleStatusUpdateClick(selectedInstallation.id, 'in_progress');
                      }}
                      disabled={updating === selectedInstallation.id}
                    >
                      {updating === selectedInstallation.id ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Activity className="w-4 h-4 mr-2" />
                          Start Installation
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleStatusUpdateClick(selectedInstallation.id, 'rejected');
                    }}
                    disabled={updating === selectedInstallation.id}
                  >
                    {updating === selectedInstallation.id ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Installation
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              {pendingAction?.status === 'rejected' ? (
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              ) : pendingAction?.status === 'completed' ? (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <AlertDialogTitle>
                {pendingAction?.status === 'rejected' 
                  ? 'Reject Installation?' 
                  : pendingAction?.status === 'completed'
                  ? 'Complete Installation?'
                  : 'Start Installation?'}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              {pendingAction?.status === 'rejected' ? (
                <>
                  Are you sure you want to <strong>reject</strong> this installation? 
                  <br />
                  <span className="text-red-600 font-medium">This action cannot be undone.</span>
                </>
              ) : pendingAction?.status === 'completed' ? (
                <>
                  Are you sure you want to mark this installation as <strong>completed</strong>?
                  <br />
                  This will finalize the installation process.
                </>
              ) : (
                <>
                  Are you sure you want to <strong>start</strong> this installation?
                  <br />
                  The status will be updated to "In Progress".
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAction(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdateConfirm}
              className={
                pendingAction?.status === 'rejected'
                  ? 'bg-red-600 hover:bg-red-700'
                  : pendingAction?.status === 'completed'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {updating === pendingAction?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {pendingAction?.status === 'rejected' 
                    ? 'Rejecting...' 
                    : pendingAction?.status === 'completed'
                    ? 'Completing...'
                    : 'Starting...'}
                </>
              ) : (
                <>
                  {pendingAction?.status === 'rejected' 
                    ? 'Yes, Reject' 
                    : pendingAction?.status === 'completed'
                    ? 'Yes, Complete'
                    : 'Yes, Start'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


