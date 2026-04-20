import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  vendorApi,
  UpsertVendorCompanyProfileRequest,
} from '@/api/vendor.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const logoUrl = '/Assets/logo.png';

export const VendorCompanyOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<UpsertVendorCompanyProfileRequest>({
    companyName: '',
    city: '',
    province: '',
    country: '',
    addressLine: '',
  });

  const sanitizeLettersOnly = (value: string) =>
    value.replace(/[^a-zA-Z\s]/g, '');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'vendor') {
      navigate('/vendor/login', { replace: true });
      return;
    }
    (async () => {
      try {
        const existing = await vendorApi.getCompanyProfile();
        if (existing) {
          setForm({
            companyName: existing.companyName || '',
            city: existing.city || '',
            province: existing.province || '',
            country: existing.country || '',
            addressLine: existing.addressLine || '',
          });
        }
      } catch {
        // ignore — treat as new profile
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.companyName.trim()) {
      setError('Company name is required');
      return;
    }
    if (!form.city?.trim()) {
      setError('City is required');
      return;
    }
    if (!form.province?.trim()) {
      setError('Province / state is required');
      return;
    }
    if (!form.country?.trim()) {
      setError('Country is required');
      return;
    }
    if (!form.addressLine?.trim()) {
      setError('Street / address is required');
      return;
    }
    setSaving(true);
    try {
      await vendorApi.upsertCompanyProfile({
        companyName: form.companyName.trim(),
        city: form.city?.trim() || undefined,
        province: form.province?.trim() || undefined,
        country: form.country?.trim() || undefined,
        addressLine: form.addressLine?.trim() || undefined,
      });
      localStorage.setItem('vendorCompanyProfileComplete', 'true');
      navigate('/vendor/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      setError(
        typeof msg === 'string' ? msg : 'Could not save company profile. Try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <img src={logoUrl} alt="WattsUp Energy" className="w-28 h-28 mx-auto mb-2" />
        </div>
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Company details</CardTitle>
            <CardDescription>
              Enter Your Company Details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      companyName: sanitizeLettersOnly(e.target.value),
                    })
                  }
                  placeholder="e.g. Solar Installers Ltd"
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    required
                    value={form.city || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        city: sanitizeLettersOnly(e.target.value),
                      })
                    }
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Province / state
                  </label>
                  <Input
                    required
                    value={form.province || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        province: sanitizeLettersOnly(e.target.value),
                      })
                    }
                    className="h-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <Input
                  required
                  value={form.country || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      country: sanitizeLettersOnly(e.target.value),
                    })
                  }
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <Input
                  required
                  value={form.addressLine || ''}
                  onChange={(e) =>
                    setForm({ ...form, addressLine: e.target.value })
                  }
                  className="h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Continue to dashboard'}
              </Button>
              <p className="text-center text-sm text-gray-600">
                <Link
                  to="/vendor/login"
                  className="text-emerald-600 hover:underline"
                >
                  Back to login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
