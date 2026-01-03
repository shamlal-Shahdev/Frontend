import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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

          {/* Success Card */}
          <Card className="shadow-xl border-0">
            <CardContent className="pt-8 pb-6 px-8">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
                <p className="text-gray-600">
                  A password reset link has been sent to <span className="font-semibold text-gray-800">{email}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm">
                  Click the link in the email to reset your password.
                </div>
                
                <Link to="/login">
                  <Button className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-base shadow-lg shadow-emerald-500/30">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

        {/* Forgot Password Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="pt-8 pb-6 px-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Forgot Password</h2>
              <p className="text-gray-500">Enter your email to receive a reset link</p>
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter Your Email"
                  className="h-12 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-base shadow-lg shadow-emerald-500/30 transition-all duration-200" 
                disabled={loading || !email}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : 'Send Reset Link'}
              </Button>

              <Link to="/login" className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-800 pt-2">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};



