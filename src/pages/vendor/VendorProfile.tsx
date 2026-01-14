import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios.config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  Shield,
  ArrowLeft,
  CheckCircle,
  Zap,
  Building2
} from 'lucide-react';

interface VendorProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const VendorProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<VendorProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/vendor/login');
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
            <Zap className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/vendor/dashboard')}>
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
          <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-500 mt-1">View your vendor account information</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 text-red-700">{error}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-xl text-gray-900">{profile?.companyName || profile?.name}</p>
                <p className="text-sm text-gray-500">Vendor Account</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4" />
                  Company Name
                </label>
                <p className="text-lg font-medium text-gray-900">{profile?.companyName || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Contact Name
                </label>
                <p className="text-lg font-medium text-gray-900">{profile?.name || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-lg font-medium text-gray-900">{profile?.email || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <p className="text-lg font-medium text-gray-900">{profile?.phone || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" />
                  Account Status
                </label>
                <div className="flex items-center gap-2">
                  {profile?.isVerified ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">Verified</span>
                    </>
                  ) : (
                    <span className="text-yellow-600 font-medium">Not Verified</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 mb-2 block">Member Since</label>
                <p className="text-lg font-medium text-gray-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

