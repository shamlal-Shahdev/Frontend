import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { vendorApi } from '@/api/vendor.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
const logoUrl = '/Assets/logo.png';
import { 
  Package, 
  LogOut,
  Zap,
  User,
  LayoutDashboard,
  Search,
  Bell,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
export const VendorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    installations?: {
      submitted: number;
      assigned: number;
      inProgress: number;
      completed: number;
      rejected: number;
    };
  } | null>(null);
  const [user, setUser] = useState<{ name?: string; email?: string; companyName?: string } | null>(null);
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
        name: userData.name || 'Vendor',
        email: userData.email || 'vendor@wattsup.com',
        companyName: (userData as any).companyName || null,
      });
    } catch (err) {
      console.error('Failed to load user data:', err);
      setUser({ name: 'Vendor', email: 'vendor@wattsup.com' });
    }
  };
  const loadDashboard = async () => {
    try {
      const response = await vendorApi.getDashboard();
      setData(response);
    } catch (err) {
      console.error('Failed to load vendor dashboard', err);
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
  const navItems = [
    { path: '/vendor/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/vendor/installations', label: 'My Installations', icon: Package },
    { path: '/vendor/profile', label: 'Profile', icon: User },
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
      {}
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        {}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="WattsUp Energy" className="h-16 w-16 rounded-md object-contain flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-lg font-bold text-gray-900 whitespace-nowrap">WattsUp Energy</span>
            )}
          </div>
        </div>
        {}
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
                    ? "bg-orange-50 text-orange-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", active && "text-orange-600")} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        {}
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
      {}
      <div className="flex-1 flex flex-col overflow-hidden">
        {}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            {}
            <div className="flex items-center gap-4 ml-auto">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Vendor'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'vendor@wattsup.com'}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
        {}
        <main className="flex-1 overflow-y-auto p-6">
          {}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.companyName ? `${user.companyName} Dashboard` : 'Vendor Dashboard'}
            </h1>
            <p className="text-gray-500 mt-1">Manage your assigned installations and track progress.</p>
          </div>
          {}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
            {}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Install to Earn</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/vendor/installations')}
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{data?.installations?.rejected || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Rejected</p>
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
