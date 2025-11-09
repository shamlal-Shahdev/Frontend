import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/integration/api";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);

    try {
      // REAL API CALL - Login with backend
      const response = await authApi.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Store the token in localStorage
      localStorage.setItem("token", response.token);
      
      // Check KYC status and show notification (only if not shown before)
      try {
        const kycStatusResponse = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/kyc/status`, {
          headers: {
            'Authorization': `Bearer ${response.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (kycStatusResponse.ok) {
          const kycStatus = await kycStatusResponse.json();
          // Only show notification if KYC is pending and notification hasn't been shown before
          if (kycStatus.status === 'pending' && !localStorage.getItem("kycNotificationShown")) {
            // Store flag to show notification on dashboard
            localStorage.setItem("showKYCNotification", "true");
          }
        }
      } catch (error) {
        // KYC status check failed, but login was successful, so continue
        console.error("Failed to check KYC status:", error);
      }
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle different error types
      let errorMessage = "Invalid email or password";
      const isUnverified = error?.isUnverified || error?.status === 401;
      const isUserNotFound = error?.message?.includes('not registered') || 
                            error?.message?.includes('register first');
      
      if (isUserNotFound) {
        errorMessage = error.message || "This email is not registered. Please register first to create an account.";
        setError(errorMessage);
        toast({
          title: "User Not Found",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (isUnverified) {
        errorMessage = error.message || "Please verify your email before logging in";
        setError(errorMessage);
        toast({
          title: "Email Not Verified",
          description: errorMessage + ". Please check your email and click the verification link.",
          variant: "destructive",
        });
      } else {
        errorMessage = error.message || "Invalid email or password";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent energy-glow mb-4">
            <Zap className="h-9 w-9 text-white" />
          </Link>
          <h1 className="text-3xl font-bold gradient-text">WattsUp Energy</h1>
          <p className="text-xl font-bold gradient-text">Power Up. Earn Up.</p>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant={
                    error.includes('verify') || error.includes('verified') ? 'default' : 
                    error.includes('not registered') || error.includes('register first') ? 'default' :
                    'destructive'
                  }>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">{error}</div>
                      
                      {/* Unverified user message */}
                      {(error.includes('verify') || error.includes('verified')) && (
                        <div className="mt-2 text-sm space-y-1">
                          <p>Didn't receive the email? Check your spam folder.</p>
                          <p>
                            Need help?{' '}
                            <Link 
                              to="/register" 
                              className="text-blue-600 hover:underline font-medium"
                            >
                              Register again
                            </Link>
                          </p>
                        </div>
                      )}
                      
                      {/* User not registered message */}
                      {(error.includes('not registered') || error.includes('register first')) && (
                        <div className="mt-2 text-sm space-y-1">
                          <p>Don't have an account yet?</p>
                          <div className="flex gap-2">
                            <Link 
                              to="/register" 
                              className="text-blue-600 hover:underline font-medium"
                            >
                              Register Now
                            </Link>
                            <span>or</span>
                            <Link 
                              to="/kyc-signup" 
                              className="text-blue-600 hover:underline font-medium"
                            >
                              Register with KYC
                            </Link>
                          </div>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter Your Email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                    disabled={isLoading}
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
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Link
                    to="/kyc-signup"
                    className="text-sm text-primary hover:underline"
                  >
                    New here? Sign Up
                  </Link>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
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

export default Auth;
