import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { vendorApi } from '@/api/vendor.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Zap } from 'lucide-react';

export const VendorLogin = () => {
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
    setError('');
    setLoading(true);

    try {
      const response = await vendorApi.login(formData);
      
      if (response.user.role !== 'vendor') {
        setError('Vendor access required');
        setLoading(false);
        return;
      }

      if (!response.user.isVerified) {
        setError('Email not verified. Please check your email.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id.toString());
      localStorage.setItem('userRole', response.user.role);
      navigate('/vendor/dashboard');
    } catch (err: any) {
      let errorMessage = 'Invalid credentials. Please check your email and password.';
      
      // Check for error in different response formats
      if (err.response?.data) {
        // Check for errors.email (InvalidCredentialsException format)
        if (err.response.data.errors?.email) {
          const emailError = err.response.data.errors.email;
          if (emailError.toLowerCase().includes('invalid') || 
              emailError.toLowerCase().includes('password') ||
              emailError.toLowerCase().includes('credentials')) {
            errorMessage = 'Invalid credentials. Please check your email and password.';
          } else {
            errorMessage = emailError;
          }
        }
        // Check for direct message field
        else if (err.response.data.message) {
          const msg = err.response.data.message;
          // Check for specific error types and provide user-friendly messages
          if (msg.includes('not registered') || msg.includes('register first')) {
            errorMessage = 'This email is not registered as a vendor. Please register first.';
          } else if (msg.includes('Invalid credentials') || 
                    msg.includes('invalid password') || 
                    msg.includes('Invalid email or password') ||
                    msg.toLowerCase().includes('credentials')) {
            errorMessage = 'Invalid credentials. Please check your email and password.';
          } else if (msg.includes('not verified') || msg.includes('verify')) {
            errorMessage = 'Please verify your email before logging in.';
          } else if (msg.includes('Vendor role required') || msg.includes('Access denied')) {
            errorMessage = 'Access denied. Vendor role required.';
          } else {
            errorMessage = msg;
          }
        }
        // Check for error string directly
        else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        // Handle generic error messages
        if (err.message.includes('Invalid') || err.message.includes('credentials')) {
          errorMessage = 'Invalid credentials. Please check your email and password.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600 mb-2">
            WattsUp Energy
          </h1>
          <p className="text-xl font-medium text-orange-600">
            Vendor Login
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="pt-8 pb-6 px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Vendor</h2>
              <p className="text-gray-500">Sign in to your vendor account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
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
                  className="h-12 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
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
                    className="h-12 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-500 pr-10"
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
                <Link to="/vendor/register" className="font-medium text-orange-600 hover:text-orange-700 hover:underline">
                  New vendor? Sign Up
                </Link>
                <Link to="/vendor/forgot-password" className="font-medium text-orange-600 hover:text-orange-700 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-base shadow-lg shadow-orange-500/30 transition-all duration-200" 
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


