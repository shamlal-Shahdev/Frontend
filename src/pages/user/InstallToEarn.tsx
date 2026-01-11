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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

export default function InstallToEarn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacityKw: '',
    vendorId: '',
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoadingVendors(true);
      const response = await vendorApi.getVendors(true); // Get only verified vendors
      setVendors(response.vendors || []);
    } catch (err: any) {
      console.error('Failed to load vendors', err);
      setError('Failed to load vendors. Please refresh the page.');
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

      // Show success message
      toast({
        title: 'Success!',
        description: 'Your request has been submitted. Our team will contact you.',
      });

      // Reset form
      setFormData({
        name: '',
        location: '',
        capacityKw: '',
        vendorId: '',
      });

      // Optionally navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
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
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name} ({vendor.email})
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
