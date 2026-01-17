import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  FileCheck, 
  UserCheck, 
  ShieldCheck,
  LogOut,
  AlertCircle,
  Zap
} from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-green-500" />
            <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
            <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/admin/kyc')}
              className="bg-green-500 hover:bg-green-600"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Review KYC
            </Button>
            <Button 
              onClick={() => navigate('/admin/installations')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Installations
            </Button>
            <Button 
              onClick={() => navigate('/admin/energy-requests')}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Energy Requests
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage users, review KYC applications, and monitor platform activity.</p>
        </div>

        {/* Pending KYC Alert */}
        {(data?.kyc?.pending > 0 || data?.kyc?.inReview > 0) && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900">
                      {(data.kyc.pending || 0) + (data.kyc.inReview || 0)} KYC {((data.kyc.pending || 0) + (data.kyc.inReview || 0)) === 1 ? 'Application' : 'Applications'} Pending Review
                    </h3>
                    <p className="text-sm text-orange-700">Please review and approve/reject pending KYC applications</p>
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

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900">
                    {data?.users?.total || 0}
                  </h3>
                  <p className="text-xs text-green-600 mt-2">
                    Registered platform users
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending KYC */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="w-4 h-4 text-orange-500" />
                    <p className="text-sm font-medium text-gray-600">Pending KYC</p>
                  </div>
                  <h3 className="text-4xl font-bold text-orange-600">
                    {(data?.kyc?.pending || 0) + (data?.kyc?.inReview || 0)}
                  </h3>
                  <p className="text-xs text-orange-600 mt-2">
                    {(data?.kyc?.pending || 0) + (data?.kyc?.inReview || 0) > 0 ? 'Requires review' : 'All caught up!'}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileCheck className="w-7 h-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approved Users */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <p className="text-sm font-medium text-gray-600">Approved Users</p>
                  </div>
                  <h3 className="text-4xl font-bold text-green-600">
                    {data?.kyc?.approved || 0}
                  </h3>
                  <p className="text-xs text-green-600 mt-2">
                    KYC verified and active
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <UserCheck className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/kyc')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Review KYC Applications</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Approve or reject pending KYC documents</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Go to KYC Review →
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/energy-requests')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Energy Requests</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Review and approve energy generation requests</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-500 hover:bg-purple-600">
                Go to Energy Requests →
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>User Management</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">View and manage all platform users</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Total registered users: <span className="font-bold text-gray-900">{data?.users?.total || 0}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Verified users: <span className="font-bold text-green-600">{data?.users?.verified || 0}</span>
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">KYC Status Breakdown:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-orange-600">Pending: </span>
                    <span className="font-semibold">{data?.kyc?.pending || 0}</span>
                  </div>
                  <div>
                    <span className="text-yellow-600">In Review: </span>
                    <span className="font-semibold">{data?.kyc?.inReview || 0}</span>
                  </div>
                  <div>
                    <span className="text-green-600">Approved: </span>
                    <span className="font-semibold">{data?.kyc?.approved || 0}</span>
                  </div>
                  <div>
                    <span className="text-red-600">Rejected: </span>
                    <span className="font-semibold">{data?.kyc?.rejected || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};




