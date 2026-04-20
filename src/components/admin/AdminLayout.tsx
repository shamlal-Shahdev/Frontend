import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FileCheck,
  LogOut,
  Zap,
  LayoutDashboard,
  Bell,
  Menu,
  X,
  User,
  Coins,
} from 'lucide-react';

const logoUrl = '/Assets/logo.png';

const navItems = [
  { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/kyc', label: 'KYC Review', icon: FileCheck },
  { path: '/admin/installations', label: 'Installations', icon: Zap },
  { path: '/admin/energy-requests', label: 'Energy Requests', icon: Zap },
  { path: '/admin/rewards', label: 'Rewards', icon: Coins },
] as const;

function navItemActive(path: string, pathname: string): boolean {
  if (path === '/admin/kyc') {
    return pathname === '/admin/kyc' || pathname.startsWith('/admin/kyc/');
  }
  return pathname === path;
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { authApi } = await import('@/api/auth.api');
        const userData = await authApi.getCurrentUser();
        setUser({
          name: userData.name || 'Admin',
          email: userData.email || 'admin@wattsup.com',
        });
      } catch {
        setUser({ name: 'Admin', email: 'admin@wattsup.com' });
      }
    };
    void loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={cn(
          'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
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
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
                  WattsUp Energy
                </span>
                <span className="text-xs text-purple-600 font-semibold">Admin Panel</span>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = navItemActive(item.path, location.pathname);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  active
                    ? 'bg-purple-50 text-purple-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-purple-600')} />
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
            type="button"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
          <div className="flex items-center">
            <div className="flex items-center gap-4 ml-auto">
              <Button variant="ghost" size="icon" className="relative" type="button">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@wattsup.com'}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} type="button">
                  <LogOut className="w-4 h-4" />
                </Button>
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
