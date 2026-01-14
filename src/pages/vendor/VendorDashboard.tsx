import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorApi } from '@/api/vendor.api';
import { api } from '@/api/axios.config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  LogOut,
  Zap,
  Activity,
  User
} from 'lucide-react';

export const VendorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setCompanyName(response.data.companyName || null);
    } catch (err) {
      console.error('Failed to load vendor profile', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await vendorApi.getInstallations(1, 1000); // Get all to calculate stats
      const installations = response.data || [];
      
      setStats({
        total: installations.length,
        assigned: installations.filter(i => i.status === 'assigned').length,
        inProgress: installations.filter(i => i.status === 'in_progress').length,
        completed: installations.filter(i => i.status === 'completed').length,
      });
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/vendor/login');
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
            <Zap className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
            <span className="ml-2 px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
              Vendor Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/vendor/profile')}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button 
              onClick={() => navigate('/vendor/installations')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Package className="w-4 h-4 mr-2" />
              My Installations
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
          <h1 className="text-3xl font-bold text-gray-900">
            {companyName ? `${companyName} Dashboard` : 'Vendor Dashboard'}
          </h1>
          <p className="text-gray-500 mt-1">Manage your assigned installations and track progress.</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Installations */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <p className="text-sm font-medium text-gray-600">Total</p>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900">
                    {stats.total}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2">
                    Assigned installations
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <p className="text-sm font-medium text-gray-600">Assigned</p>
                  </div>
                  <h3 className="text-4xl font-bold text-yellow-600">
                    {stats.assigned}
                  </h3>
                  <p className="text-xs text-yellow-600 mt-2">
                    Ready to start
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                  </div>
                  <h3 className="text-4xl font-bold text-orange-600">
                    {stats.inProgress}
                  </h3>
                  <p className="text-xs text-orange-600 mt-2">
                    Currently working
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <Activity className="w-7 h-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                  </div>
                  <h3 className="text-4xl font-bold text-green-600">
                    {stats.completed}
                  </h3>
                  <p className="text-xs text-green-600 mt-2">
                    Finished installations
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/vendor/installations')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Manage Installations</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">View and update your assigned installations</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Go to Installations →
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Installation Status</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Track your installation progress</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Assigned:</span>
                  <span className="font-bold text-yellow-600">{stats.assigned}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">In Progress:</span>
                  <span className="font-bold text-orange-600">{stats.inProgress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-bold text-green-600">{stats.completed}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


