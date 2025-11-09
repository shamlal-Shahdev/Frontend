import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  XCircle, 
  FileCheck, 
  Zap, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard,
  TrendingUp,
  Award,
  Coins,
  BarChart3,
  Users,
  Shield,
  LogOut,
  Eye,
  RefreshCw
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
// import { adminApi } from "@/integration/admin.api"; // Uncomment when backend is ready

interface KYCSubmission {
  id: string;
  user_id: string;
  cnic_number: string;
  cnic_front_url: string;
  cnic_back_url: string;
  selfie_url: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    province: string;
    country: string;
    gender: string;
    dateOfBirth: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  totalRewards: number;
  certificatesCount: number;
  predictionsCount: number;
  joinedAt: string;
}

interface Reward {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  description: string;
}

interface Certificate {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  type: string;
  issuedAt: string;
  status: 'active' | 'expired';
}

interface Prediction {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  prediction: string;
  result: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

const AdminDashboard = () => {
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Dummy stats for overview
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingKYC: 0,
    totalRewards: 0,
    totalCertificates: 0,
    totalPredictions: 0,
    verifiedUsers: 0,
  });

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin");
    
    if (!token || !isAdmin) {
      navigate("/admin/login");
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchKYCSubmissions(),
        fetchUsers(),
        fetchRewards(),
        fetchCertificates(),
        fetchPredictions(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Update stats whenever data changes
    setStats({
      totalUsers: users.length || 25,
      pendingKYC: kycSubmissions.filter(k => k.status === 'pending').length,
      totalRewards: rewards.reduce((sum, r) => sum + (r.status === 'approved' ? r.amount : 0), 0) || 125000,
      totalCertificates: certificates.length || 48,
      totalPredictions: predictions.length || 32,
      verifiedUsers: users.filter(u => u.kycStatus === 'approved').length || 18,
    });
  }, [users, kycSubmissions, rewards, certificates, predictions]);

  const fetchKYCSubmissions = async () => {
    try {
      // DUMMY API CALL FOR UI TESTING
      await new Promise(resolve => setTimeout(resolve, 500));

      const dummySubmissions: KYCSubmission[] = [
        {
          id: "kyc-1",
          user_id: "user-1",
          cnic_number: "12345-1234567-1",
          cnic_front_url: "https://via.placeholder.com/400x250?text=CNIC+Front",
          cnic_back_url: "https://via.placeholder.com/400x250?text=CNIC+Back",
          selfie_url: "https://via.placeholder.com/400x400?text=Selfie",
          status: "pending",
          submitted_at: new Date().toISOString(),
          user: {
            id: "user-1",
            email: "john.doe@example.com",
            firstName: "John",
            lastName: "Doe",
            phone: "+92 300 1234567",
            city: "Karachi",
            province: "Sindh",
            country: "Pakistan",
            gender: "male",
            dateOfBirth: "1990-01-15",
          },
        },
        {
          id: "kyc-2",
          user_id: "user-2",
          cnic_number: "23456-2345678-2",
          cnic_front_url: "https://via.placeholder.com/400x250?text=CNIC+Front+2",
          cnic_back_url: "https://via.placeholder.com/400x250?text=CNIC+Back+2",
          selfie_url: "https://via.placeholder.com/400x400?text=Selfie+2",
          status: "pending",
          submitted_at: new Date(Date.now() - 86400000).toISOString(),
          user: {
            id: "user-2",
            email: "jane.smith@example.com",
            firstName: "Jane",
            lastName: "Smith",
            phone: "+92 301 2345678",
            city: "Lahore",
            province: "Punjab",
            country: "Pakistan",
            gender: "female",
            dateOfBirth: "1992-05-20",
          },
        },
      ];

      setKycSubmissions(dummySubmissions);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch KYC submissions",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      // DUMMY API CALL
      await new Promise(resolve => setTimeout(resolve, 300));

      const dummyUsers: User[] = [
        {
          id: "user-1",
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "+92 300 1234567",
          kycStatus: "approved",
          totalRewards: 15000,
          certificatesCount: 5,
          predictionsCount: 3,
          joinedAt: "2024-01-15",
        },
        {
          id: "user-2",
          email: "jane.smith@example.com",
          firstName: "Jane",
          lastName: "Smith",
          phone: "+92 301 2345678",
          kycStatus: "pending",
          totalRewards: 0,
          certificatesCount: 0,
          predictionsCount: 0,
          joinedAt: "2024-02-01",
        },
        {
          id: "user-3",
          email: "ali.khan@example.com",
          firstName: "Ali",
          lastName: "Khan",
          phone: "+92 302 3456789",
          kycStatus: "approved",
          totalRewards: 8500,
          certificatesCount: 3,
          predictionsCount: 2,
          joinedAt: "2024-01-20",
        },
      ];

      setUsers(dummyUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchRewards = async () => {
    try {
      // DUMMY API CALL
      await new Promise(resolve => setTimeout(resolve, 300));

      const dummyRewards: Reward[] = [
        {
          id: "reward-1",
          userId: "user-1",
          user: { firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
          amount: 5000,
          type: "Energy Generation",
          status: "approved",
          createdAt: new Date().toISOString(),
          description: "Reward for 100 kWh energy generated",
        },
        {
          id: "reward-2",
          userId: "user-3",
          user: { firstName: "Ali", lastName: "Khan", email: "ali.khan@example.com" },
          amount: 3500,
          type: "Energy Generation",
          status: "pending",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          description: "Reward for 70 kWh energy generated",
        },
        {
          id: "reward-3",
          userId: "user-1",
          user: { firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
          amount: 10000,
          type: "Referral Bonus",
          status: "approved",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          description: "Referral bonus for 2 new users",
        },
      ];

      setRewards(dummyRewards);
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
    }
  };

  const fetchCertificates = async () => {
    try {
      // DUMMY API CALL
      await new Promise(resolve => setTimeout(resolve, 300));

      const dummyCertificates: Certificate[] = [
        {
          id: "cert-1",
          userId: "user-1",
          user: { firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
          type: "Carbon Offset",
          issuedAt: new Date().toISOString(),
          status: "active",
        },
        {
          id: "cert-2",
          userId: "user-3",
          user: { firstName: "Ali", lastName: "Khan", email: "ali.khan@example.com" },
          type: "Energy Generation",
          issuedAt: new Date(Date.now() - 86400000).toISOString(),
          status: "active",
        },
        {
          id: "cert-3",
          userId: "user-1",
          user: { firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
          type: "Sustainability",
          issuedAt: new Date(Date.now() - 172800000).toISOString(),
          status: "active",
        },
      ];

      setCertificates(dummyCertificates);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    }
  };

  const fetchPredictions = async () => {
    try {
      // DUMMY API CALL
      await new Promise(resolve => setTimeout(resolve, 300));

      const dummyPredictions: Prediction[] = [
        {
          id: "pred-1",
          userId: "user-1",
          user: { firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
          prediction: "Energy generation will increase by 15% next month",
          result: "Actual increase: 18%",
          status: "completed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "pred-2",
          userId: "user-3",
          user: { firstName: "Ali", lastName: "Khan", email: "ali.khan@example.com" },
          prediction: "Carbon offset will reach 500 kg",
          result: "",
          status: "pending",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      setPredictions(dummyPredictions);
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    }
  };

  const handleKYCReview = async (submissionId: string, status: "approved" | "rejected") => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setKycSubmissions(prev => prev.filter(sub => sub.id !== submissionId));

      toast({
        title: "Success!",
        description: `KYC ${status === "approved" ? "approved" : "rejected"} successfully. ${status === "approved" ? "User has been notified." : ""}`,
      });
      
      setRejectionReason(prev => {
        const newState = { ...prev };
        delete newState[submissionId];
        return newState;
      });

      // Refresh data
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to review KYC",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewardReview = async (rewardId: string, status: "approved" | "rejected") => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      setRewards(prev => prev.map(r => 
        r.id === rewardId ? { ...r, status } : r
      ));

      toast({
        title: "Success!",
        description: `Reward ${status === "approved" ? "approved" : "rejected"} successfully.`,
      });

      // Refresh data
      fetchRewards();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to review reward",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all data from localStorage
    localStorage.clear(); // Clear all localStorage items
    
    // Alternative: Clear specific items only
    // localStorage.removeItem("token");
    // localStorage.removeItem("isAdmin");
    // localStorage.removeItem("kycNotificationShown");
    // localStorage.removeItem("showKYCNotification");
    
    navigate("/admin/login");
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      approved: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
      active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
    };

    return (
      <Badge className={variants[status] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight gradient-text">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage users, rewards, KYC, certificates, and predictions
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchDashboardData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="glass-card animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.verifiedUsers} verified
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending KYC</CardTitle>
              <Shield className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{stats.pendingKYC}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Rewards</CardTitle>
              <Coins className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRewards.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ZABcoins distributed
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up" style={{ animationDelay: "300ms" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Certificates</CardTitle>
              <Award className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCertificates}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Certificates issued
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up" style={{ animationDelay: "400ms" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Predictions</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPredictions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active predictions
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up" style={{ animationDelay: "500ms" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified Users</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.verifiedUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                KYC approved users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="kyc">
              <Shield className="h-4 w-4 mr-2" />
              KYC
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Coins className="h-4 w-4 mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="h-4 w-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="predictions">
              <TrendingUp className="h-4 w-4 mr-2" />
              Predictions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest user activities and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">New user registered</p>
                        <p className="text-sm text-muted-foreground">Jane Smith joined the platform</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Reward distributed</p>
                        <p className="text-sm text-muted-foreground">5,000 ZABcoins to John Doe</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">5 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Certificate issued</p>
                        <p className="text-sm text-muted-foreground">Carbon Offset certificate to Ali Khan</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage all registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        {getStatusBadge(user.kycStatus)}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("users")}>
                    <Users className="h-4 w-4 mr-2" />
                    View All Users
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Pending Actions</CardTitle>
                  <CardDescription>Items requiring your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-500/5">
                      <div>
                        <p className="font-medium">Pending KYC Reviews</p>
                        <p className="text-sm text-muted-foreground">{stats.pendingKYC} submissions</p>
                      </div>
                      <Button size="sm" onClick={() => setActiveTab("kyc")}>
                        Review
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-500/5">
                      <div>
                        <p className="font-medium">Pending Reward Approvals</p>
                        <p className="text-sm text-muted-foreground">{rewards.filter(r => r.status === 'pending').length} rewards</p>
                      </div>
                      <Button size="sm" onClick={() => setActiveTab("rewards")}>
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {users.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No users found
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id} className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {user.firstName} {user.lastName}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {user.phone}
                            </span>
                          </CardDescription>
                        </div>
                        {getStatusBadge(user.kycStatus)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Rewards</p>
                          <p className="text-2xl font-bold text-yellow-500">{user.totalRewards.toLocaleString()} ZABcoins</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Certificates</p>
                          <p className="text-2xl font-bold">{user.certificatesCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Predictions</p>
                          <p className="text-2xl font-bold">{user.predictionsCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Joined</p>
                          <p className="font-medium">{new Date(user.joinedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Activity
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* KYC Tab */}
          <TabsContent value="kyc" className="space-y-4">
            {isLoading && kycSubmissions.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading KYC submissions...
                </CardContent>
              </Card>
            ) : kycSubmissions.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending KYC submissions
                </CardContent>
              </Card>
            ) : (
              kycSubmissions.map((submission) => (
                <Card key={submission.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {submission.user.firstName} {submission.user.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {submission.user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {submission.user.phone}
                          </span>
                        </CardDescription>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* User Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Date of Birth
                        </p>
                        <p className="font-medium">{new Date(submission.user.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Gender
                        </p>
                        <p className="font-medium capitalize">{submission.user.gender}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          City
                        </p>
                        <p className="font-medium">{submission.user.city}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Province
                        </p>
                        <p className="font-medium">{submission.user.province}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Country
                        </p>
                        <p className="font-medium">{submission.user.country}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          CNIC Number
                        </p>
                        <p className="font-medium">{submission.cnic_number}</p>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">CNIC Front</p>
                          <div className="border rounded-lg overflow-hidden">
                            <a 
                              href={submission.cnic_front_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={submission.cnic_front_url}
                                alt="CNIC Front"
                                className="w-full h-48 object-cover hover:opacity-80 transition-opacity cursor-pointer"
                              />
                            </a>
                          </div>
                          <a 
                            href={submission.cnic_front_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View Full Image
                          </a>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">CNIC Back</p>
                          <div className="border rounded-lg overflow-hidden">
                            <a 
                              href={submission.cnic_back_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={submission.cnic_back_url}
                                alt="CNIC Back"
                                className="w-full h-48 object-cover hover:opacity-80 transition-opacity cursor-pointer"
                              />
                            </a>
                          </div>
                          <a 
                            href={submission.cnic_back_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View Full Image
                          </a>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Selfie</p>
                          <div className="border rounded-lg overflow-hidden">
                            <a 
                              href={submission.selfie_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={submission.selfie_url}
                                alt="Selfie"
                                className="w-full h-48 object-cover hover:opacity-80 transition-opacity cursor-pointer"
                              />
                            </a>
                          </div>
                          <a 
                            href={submission.selfie_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View Full Image
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rejection Reason (if applicable)</label>
                      <Textarea
                        value={rejectionReason[submission.id] || ""}
                        onChange={(e) => setRejectionReason(prev => ({
                          ...prev,
                          [submission.id]: e.target.value
                        }))}
                        placeholder="Enter reason for rejection..."
                        rows={3}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                        onClick={() => handleKYCReview(submission.id, "approved")}
                        disabled={isLoading}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                        onClick={() => handleKYCReview(submission.id, "rejected")}
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4">
            {rewards.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No rewards found
                </CardContent>
              </Card>
            ) : (
              rewards.map((reward) => (
                <Card key={reward.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Coins className="h-5 w-5 text-yellow-500" />
                          {reward.user.firstName} {reward.user.lastName}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {reward.user.email} • {reward.type}
                        </CardDescription>
                      </div>
                      {getStatusBadge(reward.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-2xl font-bold text-yellow-500">{reward.amount.toLocaleString()} ZABcoins</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="font-medium">{reward.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created At</p>
                        <p className="font-medium">{new Date(reward.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {reward.status === 'pending' && (
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                          onClick={() => handleRewardReview(reward.id, "approved")}
                          disabled={isLoading}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve Reward
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                          onClick={() => handleRewardReview(reward.id, "rejected")}
                          disabled={isLoading}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Reward
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-4">
            {certificates.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No certificates found
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((certificate) => (
                  <Card key={certificate.id} className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-blue-500" />
                          {certificate.type}
                        </CardTitle>
                        {getStatusBadge(certificate.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">User</p>
                          <p className="font-medium">{certificate.user.firstName} {certificate.user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{certificate.user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Issued At</p>
                          <p className="font-medium">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Certificate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            {predictions.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No predictions found
                </CardContent>
              </Card>
            ) : (
              predictions.map((prediction) => (
                <Card key={prediction.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-purple-500" />
                          {prediction.user.firstName} {prediction.user.lastName}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {prediction.user.email}
                        </CardDescription>
                      </div>
                      {getStatusBadge(prediction.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Prediction</p>
                      <p className="font-medium">{prediction.prediction}</p>
                    </div>
                    {prediction.result && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Result</p>
                        <p className="font-medium text-green-500">{prediction.result}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created: {new Date(prediction.createdAt).toLocaleDateString()}</span>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
