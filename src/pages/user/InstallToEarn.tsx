import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { installationApi, type PropertySegment } from '@/api/installation.api';
import {
  USER_PROPERTY_TYPE_OPTIONS,
  getBoundsForSegment,
  installPropertyTypeLabel,
  normalizeInstallPropertySegment,
  type PropertySegmentValue,
} from '@/constants/propertySegments';
import {
  createInitialLoadRows,
  type LoadRowState,
} from '@/constants/loadCalculator';
import { vendorApi } from '@/api/vendor.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InstallationLocationPicker } from '@/components/installation/InstallationLocationPicker';
import { LoadCalculatorSection } from '@/components/installation/LoadCalculatorSection';
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
import {
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Package,
  Activity,
  Clock,
  XCircle,
  ChevronRight,
} from 'lucide-react';
const logoUrl = '/Assets/logo.png';
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
  propertySegment?: PropertySegment;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  rooftopAvailable?: boolean | null;
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
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [loadRows, setLoadRows] = useState<LoadRowState[]>(() => createInitialLoadRows());
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    capacityKw: '2',
    vendorId: '',
    propertySegment: 'residential_small' as PropertySegmentValue,
    rooftopAvailable: '' as '' | 'yes' | 'no',
  });
  useEffect(() => {
    checkExistingInstallation();
    loadVendors();
  }, []);
  useEffect(() => {
    if (
      showResubmitForm &&
      existingInstallation &&
      existingInstallation.status === 'rejected'
    ) {
      const seg = normalizeInstallPropertySegment(
        (existingInstallation.propertySegment || 'residential_small') as PropertySegmentValue,
      );
      const lat =
        existingInstallation.latitude != null
          ? Number(existingInstallation.latitude)
          : null;
      const lng =
        existingInstallation.longitude != null
          ? Number(existingInstallation.longitude)
          : null;
      setFormData({
        name: existingInstallation.name,
        location: existingInstallation.location,
        latitude: Number.isFinite(lat) ? lat : null,
        longitude: Number.isFinite(lng) ? lng : null,
        capacityKw: String(existingInstallation.capacityKw),
        vendorId:
          existingInstallation.vendorId != null
            ? String(existingInstallation.vendorId)
            : '',
        propertySegment: seg,
        rooftopAvailable:
          existingInstallation.rooftopAvailable === true
            ? 'yes'
            : existingInstallation.rooftopAvailable === false
              ? 'no'
              : '',
      });
      setLoadRows(createInitialLoadRows());
      setFormStep(1);
    }
  }, [showResubmitForm, existingInstallation]);
  const checkExistingInstallation = async () => {
    try {
      setCheckingInstallations(true);
      const installations = await installationApi.getUserInstallations();
      if (installations && installations.length > 0) {
        const latest = installations[0];
        setExistingInstallation(latest);
        setShowResubmitForm(false);
      } else {
        setExistingInstallation(null);
        setShowResubmitForm(false);
      }
    } catch (err: any) {
      console.error('Failed to check existing installations', err);
      setExistingInstallation(null);
      setShowResubmitForm(false);
    } finally {
      setCheckingInstallations(false);
    }
  };
  const loadVendors = async () => {
    try {
      setLoadingVendors(true);
      const response = await vendorApi.getVendors(true); 
      setVendors(response.vendors || []);
    } catch (err: any) {
      console.error('Failed to load vendors', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
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
  const validateStep1 = (): boolean => {
    if (!formData.name.trim()) {
      setError('Please enter installation name');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Please enter installation location');
      return false;
    }
    if (!formData.vendorId) {
      setError('Please select a vendor');
      return false;
    }
    if (formData.rooftopAvailable !== 'yes' && formData.rooftopAvailable !== 'no') {
      setError('Please select whether rooftop space is available (Yes / No)');
      return false;
    }
    return true;
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 1) {
      setError('');
      if (!validateStep1()) return;
      setFormStep(2);
      return;
    }
    void handleSubmit(e);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep !== 2) return;
    setError('');
    setLoading(true);
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
      setError('Please enter a valid system size in kW');
      setLoading(false);
      return;
    }
    const { minKw, maxKw } = getBoundsForSegment(formData.propertySegment);
    if (capacity < minKw || capacity > maxKw) {
      setError(
        `For this property type, system size must be between ${minKw} kW and ${maxKw} kW.`,
      );
      setLoading(false);
      return;
    }
    if (!formData.vendorId) {
      setError('Please select a vendor');
      setLoading(false);
      return;
    }
    if (formData.rooftopAvailable !== 'yes' && formData.rooftopAvailable !== 'no') {
      setError('Please go back and select whether rooftop space is available');
      setLoading(false);
      return;
    }
    try {
      const payload: Parameters<typeof installationApi.submit>[0] = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        capacityKw: capacity,
        propertySegment: formData.propertySegment as PropertySegment,
        installationType: 'rooftop_solar',
        vendorId: parseInt(formData.vendorId, 10),
        rooftopAvailable: formData.rooftopAvailable === 'yes',
      };
      if (
        formData.latitude != null &&
        formData.longitude != null &&
        Number.isFinite(formData.latitude) &&
        Number.isFinite(formData.longitude)
      ) {
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
      }
      await installationApi.submit(payload);
      toast({
        title: 'Success!',
        description: 'Your request has been submitted successfully.',
      });
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
  if (checkingInstallations) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="WattsUp Energy" className="h-14 w-14 rounded-md object-contain" />
              <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
            </div>
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
  if (existingInstallation && existingInstallation.status === 'rejected' && !showResubmitForm) {
    const rejectionReason = existingInstallation.rejectionReason || existingInstallation.adminRemark || 'No reason provided';
    return (
      <div className="min-h-screen bg-gray-50">
        {}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="WattsUp Energy" className="h-14 w-14 rounded-md object-contain" />
              <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
            </div>
          </div>
        </nav>
        {}
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
                  {existingInstallation.propertySegment && (
                    <div className="col-span-2">
                      <Label className="text-sm font-semibold text-gray-500">Property type</Label>
                      <p className="mt-1">
                        {installPropertyTypeLabel(existingInstallation.propertySegment)}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Location</Label>
                  <p className="mt-1">{existingInstallation.location}</p>
                </div>
                {existingInstallation.rooftopAvailable != null && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Rooftop available</Label>
                    <p className="mt-1">{existingInstallation.rooftopAvailable ? 'Yes' : 'No'}</p>
                  </div>
                )}
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
  if (existingInstallation && existingInstallation.status !== 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50">
        {}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="WattsUp Energy" className="h-14 w-14 rounded-md object-contain" />
              <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
            </div>
          </div>
        </nav>
        {}
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
                  {existingInstallation.propertySegment && (
                    <div className="col-span-2">
                      <Label className="text-sm font-semibold text-gray-500">Property type</Label>
                      <p className="mt-1">
                        {installPropertyTypeLabel(existingInstallation.propertySegment)}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-500">Location</Label>
                  <p className="mt-1">{existingInstallation.location}</p>
                </div>
                {existingInstallation.rooftopAvailable != null && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-500">Rooftop available</Label>
                    <p className="mt-1">{existingInstallation.rooftopAvailable ? 'Yes' : 'No'}</p>
                  </div>
                )}
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
  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="WattsUp Energy" className="h-10 w-10 rounded-md object-contain" />
            <span className="text-xl font-bold text-gray-900">WattsUp Energy</span>
          </div>
        </div>
      </nav>
      {}
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {formStep === 1
                  ? 'Step 1: Enter details'
                  : 'Step 2: Load calculator'}
              </CardTitle>
              {formStep === 2 && (
                <CardDescription>
                  Select the load you want to run on Solar System.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {formStep === 1 && (
                  <>
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
                        disabled={loading}
                      />
                      <p className="text-sm text-gray-500">
                        Give your installation a name for identification
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Installation Location <span className="text-red-500">*</span>
                      </Label>
                      <InstallationLocationPicker
                        key={
                          showResubmitForm && existingInstallation
                            ? `resubmit-${existingInstallation.id}`
                            : 'new-install'
                        }
                        location={formData.location}
                        onLocationChange={(location) => {
                          setFormData((prev) => ({ ...prev, location }));
                          setError('');
                        }}
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        onCoordinatesChange={(latitude, longitude) => {
                          setFormData((prev) => ({ ...prev, latitude, longitude }));
                          setError('');
                        }}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propertySegment">
                        Property type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.propertySegment}
                        onValueChange={(value) => {
                          const seg = value as PropertySegmentValue;
                          const { minKw, maxKw } = getBoundsForSegment(seg);
                          const prev = parseFloat(formData.capacityKw);
                          let nextCap = formData.capacityKw;
                          if (isNaN(prev) || prev < minKw) {
                            nextCap = String(minKw);
                          } else if (prev > maxKw) {
                            nextCap = String(maxKw);
                          }
                          setFormData({
                            ...formData,
                            propertySegment: seg,
                            capacityKw: nextCap,
                          });
                          setError('');
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger id="propertySegment">
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_PROPERTY_TYPE_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        System size limits depend on property category. A vendor will confirm after a site survey.
                      </p>
                    </div>
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
                          <SelectValue
                            placeholder={
                              loadingVendors
                                ? 'Loading vendors...'
                                : vendors.length === 0
                                  ? 'No verified vendors available'
                                  : 'Select a vendor'
                            }
                          />
                        </SelectTrigger>
                        {vendors.length > 0 && (
                          <SelectContent>
                            {vendors.map((vendor) => (
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
                    <div className="space-y-2">
                      <Label htmlFor="rooftopAvailable">
                        Rooftop available for solar? <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.rooftopAvailable === '' ? undefined : formData.rooftopAvailable}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            rooftopAvailable: value as 'yes' | 'no',
                          });
                          setError('');
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger id="rooftopAvailable">
                          <SelectValue placeholder="Select Yes or No" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                     
                    </div>
                    <div className="pt-2">
                      <Button type="submit" disabled={loading} className="w-full" size="lg">
                        Next: Load calculator
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </>
                )}
                {formStep === 2 && (
                  <>
                    <LoadCalculatorSection
                      rows={loadRows}
                      onRowsChange={setLoadRows}
                      propertySegment={formData.propertySegment}
                      onApplySuggestedKw={(kw) => {
                        setFormData((prev) => ({ ...prev, capacityKw: String(kw) }));
                        setError('');
                      }}
                      disabled={loading}
                    />
                    <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3 sm:items-stretch">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        className="sm:w-36 shrink-0"
                        onClick={() => {
                          setFormStep(1);
                          setError('');
                        }}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1"
                        size="lg"
                      >
                        {loading ? (
                          <span>Submitting...</span>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Submit Installation Request
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
          {}
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
