import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminEnergyApi } from '@/api/admin-energy.api';
import { EnergyRequest } from '@/api/energy.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getStatusBadge = (status: EnergyRequest['status']) => {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          PENDING
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          APPROVED
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          REJECTED
        </Badge>
      );
    case 'REWARD_GENERATED':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          REWARD_GENERATED
        </Badge>
      );
    case 'BLOCKCHAIN_FAILED':
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          BLOCKCHAIN_FAILED
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const getMonthName = (month: number) => {
  const date = new Date(2000, month - 1, 1);
  return date.toLocaleString('default', { month: 'long' });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getImageUrl = (filePath: string | undefined | null) => {
  console.log('[getImageUrl] Input filePath:', filePath);
  
  if (!filePath) {
    console.log('[getImageUrl] No filePath provided, returning empty string');
    return '';
  }
  
  let normalizedPath = filePath.replace(/\\/g, '/');
  console.log('[getImageUrl] After backslash normalization:', normalizedPath);
  
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    console.log('[getImageUrl] Already a full URL, returning as is:', normalizedPath);
    return normalizedPath;
  }
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  console.log('[getImageUrl] Base URL:', baseUrl);
  
  if (normalizedPath.startsWith('/api/v1/')) {
    normalizedPath = normalizedPath.replace('/api/v1/', '');
    console.log('[getImageUrl] After removing /api/v1/ prefix:', normalizedPath);
  }
  
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1);
    console.log('[getImageUrl] After removing leading slash:', normalizedPath);
  }
  
  const finalUrl = `${baseUrl}/api/v1/files/${normalizedPath}`;
  console.log('[getImageUrl] Final constructed URL:', finalUrl);
  
  return finalUrl;
};

export const EnergyRequests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<EnergyRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<EnergyRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<EnergyRequest | null>(null);
  const [viewImageOpen, setViewImageOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, activeTab]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await adminEnergyApi.getAll();
      setRequests(response.requests);
    } catch (err: any) {
      console.error('Failed to load energy requests', err);
      toast({
        title: 'Error',
        description: 'Failed to load energy requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (activeTab === 'all') {
      setFilteredRequests(requests);
    } else {
      const statusMap: Record<string, EnergyRequest['status']> = {
        pending: 'PENDING',
        approved: 'APPROVED',
        rejected: 'REJECTED',
      };
      const status = statusMap[activeTab];
      setFilteredRequests(requests.filter((r) => r.status === status));
    }
  };

  const handleViewImage = (request: EnergyRequest) => {
    setSelectedRequest(request);
    setViewImageOpen(true);
  };

  const handleApproveClick = (request: EnergyRequest) => {
    setSelectedRequest(request);
    setApprovalNote('');
    setRewardAmount('');
    setApproveDialogOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedRequest) return;

    setIsApproving(true);
    try {
      const dto: any = {};
      if (approvalNote.trim()) {
        dto.remark = approvalNote;
      }
      if (rewardAmount.trim()) {
        dto.rewardAmount = parseFloat(rewardAmount);
      }

      await adminEnergyApi.approve(selectedRequest.id, dto);
      toast({
        title: 'Success!',
        description: 'Energy request approved and reward generation initiated.',
        className: 'bg-green-50 border-green-200',
      });
      setApproveDialogOpen(false);
      setSelectedRequest(null);
      setApprovalNote('');
      setRewardAmount('');
      await loadRequests();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to approve request';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectClick = (request: EnergyRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    setIsRejecting(true);
    try {
      await adminEnergyApi.reject(selectedRequest.id, { reason: rejectionReason });
      toast({
        title: 'Request Rejected',
        description: 'Energy request rejected successfully.',
        className: 'bg-amber-50 border-amber-200',
      });
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
      await loadRequests();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to reject request';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading energy requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={loadRequests}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Energy Generation Requests</CardTitle>
            <CardDescription>
              Review and manage energy generation verification requests
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({requests.filter((r) => r.status === 'PENDING').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({requests.filter((r) => r.status === 'APPROVED').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({requests.filter((r) => r.status === 'REJECTED').length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No requests found for this filter.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Request #{request.id} - {getMonthName(request.month)} {request.year}
                          </CardTitle>
                          <CardDescription>
                            User ID: {request.userId} | Submitted: {formatDate(request.createdAt)}
                          </CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {request.meterIdFromImage && (
                          <div>
                            <p className="text-gray-500">Meter ID:</p>
                            <p className="font-medium">{request.meterIdFromImage}</p>
                          </div>
                        )}
                        {request.rewardAmount && (
                          <div>
                            <p className="text-gray-500">Reward Amount:</p>
                            <p className="font-medium">{request.rewardAmount} tokens</p>
                          </div>
                        )}
                        {request.blockchainTxHash && (
                          <div className="col-span-2">
                            <p className="text-gray-500">Transaction Hash:</p>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {request.blockchainTxHash}
                            </code>
                          </div>
                        )}
                      </div>

                      {request.adminRemark && (
                        <div className="p-3 bg-gray-50 rounded border">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Admin Remark:</p>
                          <p className="text-sm text-gray-600">{request.adminRemark}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewImage(request)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Image
                        </Button>
                        {request.status === 'PENDING' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveClick(request)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectClick(request)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* View Image Dialog */}
        <Dialog open={viewImageOpen} onOpenChange={setViewImageOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Meter Image</DialogTitle>
              <DialogDescription>
                {selectedRequest &&
                  `Request #${selectedRequest.id} - ${getMonthName(selectedRequest.month)} ${selectedRequest.year}`}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="flex justify-center">
                <img
                  src={getImageUrl(selectedRequest.meterImageUrl)}
                  alt="Meter"
                  className="max-w-full h-auto rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Energy Request</DialogTitle>
              <DialogDescription>
                Approve this request and generate reward. The system will verify meter ID and wallet
                address, then trigger blockchain reward generation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rewardAmount">Reward Amount (Optional)</Label>
                <Input
                  id="rewardAmount"
                  type="number"
                  step="0.01"
                  placeholder="Default: 100 tokens"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Leave empty to use default reward amount
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvalNote">Admin Note (Optional)</Label>
                <Textarea
                  id="approvalNote"
                  placeholder="Add any notes about this approval..."
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setApproveDialogOpen(false)}
                disabled={isApproving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproveSubmit}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Generate Reward
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Energy Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request. The user will see this reason
                and can resubmit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Enter the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500">
                  This reason will be shown to the user
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectSubmit}
                disabled={isRejecting || !rejectionReason.trim()}
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

