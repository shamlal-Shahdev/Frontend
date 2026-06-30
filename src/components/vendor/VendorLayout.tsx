import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Package,
  LogOut,
  User,
  LayoutDashboard,
  Bell,
  Menu,
  X,
  Upload,
  ShoppingBag,
  Wallet,
} from 'lucide-react';
import { BackButton } from '@/components/common/BackButton';

const logoUrl = '/Assets/logo.png';

const navItems = [
  { path: '/vendor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/vendor/wallet', label: 'Vendor Wallet', icon: Wallet },
  { path: '/vendor/installations', label: 'My Installations', icon: Package },
  { path: '/vendor/usage-import', label: 'Usage import', icon: Upload },
  { path: '/vendor/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { path: '/vendor/profile', label: 'Profile', icon: User },
] as const;

export function VendorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    companyName?: string | null;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { authApi } = await import('@/api/auth.api');
        const userData = await authApi.getCurrentUser();
        setUser({
          name: userData.name || 'Vendor',
          email: userData.email || 'vendor@wattsup.com',
          companyName: (userData as { companyName?: string | null }).companyName ?? null,
        });
      } catch {
        setUser({ name: 'Vendor', email: 'vendor@wattsup.com' });
      }
    };
    void loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/vendor/login');
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <aside
        className={cn(
          'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full shrink-0',
          sidebarOpen ? 'w-64' : 'w-20',
        )}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="WattsUp Energy"
              className="h-16 w-16 rounded-md object-contain flex-shrink-0"
            />
            {sidebarOpen && (
              <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
                WattsUp Energy
              </span>
            )}
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  active
                    ? 'bg-orange-50 text-orange-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-orange-600')} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleLogout}
            className={cn(
              'w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200',
              sidebarOpen ? 'justify-start' : 'justify-center px-0',
            )}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between w-full gap-4">
            <BackButton />
            <div className="flex items-center gap-4 ml-auto">
              <Button variant="ghost" size="icon" className="relative" type="button">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Vendor'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'vendor@wattsup.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
