import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios.config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
const logoUrl = '/Assets/logo.png';
import { 
  User, 
  Mail, 
  Phone, 
  Shield,
  ArrowLeft,
  CheckCircle,
  Zap,
  Building2,
  Edit,
  Save,
  X
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
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    companyName: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        companyName: response.data.companyName || ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      companyName: profile?.companyName || ''
    });
    setError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only +92 followed by 10 digits
    if (value.startsWith('+92')) {
      const digits = value.slice(3).replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: `+92${digits}` });
    } else {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: digits ? `+92${digits}` : '' });
    }
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (formData.phone && !formData.phone.match(/^\+92\d{10}$/)) {
      setError('Phone must be in format +92 followed by 10 digits');
      return;
    }

    setUpdating(true);

    try {
      const response = await api.patch('/auth/me', {
        name: formData.name,
        phone: formData.phone || null,
        companyName: formData.companyName || null
      });
      
      setProfile(response.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
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
          <div className="flex items-center gap-3">
          <img src={logoUrl} alt="WattsUp Energy" className="h-12 w-12 rounded-md bg-white/20 p-1" />
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

        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4 text-green-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Profile Information</CardTitle>
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button onClick={handleUpdate} disabled={updating} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    {updating ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
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
                {isEditing ? (
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter company name"
                    className="h-12"
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900">{profile?.companyName || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Contact Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="h-12"
                    required
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900">{profile?.name || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  Email {profile?.isVerified && <span className="text-xs text-green-600">(Verified)</span>}
                </label>
                <p className="text-lg font-medium text-gray-900">{profile?.email || 'N/A'}</p>
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="+923001234567"
                    className="h-12"
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900">{profile?.phone || 'N/A'}</p>
                )}
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

