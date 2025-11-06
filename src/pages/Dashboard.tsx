import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingUp, Award, Leaf, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState({ zabCoin: 1234, totalEarned: 5678 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching wallet data
    setTimeout(() => {
      setWalletBalance({ zabCoin: 1234, totalEarned: 5678 });
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    {
      title: "Total Energy Generated",
      value: "1,247 kWh",
      change: "+12.5%",
      icon: Zap,
      color: "from-primary to-accent",
      clickable: false
    },
    {
      title: "ZABcoin Balance",
      value: loading ? "..." : walletBalance.zabCoin.toLocaleString(),
      change: `Total earned: ${loading ? "..." : walletBalance.totalEarned.toLocaleString()}`,
      icon: Wallet,
      color: "from-yellow-500 to-orange-500",
      clickable: true
    },
    {
      title: "CO₂ Offset",
      value: "892 kg",
      change: "+15.8%",
      icon: Leaf,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Certificates Earned",
      value: "12",
      change: "+2",
      icon: Award,
      color: "from-blue-500 to-cyan-500",
      clickable: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your renewable energy overview.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card 
                key={stat.title} 
                className={`glass-card animate-slide-up hover:scale-105 transition-transform ${stat.clickable ? 'cursor-pointer' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => stat.clickable && navigate('/wallet')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} energy-glow`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-primary flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
