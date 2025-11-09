import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // DUMMY API CALL FOR UI TESTING - Remove this when backend is ready
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate successful admin login
      // Accept any email/password for testing
      const dummyToken = "dummy-admin-token-" + Date.now();
      const dummyAdmin = {
        id: "admin-123",
        email: formData.email,
        role: "admin",
      };

      // Store the token in localStorage
      localStorage.setItem("token", dummyToken);
      localStorage.setItem("isAdmin", "true");
      
      console.log("Admin login successful (dummy):", {
        email: formData.email,
        token: dummyToken,
      });
      
      toast({
        title: "Success",
        description: "Admin logged in successfully",
      });
      
      navigate("/admin/dashboard");

      /* 
      // REAL API CALL - Uncomment this when backend is ready
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Admin login failed');
      }

      const data = await response.json();
      
      // Store the token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("isAdmin", "true");
      
      toast({
        title: "Success",
        description: "Admin logged in successfully",
      });
      
      navigate("/admin/dashboard");
      */
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent energy-glow mb-4">
            <Zap className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">WattsUp Energy</h1>
          <p className="text-xl font-bold gradient-text">Power Up. Earn Up.</p>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Sign in to your admin account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter Your Email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter Your Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10 bg-transparent border-0 p-0 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full energy-glow" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;

