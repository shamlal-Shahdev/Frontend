import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { energyApi, EnergyRequest } from '@/api/energy.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Upload,
} from 'lucide-react';

const getStatusBadge = (status: EnergyRequest['status']) => {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Under review
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approved, generating reward
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    case 'REWARD_GENERATED':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Reward Generated
        </Badge>
      );
    case 'BLOCKCHAIN_FAILED':
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          Blockchain Failed
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

export const EnergyStatus = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<EnergyRequest[]>([]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await energyApi.getStatus();
      setRequests(response.requests.sort((a, b) => {
        // Sort by year desc, then month desc
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      }));
    } catch (err: any) {
      console.error('Failed to load energy status', err);
      toast({
        title: 'Error',
        description: 'Failed to load energy request status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading status...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
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
              <CardTitle className="text-2xl">Energy Generation Requests</CardTitle>
              <CardDescription>
                You haven't submitted any energy generation requests yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/energy/upload')} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Submit Your First Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={loadStatus}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Energy Generation Requests</CardTitle>
            <CardDescription>
              View the status of your energy generation verification requests
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {getMonthName(request.month)} {request.year}
                    </CardTitle>
                    <CardDescription>
                      Submitted on {formatDate(request.createdAt)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status-specific content */}
                {request.status === 'PENDING' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-900">Under Review</p>
                        <p className="text-sm text-yellow-800 mt-1">
                          Your request is being reviewed by our admin team. You will be notified
                          once the review is complete.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {request.status === 'APPROVED' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900">Approved, Generating Reward</p>
                        <p className="text-sm text-blue-800 mt-1">
                          Your request has been approved. The reward is being generated on the
                          blockchain.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {request.status === 'REJECTED' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-red-900">Request Rejected</p>
                          {request.adminRemark && (
                            <div className="mt-3 bg-white border border-red-200 p-3 rounded">
                              <p className="text-xs font-semibold text-red-900 mb-1 uppercase tracking-wide">
                                Rejection Reason:
                              </p>
                              <p className="text-sm text-red-700">{request.adminRemark}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate('/energy/upload')}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image Again
                    </Button>
                  </div>
                )}

                {request.status === 'REWARD_GENERATED' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-900">Reward Generated Successfully!</p>
                        {request.rewardAmount && (
                          <p className="text-lg text-green-800 mt-2">
                            Reward Amount: <strong>{request.rewardAmount} tokens</strong>
                          </p>
                        )}
                        {request.blockchainTxHash && (
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-green-900 mb-1">
                              Transaction Hash:
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-white px-2 py-1 rounded border border-green-200 font-mono">
                                {request.blockchainTxHash}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Open blockchain explorer (adjust URL based on your blockchain)
                                  window.open(
                                    `https://etherscan.io/tx/${request.blockchainTxHash}`,
                                    '_blank',
                                  );
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {request.status === 'BLOCKCHAIN_FAILED' && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-orange-900">
                          Reward Generation Failed
                        </p>
                        <p className="text-sm text-orange-800 mt-1">
                          The reward generation failed on the blockchain. The admin has been
                          notified and will resolve this issue shortly.
                        </p>
                        {request.adminRemark && (
                          <div className="mt-3 bg-white border border-orange-200 p-3 rounded">
                            <p className="text-xs font-semibold text-orange-900 mb-1">
                              Error Details:
                            </p>
                            <p className="text-sm text-orange-700">{request.adminRemark}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {request.meterIdFromImage && (
                    <div>
                      <p className="text-gray-500">Meter ID:</p>
                      <p className="font-medium">{request.meterIdFromImage}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Last Updated:</p>
                    <p className="font-medium">{formatDate(request.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button
            onClick={() => navigate('/energy/upload')}
            className="w-full"
            disabled={(() => {
              const now = new Date();
              const currentMonth = now.getMonth() + 1;
              const currentYear = now.getFullYear();
              const existing = requests.find(
                (r) => r.month === currentMonth && r.year === currentYear,
              );
              return (
                existing?.status === 'PENDING' ||
                existing?.status === 'APPROVED' ||
                existing?.status === 'REWARD_GENERATED'
              );
            })()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Submit New Request
          </Button>
        </div>
      </div>
    </div>
  );
};

