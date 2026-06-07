import { useState, useEffect, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { dashboardApi } from '@/api/dashboard.api';
import type { DashboardData } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Zap, TrendingUp, Award, CloudRain, Activity, Clock, Loader2 } from 'lucide-react';

const TREND_MONTH_OPTIONS = [
  { value: '3', label: 'Last 3 months' },
  { value: '6', label: 'Last 6 months' },
  { value: '12', label: 'Last 12 months' },
] as const;

const energyChartConfig = {
  energy: {
    label: 'Energy (kWh)',
    color: '#22c55e',
  },
} satisfies ChartConfig;

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [trendMonths, setTrendMonths] = useState(6);
  const [hasLoaded, setHasLoaded] = useState(false);

  const formatNumber = (value?: number, decimals = 2) => {
    const safeValue = Number.isFinite(value) ? Number(value) : 0;
    return safeValue.toFixed(decimals);
  };

  const loadDashboard = async (months = trendMonths, trendOnly = false) => {
    if (trendOnly) {
      setTrendLoading(true);
    } else {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await dashboardApi.getUserDashboard(months);
      setData((prev) =>
        trendOnly && prev
          ? { ...prev, energyGenerationTrend: response.energyGenerationTrend }
          : response,
      );
    } catch (err: unknown) {
      console.error('Failed to load dashboard:', err);
      if (!trendOnly) {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      if (trendOnly) {
        setTrendLoading(false);
      } else {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  };

  useEffect(() => {
    void loadDashboard(trendMonths);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    void loadDashboard(trendMonths, true);
  }, [trendMonths]);

  const energyChartData = useMemo(
    () =>
      (data?.energyGenerationTrend ?? []).map((item) => ({
        month: new Date(`${item.month}-01`).toLocaleDateString('en-US', { month: 'short' }),
        energy: item.energy,
      })),
    [data?.energyGenerationTrend],
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-lg text-gray-600">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 space-y-4 text-center">
            <p className="text-gray-700">{error}</p>
            <Button type="button" onClick={() => void loadDashboard()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s your renewable energy overview.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Total Energy Generated</p>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {formatNumber(data?.totalEnergyGenerated, 1)} <span className="text-xl">kWh</span>
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{formatNumber(data?.tokensAvailable, 1)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <CloudRain className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Monthly Carbon Reduced</p>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {formatNumber(data?.monthlyCarbonReducedKg, 1)} <span className="text-xl">kg CO2</span>
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-pink-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Certificates Earned</p>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{data?.certificatesEarned ?? 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Energy Generation Trend</CardTitle>
              <Select
                value={String(trendMonths)}
                onValueChange={(value) => setTrendMonths(Number(value))}
                disabled={trendLoading}
              >
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TREND_MONTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <p>Loading trend data…</p>
              </div>
            ) : energyChartData.length > 0 ? (
              <ChartContainer config={energyChartConfig} className="h-64 w-full">
                <AreaChart data={energyChartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="energyWaveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                      <stop offset="50%" stopColor="#4ade80" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#86efac" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs text-gray-500"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs text-gray-500"
                    tickFormatter={(value: number) => `${value}`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`${Number(value).toFixed(2)} kWh`, 'Energy']}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    fill="url(#energyWaveGradient)"
                    dot={{ fill: '#16a34a', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: '#15803d' }}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>No energy generation data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rewards Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.rewardsDistribution && data.rewardsDistribution.length > 0 ? (
              <div className="h-64 space-y-4">
                {data.rewardsDistribution.map((item, idx) => {
                  const categoryLabels: Record<string, string> = {
                    daily_reward: 'Daily Rewards',
                    prediction_bonus: 'Prediction Bonus',
                  };
                  const categoryColors = ['bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500', 'bg-pink-500'];
                  const color = categoryColors[idx % categoryColors.length];
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {categoryLabels[item.category] ||
                            item.category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <span className="text-gray-600">
                          {item.amount.toFixed(2)} WATT ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`${color} h-2.5 rounded-full transition-all`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>No rewards distribution data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <p className="text-sm text-gray-500 mt-1">Your latest activities and achievements</p>
        </CardHeader>
        <CardContent>
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {data.recentActivity.map((activity, idx: number) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'energy'
                        ? 'bg-blue-100'
                        : activity.type === 'tokens'
                          ? 'bg-yellow-100'
                          : activity.type === 'prediction'
                            ? 'bg-purple-100'
                            : 'bg-green-100'
                    }`}
                  >
                    {activity.type === 'energy' ? (
                      <Zap className="w-5 h-5 text-blue-600" />
                    ) : activity.type === 'tokens' ? (
                      <TrendingUp className="w-5 h-5 text-yellow-600" />
                    ) : activity.type === 'prediction' ? (
                      <Activity className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Award className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    {activity.amount ? (
                      <p className="text-lg font-bold text-yellow-600 mt-1">+{formatNumber(activity.amount)} WATT</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        activity.type === 'energy'
                          ? 'bg-blue-100 text-blue-700'
                          : activity.type === 'tokens'
                            ? 'bg-yellow-100 text-yellow-700'
                            : activity.type === 'prediction'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
