import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    kyc?: {
      pending: number;
      inReview: number;
      approved: number;
      rejected: number;
    };
    installations?: {
      submitted: number;
      assigned: number;
      inProgress: number;
      completed: number;
      rejected: number;
    };
    energyRequests?: {
      pending: number;
      approved: number;
      rejected: number;
      rewardGenerated: number;
      blockchainFailed: number;
    };
  } | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await adminApi.getDashboard();
        setData(response);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[240px]">
        <div className="text-lg text-gray-600">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage users, review KYC applications, and monitor platform activity.
        </p>
      </div>
      {(data?.kyc && ((data.kyc.pending || 0) + (data.kyc.inReview || 0)) > 0) && (
        <div className="mb-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">
                    {(data.kyc.pending || 0) + (data.kyc.inReview || 0)} KYC{' '}
                    {(data.kyc.pending || 0) + (data.kyc.inReview || 0) === 1
                      ? 'Application'
                      : 'Applications'}{' '}
                    Pending Review
                  </h3>
                  <p className="text-sm text-orange-700">
                    Please review and approve/reject pending KYC applications
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/admin/kyc')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Review Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>KYC Requests</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/kyc')}>
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{data?.kyc?.pending || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Pending</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{data?.kyc?.inReview || 0}</p>
                <p className="text-sm text-gray-600 mt-1">In Review</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{data?.kyc?.approved || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Approved</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{data?.kyc?.rejected || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Install to Earn</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/installations')}>
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {data?.installations?.submitted || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Submitted</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {data?.installations?.assigned || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Assigned</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {data?.installations?.inProgress || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">In Progress</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {data?.installations?.completed || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg col-span-2">
                <p className="text-2xl font-bold text-red-600">
                  {data?.installations?.rejected || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Energy Requests</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/energy-requests')}>
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {data?.energyRequests?.pending || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Pending</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {data?.energyRequests?.approved || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Approved</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {data?.energyRequests?.rewardGenerated || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Reward Generated</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {data?.energyRequests?.rejected || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Rejected</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg col-span-2">
                <p className="text-2xl font-bold text-gray-600">
                  {data?.energyRequests?.blockchainFailed || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Blockchain Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
