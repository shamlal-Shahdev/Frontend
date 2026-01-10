import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, MapPin, AlertCircle } from 'lucide-react';

export const KYCInfo = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    city: '',
    province: '',
    country: 'Pakistan',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.city || !formData.province || !formData.country) {
      setError('Please fill in all location fields');
      return;
    }

    // Navigate to document upload page with location data
    navigate('/kyc/documents', {
      state: {
        location: {
          city: formData.city,
          province: formData.province,
          country: formData.country,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-semibold">
                1
              </div>
              <span className="text-sm font-medium text-emerald-600">Location Info</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold">
                2
              </div>
              <span className="text-sm font-medium text-gray-500">Documents</span>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-800">KYC Information</CardTitle>
                <CardDescription className="mt-1 text-base">
                  Please provide your location information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (error) setError('');
                    }}
                    placeholder="e.g., Karachi"
                    className="h-12 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province" className="text-sm font-semibold text-gray-700">
                    Province <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="province"
                    type="text"
                    required
                    value={formData.province}
                    onChange={(e) => {
                      setFormData({ ...formData, province: e.target.value });
                      if (error) setError('');
                    }}
                    placeholder="e.g., Sindh"
                    className="h-12 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-semibold text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => {
                      setFormData({ ...formData, country: e.target.value });
                      if (error) setError('');
                    }}
                    placeholder="e.g., Pakistan"
                    className="h-12 bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-base shadow-lg shadow-emerald-500/30 transition-all duration-200 flex items-center gap-2"
                >
                  Next: Upload Documents
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This information is required for KYC verification. All fields are mandatory.
          </p>
        </div>
      </div>
    </div>
  );
};

