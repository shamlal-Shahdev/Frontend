import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorApi } from '@/api/vendor.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link2, Upload, ArrowRight } from 'lucide-react';

export const VendorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    installations?: {
      submitted: number;
      assigned: number;
      inProgress: number;
      completed: number;
      rejected: number;
    };
  } | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, { authApi }] = await Promise.all([
          vendorApi.getDashboard(),
          import('@/api/auth.api').then((m) => ({ authApi: m.authApi })),
        ]);
        setData(dash);
        const me = await authApi.getCurrentUser();
        setCompanyName((me as { companyName?: string | null }).companyName ?? null);
      } catch (err) {
        console.error('Failed to load vendor dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-lg text-gray-600">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {companyName ? `${companyName} Dashboard` : 'Vendor Dashboard'}
        </h1>
        <p className="text-gray-500 mt-1">Manage your assigned installations and track progress.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50/80">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="w-5 h-5 text-gray-500" />
              Connect your app
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Automated monthly sync from your billing or metering system will appear here.
            </p>
            <Button variant="secondary" disabled className="w-full sm:w-auto">
              Coming soon
            </Button>
          </CardContent>
        </Card>
        <Card className="border-orange-100 bg-orange-50/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-600" />
              Manual entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Upload a CSV or Excel file with meter IDs and monthly kWh to credit user wallets.
            </p>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => navigate('/vendor/usage-import')}
            >
              Go to usage import
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Install to Earn</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/vendor/installations')}>
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{data?.installations?.submitted || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Submitted</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{data?.installations?.assigned || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Assigned</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{data?.installations?.inProgress || 0}</p>
                <p className="text-sm text-gray-600 mt-1">In Progress</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{data?.installations?.completed || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{data?.installations?.rejected || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
