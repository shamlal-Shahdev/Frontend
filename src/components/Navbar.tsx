import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, LayoutDashboard, Award, ShoppingBag, TrendingUp, FileCheck, Leaf, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/wallet", label: "Wallet", icon: Wallet },
    { path: "/install", label: "Install to Earn", icon: Zap },
    { path: "/energy", label: "Energy", icon: TrendingUp },
    { path: "/certificates", label: "Certificates", icon: Award },
    { path: "/carbon", label: "CO₂ Offset", icon: Leaf },
    { path: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { path: "/predict", label: "Predict & Win", icon: FileCheck },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link to="/" className="flex items-center space-x-2 mr-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent energy-glow">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">WattsUp Energy</span>
        </Link>
        
        <div className="flex items-center space-x-1 flex-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              size="sm"
              asChild
              className={cn(
                "transition-all",
                isActive(item.path) && "energy-glow"
              )}
            >
              <Link to={item.path}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
        
        <Button variant="ghost" size="icon" asChild>
          <Link to="/profile">
            <User className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </nav>
  );
};
