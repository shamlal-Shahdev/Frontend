import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Eye, EyeOff, CheckCircle } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // Validation function for email format
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'Email is required';
    }
    // Comprehensive email regex pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g., example@domain.com)';
    }
    return null;
  };

  // Validation function for password strength
  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one digit';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  // Handle first name input - only letters and spaces
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, spaces, hyphens, and apostrophes
    if (value === '' || /^[a-zA-Z\s'-]*$/.test(value)) {
      setFormData({ ...formData, firstName: value });
      if (error) setError('');
    }
  };

  // Handle last name input - only letters and spaces
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, spaces, hyphens, and apostrophes
    if (value === '' || /^[a-zA-Z\s'-]*$/.test(value)) {
      setFormData({ ...formData, lastName: value });
      if (error) setError('');
    }
  };

  // Handle phone input - only digits, max 10 characters (after +92 prefix)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove any non-digit characters and limit to 10 digits (Pakistani mobile numbers)
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: digitsOnly });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate email format
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    // Validate password strength
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate phone number length (should be 10 digits after +92)
    if (formData.phone.length < 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);

    try {
      // Exclude confirmPassword from the request and add +92 prefix to phone
      const { confirmPassword, ...registerData } = formData;
      registerData.phone = `+92${registerData.phone}`;
      await authApi.register(registerData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      // Backend sends error in errors.email format for email already exists
      const errorMessage = err.response?.data?.errors?.email 
        || err.response?.data?.message 
        || 'Registration failed. Please try again.';
      
      // Transform email already exists message to be more user-friendly
      const finalMessage = errorMessage.toLowerCase().includes('already exists') || 
                          errorMessage.toLowerCase().includes('email already')
        ? 'This email is already registered. Please use a different email or try logging in.'
        : errorMessage;
      
      setError(finalMessage);
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
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
                <p className="text-gray-600">
                  Please check your email <span className="font-semibold text-gray-800">{formData.email}</span> for verification.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm text-center">
                  Redirecting to login page...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-lg">
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

        {/* Register Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="pt-8 pb-6 px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>
              <p className="text-gray-500">Enter your details to register</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <Input
                    required
                    value={formData.firstName}
                    onChange={handleFirstNameChange}
                    placeholder="First Name"
                    className="h-12 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <Input
                    required
                    value={formData.lastName}
                    onChange={handleLastNameChange}
                    placeholder="Last Name"
                    className="h-12 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

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
                  placeholder="example@domain.com"
                  className={`h-12 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                    formData.email && validateEmail(formData.email) 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : ''
                  }`}
                />
                {formData.email && validateEmail(formData.email) && (
                  <p className="text-xs text-red-500 mt-1">
                    {validateEmail(formData.email)}
                  </p>
                )}
                {formData.email && !validateEmail(formData.email) && (
                  <p className="text-xs text-gray-500 mt-1">
                    Valid email format required (e.g., user@example.com)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <div className="flex">
                  <div className="flex items-center justify-center px-4 h-12 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 font-semibold select-none cursor-not-allowed">
                    +92
                  </div>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="3001234567"
                    maxLength={10}
                    className="h-12 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-l-none rounded-r-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
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
                <p className="text-xs text-gray-500 mt-1">
                  Must contain: uppercase, lowercase, digit, and special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (error) setError('');
                    }}
                    placeholder="Confirm Your Password"
                    className="h-12 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>


              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-base shadow-lg shadow-emerald-500/30 transition-all duration-200 mt-6" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : 'Register'}
              </Button>

              <p className="text-center text-sm text-gray-600 pt-2">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};





