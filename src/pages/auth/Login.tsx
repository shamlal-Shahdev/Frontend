import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/auth.context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      await login(data);
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      const isUnverified = err?.isUnverified || err?.status === 401;
      const isUserNotFound = errorMessage.includes('not registered') || 
                            errorMessage.includes('register first') ||
                            errorMessage.includes('User not found');
      
      if (isUnverified) {
        // User is not verified
        const message = errorMessage || 'Please verify your email before logging in';
        setError(message);
        toast.error(message, {
          description: 'Please check your email and click the verification link to activate your account.',
          duration: 5000,
        });
      } else if (isUserNotFound) {
        // User not found - need to register
        const message = errorMessage || 'This email is not registered. Please register first.';
        setError(message);
        toast.error(message, {
          description: 'Please create an account first by registering.',
          duration: 5000,
        });
      } else {
        // Other errors (invalid password, etc.)
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              W
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your WattsUp Energy account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
                          to="/register-kyc" 
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
                placeholder="john@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                })}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

