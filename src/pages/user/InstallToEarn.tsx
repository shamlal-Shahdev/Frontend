import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { installationApi } from '@/api/installation.api';
import { vendorApi } from '@/api/vendor.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, ArrowLeft, Package, Activity, Clock, XCircle } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
}

interface Installation {
  id: number;
  userId: number;
  name: string;
  installationType: string;
  capacityKw: number;
  location: string;
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'rejected';
  isActive: boolean;
  registeredAt: string;
  verifiedAt?: string | null;
  vendorId?: number | null;
  rejectionReason?: string | null;
  adminRemark?: string | null;
  vendor?: {
    id: number;
    name: string;
    email: string;
    companyName?: string | null;
  } | null;
}

export default function InstallToEarn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [checkingInstallations, setCheckingInstallations] = useState(true);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [existingInstallation, setExistingInstallation] = useState<Installation | null>(null);
  const [showResubmitForm, setShowResubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacityKw: '',
    vendorId: '',
  });

  useEffect(() => {
    checkExistingInstallation();
    loadVendors();
  }, []);

  const checkExistingInstallation = async () => {
    try {
      setCheckingInstallations(true);
      const installations = await installationApi.getUserInstallations();
      if (installations && installations.length > 0) {
        // Get the most recent installation (first one in the array)
        const latest = installations[0];
        // Always set the installation, regardless of status
        setExistingInstallation(latest);
        // Reset resubmit form flag when checking
        setShowResubmitForm(false);
      } else {
        // No installations found, show form
        setExistingInstallation(null);
        setShowResubmitForm(false);
      }
    } catch (err: any) {
      console.error('Failed to check existing installations', err);
      // If error, just show the form
      setExistingInstallation(null);
      setShowResubmitForm(false);
    } finally {
      setCheckingInstallations(false);
    }
  };

  const loadVendors = async () => {
    try {
      setLoadingVendors(true);
      const response = await vendorApi.getVendors(true); // Get only verified vendors
      setVendors(response.vendors || []);
    } catch (err: any) {
      console.error('Failed to load vendors', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
      setError('Failed to load vendors. Please refresh the page.');
      }
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter installation name');
      setLoading(false);
      return;
    }

    if (!formData.location.trim()) {
      setError('Please enter installation location');
      setLoading(false);
      return;
    }

    const capacity = parseFloat(formData.capacityKw);
    if (!formData.capacityKw || isNaN(capacity) || capacity <= 0) {
      setError('Please enter a valid solar capacity (greater than 0)');
      setLoading(false);
      return;
    }

    if (!formData.vendorId) {
      setError('Please select a vendor');
      setLoading(false);
      return;
    }

    try {
      await installationApi.submit({
        name: formData.name.trim(),
        location: formData.location.trim(),
        capacityKw: capacity,
        installationType: 'rooftop_solar',
        vendorId: parseInt(formData.vendorId, 10),
      });

      toast({
        title: 'Success!',
        description: 'Your request has been submitted successfully.',
      });

      // Refresh installation status after successful submission
      await checkExistingInstallation();
    } catch (err: any) {
      console.error('Installation submission error:', err);
      const errorMessage =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.message)
          ? err.response.data.message.join(', ')
          : null) ||
        err.message ||
        'Failed to submit installation request. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Activity className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'assigned':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Assigned
          </Badge>
        );
      case 'submitted':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Package className="w-3 h-3 mr-1" />
            Submitted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading state while checking for existing installations
  if (checkingInstallations) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </nav>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-lg">Checking installation status...</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show rejected status with resubmit option if installation is rejected and form not requested
  if (existingInstallation && existingInstallation.status === 'rejected' && !showResubmitForm) {
    const rejectionReason = existingInstallation.rejectionReason || existingInstallation.adminRemark || 'No reason provided';
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Installation Request Rejected</CardTitle>
                <CardDescription>
                  Your installation request has been rejected. Please review the reason and resubmit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Installation Name</Label>
                    <p className="mt-1 font-medium">{existingInstallation.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Status</Label>
                    <div className="mt-1">{getStatusBadge(existingInstallation.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Capacity</Label>
                    <p className="mt-1">{existingInstallation.capacityKw} kW</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Submitted On</Label>
                    <p className="mt-1 text-sm">{formatDate(existingInstallation.registeredAt)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Location</Label>
                  <p className="mt-1">{existingInstallation.location}</p>
                </div>
                
                {/* Rejection Reason */}
                <div className="pt-4 border-t">
                  <Label className="text-sm font-semibold text-gray-500">Rejection Reason</Label>
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="mt-2">
                      {rejectionReason}
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setShowResubmitForm(true)}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Resubmit Installation Request
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/installation-status')}
                  >
                    View All Installations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show status if installation exists and is submitted (not rejected)
  if (existingInstallation && existingInstallation.status !== 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Installation Status</CardTitle>
                <CardDescription>
                  Your installation request has been submitted. Track its progress here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Installation Name</Label>
                    <p className="mt-1 font-medium">{existingInstallation.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Status</Label>
                    <div className="mt-1">{getStatusBadge(existingInstallation.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Capacity</Label>
                    <p className="mt-1">{existingInstallation.capacityKw} kW</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Submitted On</Label>
                    <p className="mt-1 text-sm">{formatDate(existingInstallation.registeredAt)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Location</Label>
                  <p className="mt-1">{existingInstallation.location}</p>
                </div>
                {existingInstallation.vendor && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Assigned Vendor</Label>
                    <p className="mt-1">{existingInstallation.vendor.companyName || existingInstallation.vendor.name}</p>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/installation-status')}
                  >
                    View All Installations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show form if no installation exists OR if rejected and resubmit button was clicked
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Install to Earn - Solar Installation Request</CardTitle>
              <CardDescription>
                Fill out the form below to request a solar installation. Our team will contact you soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Installation Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., My Home Solar System"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setError('');
                    }}
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">
                    Give your installation a name for identification
                  </p>
                </div>

                {/* Location Field */}
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Installation Location/Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="location"
                    placeholder="Enter complete address where solar installation is needed"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      setError('');
                    }}
                    required
                    rows={3}
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">
                    Provide the complete address for the installation site
                  </p>
                </div>

                {/* Solar Capacity Field */}
                <div className="space-y-2">
                  <Label htmlFor="capacityKw">
                    Solar Capacity Required (kWh) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="capacityKw"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 50.5"
                    value={formData.capacityKw}
                    onChange={(e) => {
                      setFormData({ ...formData, capacityKw: e.target.value });
                      setError('');
                    }}
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">
                    Enter the required solar capacity in kilowatt-hours (kWh)
                  </p>
                </div>

                {/* Vendor Selection Field */}
                <div className="space-y-2">
                  <Label htmlFor="vendorId">
                    Select Vendor <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.vendorId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, vendorId: value });
                      setError('');
                    }}
                    disabled={loading || loadingVendors || vendors.length === 0}
                  >
                    <SelectTrigger id="vendorId">
                      <SelectValue placeholder={loadingVendors ? 'Loading vendors...' : vendors.length === 0 ? 'No verified vendors available' : 'Select a vendor'} />
                    </SelectTrigger>
                    {vendors.length > 0 && (
                    <SelectContent>
                        {                        vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.companyName || vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      )}
                  </Select>
                  <p className="text-sm text-gray-500">
                    {vendors.length === 0 && !loadingVendors
                      ? 'No verified vendors available. Please contact support.'
                      : 'Select a verified vendor for your installation'}
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <span className="mr-2">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Installation Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Your request will be reviewed by our team</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>We will contact you to discuss your requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Your selected vendor will receive the installation request</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>You will be notified about the installation progress</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
