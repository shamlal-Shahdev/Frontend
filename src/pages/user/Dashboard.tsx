import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dashboardApi } from '@/api/dashboard.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
const logoUrl = '/Assets/logo.png';
import { 
  Zap, 
  TrendingUp, 
  Award, 
  CloudRain,
  Activity,
  Clock,
  LogOut,
  User,
  Wallet,
  LayoutDashboard,
  Search,
  Bell,
  ShoppingBag,
  FileCheck,
  Leaf,
  Menu,
  X,
  MoreVertical,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalEnergyGenerated?: number;
    tokensAvailable?: number;
    certificatesEarned?: number;
    energyGenerationTrend?: Array<{ month: string; energy: number }>;
    rewardsDistribution?: Array<{ category: string; amount: number; percentage: number }>;
    recentActivity?: Array<{
      type: string;
      description: string;
      amount?: number;
      date: string | Date;
    }>;
  } | null>(null);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboard();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { authApi } = await import('@/api/auth.api');
      const userData = await authApi.getCurrentUser();
      setUser({
        name: userData.name || 'User',
        email: userData.email || 'user@wattsup.com',
      });
    } catch (err) {
      console.error('Failed to load user data:', err);
      setUser({ name: 'User', email: 'user@wattsup.com' });
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await dashboardApi.getUserDashboard();
      setData(response);
    } catch (err: unknown) {
      console.error('Failed to load dashboard:', err);
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

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/install-to-earn', label: 'Install to Earn', icon: Zap },
    { path: '/energy/upload', label: 'Energy', icon: TrendingUp },
    { path: '/certificates', label: 'Certificates', icon: Award },
    { path: '/carbon', label: 'CO₂ Offset', icon: Leaf },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { path: '/predict', label: 'Predict & Win', icon: FileCheck },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="WattsUp Energy" className="h-16 w-16 rounded-md object-contain flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-lg font-bold text-gray-900 whitespace-nowrap">WattsUp Energy</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <Button
            onClick={() => navigate('/energy/upload')}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {sidebarOpen ? (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Energy Reading
              </>
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  active
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", active && "text-green-600")} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            {/* User Profile Section - Right Side */}
            <div className="flex items-center gap-4 ml-auto">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 hover:text-green-600 transition-colors">{user?.email || 'user@wattsup.com'}</p>
                  </div>
                </button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's your renewable energy overview.</p>
          </div>

          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Energy Generated */}
            <Card className="hover:shadow-lg transition-shadow relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Total Energy Generated</p>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {data?.totalEnergyGenerated || 0} <span className="text-xl">kWh</span>
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WATT Balance */}
            <Card className="hover:shadow-lg transition-shadow relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">WATT Balance</p>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {data?.tokensAvailable || 0}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CO₂ Offset */}
            <Card className="hover:shadow-lg transition-shadow relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <CloudRain className="w-5 h-5 text-orange-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Avg CO₂ Offset</p>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {Math.round((data?.totalEnergyGenerated || 0) * 0.7)} <span className="text-xl">kg</span>
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificates Earned */}
            <Card className="hover:shadow-lg transition-shadow relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <Award className="w-5 h-5 text-pink-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Certificates Earned</p>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {data?.certificatesEarned || 0}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Data Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Energy Generation Trend */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Energy Generation Trend</CardTitle>
                  <Button variant="outline" size="sm">
                    Last 6 months
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {data?.energyGenerationTrend && data.energyGenerationTrend.length > 0 ? (
                  <div className="h-64">
                    <div className="flex items-end justify-between h-full gap-2">
                      {data.energyGenerationTrend.map((item, idx) => {
                        const maxEnergy = Math.max(...data.energyGenerationTrend!.map(d => d.energy), 1);
                        const height = maxEnergy > 0 ? (item.energy / maxEnergy) * 100 : 0;
                        const monthName = new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' });
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col items-center justify-end h-48">
                              <div
                                className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all hover:from-green-600 hover:to-green-500"
                                style={{ height: `${height}%`, minHeight: item.energy > 0 ? '4px' : '0' }}
                                title={`${item.energy.toFixed(2)} kWh`}
                              />
                            </div>
                            <div className="text-xs text-gray-600 font-medium">{monthName}</div>
                            <div className="text-xs text-gray-500">{item.energy.toFixed(1)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <p>No energy generation data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rewards Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rewards Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.rewardsDistribution && data.rewardsDistribution.length > 0 ? (
                  <div className="h-64 space-y-4">
                    {data.rewardsDistribution.map((item, idx) => {
                      const categoryLabels: Record<string, string> = {
                        daily_reward: 'Daily Rewards',
                        prediction_bonus: 'Prediction Bonus',
                      };
                      const categoryColors = ['bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500', 'bg-pink-500'];
                      const color = categoryColors[idx % categoryColors.length];
                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">
                              {categoryLabels[item.category] || item.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-gray-600">
                              {item.amount.toFixed(2)} WATT ({item.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`${color} h-2.5 rounded-full transition-all`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {data.rewardsDistribution.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No rewards data available</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <p>No rewards distribution data available</p>
                  </div>
                )}
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
                  {data.recentActivity.map((activity, idx: number) => (
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
                            +{activity.amount} WATT
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
        </main>
      </div>
    </div>
  );
};
