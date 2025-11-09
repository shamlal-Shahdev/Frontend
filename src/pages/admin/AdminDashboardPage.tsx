import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAdmin } from '@/hooks/useAdmin';
import { 
  Users, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { stats, loading, error, fetchDashboardStats } = useAdmin();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users and KYC verifications</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/users')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/users')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total KYC
              </CardTitle>
              <FileCheck className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalKyc || 0}</div>
              <p className="text-xs text-gray-500 mt-1">KYC submissions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/users?kycStatus=pending')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Review
              </CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.stats.pending || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/users?kycStatus=in_review')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                In Review
              </CardTitle>
              <Eye className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.stats.in_review || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Currently reviewing</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/users?kycStatus=approved')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Approved
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.stats.approved || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Verified KYCs</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/users?kycStatus=rejected')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Rejected
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.stats.rejected || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Rejected submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <h3 className="font-medium text-gray-900">View All Users</h3>
                <p className="text-sm text-gray-500 mt-1">Manage user accounts</p>
              </button>

              <button
                onClick={() => navigate('/admin/users?kycStatus=pending')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Clock className="h-6 w-6 text-yellow-600 mb-2" />
                <h3 className="font-medium text-gray-900">Pending KYC</h3>
                <p className="text-sm text-gray-500 mt-1">Review pending submissions</p>
              </button>

              <button
                onClick={() => navigate('/admin/users?kycStatus=in_review')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Eye className="h-6 w-6 text-blue-600 mb-2" />
                <h3 className="font-medium text-gray-900">In Review</h3>
                <p className="text-sm text-gray-500 mt-1">View applications being reviewed</p>
              </button>

              <button
                onClick={() => navigate('/admin/audit-logs')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <FileCheck className="h-6 w-6 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900">Audit Logs</h3>
                <p className="text-sm text-gray-500 mt-1">View activity logs</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

