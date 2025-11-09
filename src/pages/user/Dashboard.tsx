import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingUp, Award, Leaf, Wallet, Info, X, Coins, Clock, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ActivityItem {
  id: string;
  type: 'reward' | 'certificate' | 'energy' | 'prediction' | 'kyc' | 'login';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  icon: React.ElementType;
  color: string;
}

const Dashboard = () => {
  const [walletBalance, setWalletBalance] = useState({ zabCoin: 1234, totalEarned: 5678 });
  const [loading, setLoading] = useState(true);
  const [showKYCNotification, setShowKYCNotification] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching wallet data
    setTimeout(() => {
      setWalletBalance({ zabCoin: 1234, totalEarned: 5678 });
      setLoading(false);
    }, 1000);

    // Check if we should show KYC notification
    const showNotification = localStorage.getItem("showKYCNotification");
    if (showNotification === "true") {
      setShowKYCNotification(true);
      // Clear the flag so it doesn't show again
      localStorage.removeItem("showKYCNotification");
    }

    // Check KYC status
    checkKYCStatus();
    
    // Fetch recent activities
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // DUMMY API CALL FOR UI TESTING - Remove this when backend is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate recent activities
      const dummyActivities: ActivityItem[] = [
        {
          id: "1",
          type: "reward",
          title: "Reward Earned",
          description: "Earned 500 ZABcoins for energy generation",
          amount: 500,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          icon: Coins,
          color: "text-yellow-500",
        },
        {
          id: "2",
          type: "certificate",
          title: "Certificate Earned",
          description: "Carbon Offset Certificate issued",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          icon: Award,
          color: "text-blue-500",
        },
        {
          id: "3",
          type: "energy",
          title: "Energy Generated",
          description: "Generated 150 kWh of renewable energy",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          icon: Zap,
          color: "text-primary",
        },
        {
          id: "4",
          type: "reward",
          title: "Reward Earned",
          description: "Earned 1000 ZABcoins for referral bonus",
          amount: 1000,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          icon: Coins,
          color: "text-yellow-500",
        },
        {
          id: "5",
          type: "prediction",
          title: "Prediction Completed",
          description: "Your energy generation prediction was accurate",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          icon: TrendingUp,
          color: "text-purple-500",
        },
        {
          id: "6",
          type: "certificate",
          title: "Certificate Earned",
          description: "Sustainability Certificate issued",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          icon: Award,
          color: "text-blue-500",
        },
      ];

      setRecentActivities(dummyActivities);

      /* 
      // REAL API CALL - Uncomment this when backend is ready
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/activity/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data.activities || []);
      }
      */
    } catch (error) {
      console.error("Failed to fetch recent activities:", error);
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const checkKYCStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // DUMMY API CALL FOR UI TESTING - Remove this when backend is ready
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate KYC status response
      // Change this to test different states: 'pending', 'approved', 'rejected', null
      const dummyKycStatus = {
        status: 'pending', // Change to 'approved' or 'rejected' to test different UI states
        submittedAt: new Date().toISOString(),
      };

      setKycStatus(dummyKycStatus.status);
      
      // Show notification if KYC is pending (first time after login)
      if (dummyKycStatus.status === 'pending' && !localStorage.getItem("kycNotificationShown")) {
        setShowKYCNotification(true);
        localStorage.setItem("kycNotificationShown", "true");
      }

      console.log("KYC Status (dummy):", dummyKycStatus.status);

      /* 
      // REAL API CALL - Uncomment this when backend is ready
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/kyc/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKycStatus(data.status);
        
        // Show notification if KYC is pending (first time after login)
        if (data.status === 'pending' && !localStorage.getItem("kycNotificationShown")) {
          setShowKYCNotification(true);
          localStorage.setItem("kycNotificationShown", "true");
        }
      }
      */
    } catch (error) {
      console.error("Failed to check KYC status:", error);
    }
  };

  const handleDismissNotification = () => {
    setShowKYCNotification(false);
  };

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
      clickable: false
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

          {/* KYC Notification */}
          {showKYCNotification && (
            <Alert className="glass-card border-primary/20 animate-slide-up">
              <Info className="h-4 w-4" />
              <AlertTitle>KYC Request Submitted</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Your KYC request has been sent to the admin for verification. You will be notified once your KYC is approved.
                </span>
                <button
                  onClick={handleDismissNotification}
                  className="ml-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertDescription>
            </Alert>
          )}

          {/* KYC Status Alert */}
          {kycStatus === 'pending' && !showKYCNotification && (
            <Alert className="glass-card border-yellow-500/20 animate-slide-up">
              <Info className="h-4 w-4 text-yellow-500" />
              <AlertTitle>KYC Verification Pending</AlertTitle>
              <AlertDescription>
                Your KYC verification is pending. Please wait for admin approval.
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === 'approved' && (
            <Alert className="glass-card border-green-500/20 animate-slide-up">
              <Info className="h-4 w-4 text-green-500" />
              <AlertTitle>KYC Verified</AlertTitle>
              <AlertDescription>
                Congratulations! Your KYC has been verified. You can now earn ZABcoins!
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === 'rejected' && (
            <Alert className="glass-card border-red-500/20 animate-slide-up">
              <Info className="h-4 w-4 text-red-500" />
              <AlertTitle>KYC Verification Rejected</AlertTitle>
              <AlertDescription>
                Your KYC verification was rejected. Please submit your KYC again with corrected information.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card 
                key={stat.title} 
                className={`glass-card animate-slide-up transition-transform ${stat.clickable ? 'cursor-pointer hover:scale-105' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
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

          {/* Recent Activity Section */}
          <Card className="glass-card animate-slide-up" style={{ animationDelay: "400ms" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest activities and achievements
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activities</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={`p-2 rounded-lg bg-background border ${activity.color} border-opacity-20`}>
                          <Icon className={`h-5 w-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-sm">{activity.title}</h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                          {activity.amount && (
                            <div className="mt-2">
                              <span className="text-sm font-bold text-yellow-500">
                                +{activity.amount.toLocaleString()} ZABcoins
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
