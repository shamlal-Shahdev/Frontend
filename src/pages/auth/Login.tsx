import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Zap } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 Form submitted!', formData);
    
    // Clear previous errors
    setError('');
    setLoading(true);

    try {
      console.log('🔵 Calling login API...');
      const response = await authApi.login(formData);
      console.log('✅ Login response:', response);
      
      // Safety check: Block admin users from using user login
      if (response.user.role === 'admin' || response.user.role === 'ADMIN') {
        console.log('❌ Admin user attempted to login through user endpoint');
        setError('Admin users must use the admin login page. Redirecting...');
        setLoading(false);
        // Redirect to admin login after a short delay
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
        return;
      }

      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id.toString());
      localStorage.setItem('userRole', response.user.role);

      if (!response.user.isVerified) {
        console.log('❌ Email not verified');
        setError('Email not verified. Please check your email.');
        setLoading(false);
        return;
      }

      // Handle KYC status routing
      const kycStatus = response.user.kycStatus?.toLowerCase();
      
      if (kycStatus === 'approved') {
        console.log('➡️ Redirecting to dashboard');
        navigate('/dashboard');
      } else if (!kycStatus || kycStatus === '' || kycStatus === 'pending' || kycStatus === 'not_submitted') {
        console.log('➡️ Redirecting to KYC submission page');
        navigate('/kyc/info');
      } else {
        console.log('➡️ Redirecting to KYC status page');
        navigate('/kyc-status');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response);
      
      // Extract error message from different possible locations
      let message = 'Login failed. Please try again.';
      
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      
      console.log('❌ Setting error message:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 mb-2">
            WattsUp Energy
          </h1>
          <p className="text-xl font-medium text-emerald-600">
            Power Up. Earn Up.
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="pt-8 pb-6 px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome</h2>
              <p className="text-gray-500">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <div className="mb-2">{error}</div>
                  {error.toLowerCase().includes('admin') && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <Link 
                        to="/admin/login" 
                        className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        → Go to Admin Login Page
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (error) setError('');
                  }}
                  placeholder="Enter Your Email"
                  className="h-12 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (error) setError('');
                    }}
                    placeholder="Enter Your Password"
                    className="h-12 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                  New here? Sign Up
                </Link>
                <Link to="/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-base shadow-lg shadow-emerald-500/30 transition-all duration-200" 
                disabled={loading || !formData.email || !formData.password}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};



