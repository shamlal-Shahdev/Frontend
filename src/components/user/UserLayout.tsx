import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Zap,
  Award,
  User,
  Wallet,
  LayoutDashboard,
  ShoppingBag,
  FileCheck,
  Leaf,
  Menu,
  X,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

const logoUrl = '/Assets/logo.png';

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/install-to-earn', label: 'Install to Earn', icon: Zap },
  { path: '/certificates', label: 'Certificates', icon: Award },
  { path: '/carbon', label: 'CO₂ Offset', icon: Leaf },
  { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { path: '/predict', label: 'Predict & Win', icon: FileCheck },
] as const;

function navActive(path: string, pathname: string): boolean {
  return pathname === path;
}

export function UserLayout() {
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
          name: userData.name || 'User',
          email: userData.email || 'user@wattsup.com',
        });
      } catch {
        setUser({ name: 'User', email: 'user@wattsup.com' });
      }
    };
    void loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
              <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
                WattsUp Energy
              </span>
            )}
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = navActive(item.path, location.pathname);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  active
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-green-600')} />
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
          <div className="flex items-center justify-between w-full">
            {location.pathname === '/profile' ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'user@wattsup.com'}</p>
                  </div>
                </button>
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
