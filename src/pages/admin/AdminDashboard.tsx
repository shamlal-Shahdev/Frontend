import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
const logoUrl = '/Assets/logo.png';
import { 
  FileCheck, 
  ShieldCheck,
  LogOut,
  AlertCircle,
  Zap,
  LayoutDashboard,
  Search,
  Bell,
  Menu,
  X,
  User,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
export const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        name: userData.name || 'Admin',
        email: userData.email || 'admin@wattsup.com',
      });
    } catch (err) {
      console.error('Failed to load user data:', err);
      setUser({ name: 'Admin', email: 'admin@wattsup.com' });
    }
  };
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
  const navItems = [
    { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/kyc', label: 'KYC Review', icon: FileCheck },
    { path: '/admin/installations', label: 'Installations', icon: Zap },
    { path: '/admin/energy-requests', label: 'Energy Requests', icon: Zap },
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
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="WattsUp Energy" className="h-16 w-16 rounded-md object-contain flex-shrink-0" />
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 whitespace-nowrap">WattsUp Energy</span>
                <span className="text-xs text-purple-600 font-semibold">Admin Panel</span>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
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
                    ? "bg-purple-50 text-purple-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", active && "text-purple-600")} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <div className="flex items-center gap-4 ml-auto">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@wattsup.com'}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage users, review KYC applications, and monitor platform activity.</p>
          </div>
          {(data?.kyc && ((data.kyc.pending || 0) + (data.kyc.inReview || 0)) > 0) && (
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>KYC Requests</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin/kyc')}
                  >
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin/installations')}
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{data?.installations?.submitted || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Submitted</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{data?.installations?.assigned || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Assigned</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{data?.installations?.inProgress || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">In Progress</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{data?.installations?.completed || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg col-span-2">
                    <p className="text-2xl font-bold text-red-600">{data?.installations?.rejected || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Energy Requests</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin/energy-requests')}
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{data?.energyRequests?.pending || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{data?.energyRequests?.approved || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Approved</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{data?.energyRequests?.rewardGenerated || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Reward Generated</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{data?.energyRequests?.rejected || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Rejected</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-2xl font-bold text-gray-600">{data?.energyRequests?.blockchainFailed || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Blockchain Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};
