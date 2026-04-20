import { useEffect, useMemo, useState } from 'react';
import { dashboardApi } from '@/api/dashboard.api';
import type { DashboardData } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

export const CarbonOffset = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getUserDashboard();
      setData(response);
    } catch (err: unknown) {
      console.error('Failed to load carbon data:', err);
      setError('Unable to load carbon footprint data right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const currentMonthLabel = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [],
  );

  const recentFirstTrend = useMemo(() => {
    if (!data?.carbonReductionTrend) {
      return [];
    }
    return [...data.carbonReductionTrend].sort((a, b) => b.month.localeCompare(a.month));
  }, [data?.carbonReductionTrend]);

  const formatKg = (value?: number) => {
    const safeValue = Number.isFinite(value) ? Number(value) : 0;
    return `${safeValue.toFixed(2)} kg CO2`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center text-gray-600">Loading carbon data…</CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 space-y-4 text-center">
            <p className="text-gray-700">{error}</p>
            <Button type="button" onClick={() => void loadData()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Carbon Reduction</h1>
        <p className="text-gray-500 mt-1">Your monthly impact based on rewarded user energy generation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              This Month ({currentMonthLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{formatKg(data?.monthlyCarbonReducedKg)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Reduced (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{formatKg(data?.totalCarbonReducedKg)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Carbon Reduction Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {recentFirstTrend.length > 0 ? (
            <div className="space-y-3">
              {recentFirstTrend.map((item) => {
                const monthLabel = new Date(`${item.month}-01`).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <div
                    key={item.month}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                  >
                    <span className="font-medium text-gray-700">{monthLabel}</span>
                    <span className="font-semibold text-green-700">{formatKg(item.carbonReducedKg)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No monthly carbon reduction data available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
