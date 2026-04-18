import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { vendorApi } from '@/api/vendor.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
const logoUrl = '/Assets/logo.png';
export const VendorEmailVerificationSent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  if (!email) {
    navigate('/vendor/register');
    return null;
  }
  const handleResendEmail = async () => {
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await vendorApi.resendVerificationEmail({ email });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend email. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        {}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logoUrl} alt="WattsUp Energy" className="w-28 h-28" />
          </div>
          <p className="text-xl font-medium text-emerald-600">
            Power Up. Earn Up.
          </p>
        </div>
        {}
        <Card className="shadow-xl border-0">
          <CardContent className="pt-8 pb-8 px-8">
            {}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Check Your Email</h2>
              <p className="text-gray-600 mb-3">
                We've sent a verification link to
              </p>
              <p className="font-semibold text-emerald-600 text-lg mb-4">{email}</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Click the link in the email to verify your vendor account and get started.
              </p>
            </div>
            {/* Success Message */}
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Verification email sent successfully!</span>
              </div>
            )}
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            {/* Resend Email Section */}
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 px-5 py-5 rounded-lg">
                <p className="text-sm text-gray-700 text-center mb-4 font-medium">
                  Didn't receive the email?
                </p>
                <p className="text-xs text-gray-500 text-center mb-4">
                  Check your spam folder or click below to resend
                </p>
                <Button
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5" />
                      Resend Verification Email
                    </span>
                  )}
                </Button>
              </div>
              {}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Already verified?{' '}
                  <Link to="/vendor/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact support at{' '}
            <a href="mailto:support@wattsup.com" className="text-emerald-600 hover:underline">
              support@wattsup.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
