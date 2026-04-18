import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Zap, 
  Clock,
  ArrowLeft,
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Award,
  Leaf,
  FileCheck,
  Menu,
  X,
  User,
  LogOut,
  Search,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
export const Marketplace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {}
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
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
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
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
          <div className="max-w-4xl mx-auto">
            {}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Marketplace</h1>
                    <p className="text-xl text-gray-600 mb-4">Coming Soon</p>
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Clock className="w-5 h-5" />
                      <span>We're working on something amazing!</span>
                    </div>
                  </div>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Browse and purchase renewable energy products, services, and equipment 
                    using your WATT tokens. Exchange rewards for real-world benefits.
                  </p>
                  <div className="pt-4">
                    <Button onClick={() => navigate('/dashboard')} variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
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
