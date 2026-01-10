import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '@/api/dashboard.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  TrendingUp, 
  Award, 
  CloudRain,
  Activity,
  Clock,
  AlertCircle,
  LogOut,
  User
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // const response = await dashboardApi.getUserDashboard();
      // setData(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-500" />
            <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg bg-green-500 text-white font-medium">
              Dashboard
            </button>
            <button className="text-gray-600 hover:text-gray-900">Wallet</button>
            <button 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/install-to-earn')}
            >
              Install to Earn
            </button>
            <button className="text-gray-600 hover:text-gray-900">Energy</button>
            <button className="text-gray-600 hover:text-gray-900">Certificates</button>
            <button className="text-gray-600 hover:text-gray-900">CO₂ Offset</button>
            <button className="text-gray-600 hover:text-gray-900">Marketplace</button>
            <button className="text-gray-600 hover:text-gray-900">Predict & Win</button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's your renewable energy overview.</p>
        </div>

        {/* KYC Success Alert - User is verified and KYC approved */}
        <div className="mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">✓ KYC Verified Successfully</h3>
                  <p className="text-sm text-green-700">Your account has been approved and you have full access to all features.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Energy Generated */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <p className="text-sm font-medium text-gray-600">Total Energy Generated</p>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {data?.totalEnergyGenerated || 0} <span className="text-xl">kWh</span>
                  </h3>
                  <p className="text-xs text-green-600 mt-1">
                    ↑ +12.5% from last month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ZatKoin Balance */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-yellow-500" />
                    <p className="text-sm font-medium text-gray-600">ZatKoin Balance</p>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {data?.tokensAvailable || 0}
                  </h3>
                  <p className="text-xs text-blue-600 mt-1">
                    ↑ Total earned: {data?.totalTokensEarned || 0} from last month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CO₂ Offset */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CloudRain className="w-4 h-4 text-green-500" />
                    <p className="text-sm font-medium text-gray-600">CO₂ Offset</p>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {Math.round((data?.totalEnergyGenerated || 0) * 0.7)} <span className="text-xl">kg</span>
                  </h3>
                  <p className="text-xs text-green-600 mt-1">
                    ↑ +15.2% from last month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CloudRain className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificates Earned */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    <p className="text-sm font-medium text-gray-600">Certificates Earned</p>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {data?.certificatesEarned || 0}
                  </h3>
                  <p className="text-xs text-green-600 mt-1">
                    ↑ +2 from last month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-600" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <p className="text-sm text-gray-500 mt-1">Your latest activities and achievements</p>
          </CardHeader>
          <CardContent>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {data.recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'energy' ? 'bg-blue-100' :
                      activity.type === 'tokens' ? 'bg-yellow-100' :
                      activity.type === 'prediction' ? 'bg-purple-100' :
                      'bg-green-100'
                    }`}>
                      {activity.type === 'energy' ? <Zap className="w-5 h-5 text-blue-600" /> :
                       activity.type === 'tokens' ? <TrendingUp className="w-5 h-5 text-yellow-600" /> :
                       activity.type === 'prediction' ? <Activity className="w-5 h-5 text-purple-600" /> :
                       <Award className="w-5 h-5 text-green-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.description}</p>
                      {activity.amount && (
                        <p className="text-lg font-bold text-yellow-600 mt-1">
                          +{activity.amount} ZatKoins
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        activity.type === 'energy' ? 'bg-blue-100 text-blue-700' :
                        activity.type === 'tokens' ? 'bg-yellow-100 text-yellow-700' :
                        activity.type === 'prediction' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};




