import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '@/api/profile.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  Shield,
  ArrowLeft,
  CheckCircle,
  Zap
} from 'lucide-react';

export const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      console.log('Updating profile with data:', formData);
      const updated = await profileApi.updateProfile(formData);
      console.log('Profile updated successfully:', updated);
      setProfile(updated);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      console.error('Error response:', err.response);
      
      const errorMessage = err.response?.data?.message 
        || (Array.isArray(err.response?.data?.message) ? err.response.data.message.join(', ') : null)
        || err.message 
        || 'Failed to update profile';
      
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-500" />
            <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">View and update your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{profile?.name}</p>
                  <p className="text-sm text-gray-500">{profile?.role}</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Email Verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">KYC Approved</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-700">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Full Name
                  </label>
                  <Input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setError('');
                    }}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Verified - Cannot be changed
                    </span>
                  </label>
                  <Input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed as it is verified
                  </p>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    Phone Number
                    <span className="ml-auto text-xs text-gray-500">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      setError('');
                    }}
                    placeholder="+923001234567 or 03358235529"
                    minLength={3}
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional - Any format accepted (3-20 characters)
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={updating}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

