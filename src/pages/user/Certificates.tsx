import { useCallback, useEffect, useMemo, useState } from 'react';
import { certificateApi } from '@/api/certificate.api';
import type {
  Certificate,
  CertificateMonthOverview,
  CertificateStats,
} from '@/types/certificate.types';
import {
  ACHIEVEMENT_LABELS,
  BADGE_LABELS,
  formatCertificateMonth,
  getApiErrorMessage,
} from '@/types/certificate.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Award,
  Download,
  Leaf,
  Loader2,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const achievementColors: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  silver: 'bg-gray-100 text-gray-800 border-gray-200',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  platinum: 'bg-purple-100 text-purple-800 border-purple-200',
};

function monthOverviewKey(month: number, year: number): string {
  return `${year}-${month}`;
}

export const Certificates = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [monthlyOverview, setMonthlyOverview] = useState<CertificateMonthOverview[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const downloadableMonths = useMemo(
    () => monthlyOverview.filter((item) => item.downloadable && item.certificate),
    [monthlyOverview],
  );

  const selectedMonthOverview = useMemo(() => {
    if (monthlyOverview.length === 0) {
      return null;
    }
    const match = monthlyOverview.find(
      (item) => monthOverviewKey(item.month, item.year) === selectedPeriodKey,
    );
    return match ?? monthlyOverview[0];
  }, [monthlyOverview, selectedPeriodKey]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const query = {
        sort: sortOrder,
        limit: 50,
        ...(filterMonth ? { month: parseInt(filterMonth, 10) } : {}),
        ...(filterYear ? { year: parseInt(filterYear, 10) } : {}),
      };
      const [listResponse, statsResponse, overviewResponse] = await Promise.all([
        certificateApi.getMine(query),
        certificateApi.getMyStats(),
        certificateApi.getMyMonthlyOverview(),
      ]);
      setCertificates(listResponse.certificates);
      setTotal(listResponse.total);
      setStats(statsResponse);
      setMonthlyOverview(overviewResponse);
      if (overviewResponse.length > 0) {
        const preferred =
          overviewResponse.find((item) => item.downloadable) ?? overviewResponse[0];
        setSelectedPeriodKey(monthOverviewKey(preferred.month, preferred.year));
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getApiErrorMessage(error, 'Failed to load certificates'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear, sortOrder, toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleDownload = async (certificate: Certificate) => {
    setDownloadingId(certificate.id);
    try {
      const blob = await certificateApi.downloadMine(certificate.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      toast({
        title: 'Download failed',
        description: getApiErrorMessage(error, 'Could not download certificate PDF'),
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[240px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Proof of Green Certificates</h1>
        <p className="text-gray-500 mt-1">
          Download certificates only for months where verified energy was generated and rewarded.
        </p>
      </div>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">By Month</TabsTrigger>
          <TabsTrigger value="history">Certificate History</TabsTrigger>
          <TabsTrigger value="stats">Lifetime Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-4">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Monthly Certificate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {monthlyOverview.length === 0 ? (
                <p className="text-gray-600">
                  No rewarded energy months yet. Complete smart meter verification and earn your
                  blockchain reward to unlock Proof of Green certificates.
                </p>
              ) : (
                <>
                  <div className="max-w-sm space-y-2">
                    <Label htmlFor="monthSelect">Select energy generation month</Label>
                    <Select
                      value={selectedPeriodKey}
                      onValueChange={setSelectedPeriodKey}
                    >
                      <SelectTrigger id="monthSelect">
                        <SelectValue placeholder="Choose a month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthlyOverview.map((item) => (
                          <SelectItem
                            key={monthOverviewKey(item.month, item.year)}
                            value={monthOverviewKey(item.month, item.year)}
                          >
                            {formatCertificateMonth(item.month, item.year)} ·{' '}
                            {item.energyGeneratedKwh.toFixed(2)} kWh
                            {item.downloadable ? ' · Certificate ready' : ' · Pending'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMonthOverview && (
                    <div className="space-y-4 pt-2 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Energy Generated</p>
                          <p className="text-xl font-bold">
                            {selectedMonthOverview.energyGeneratedKwh.toFixed(2)} kWh
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Reward Earned</p>
                          <p className="text-xl font-bold">
                            {selectedMonthOverview.rewardAmount.toFixed(2)} tokens
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Certificate Status</p>
                          <p className="text-sm font-medium">
                            {selectedMonthOverview.downloadable
                              ? 'Ready to download'
                              : 'Certificate is being prepared'}
                          </p>
                        </div>
                      </div>

                      {selectedMonthOverview.certificate && (
                        <>
                          <p className="text-sm text-gray-500">Certificate ID</p>
                          <p className="font-mono text-sm">
                            {selectedMonthOverview.certificate.certificateId}
                          </p>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={
                                achievementColors[
                                  selectedMonthOverview.certificate.achievementLevel
                                ]
                              }
                            >
                              {
                                ACHIEVEMENT_LABELS[
                                  selectedMonthOverview.certificate.achievementLevel
                                ]
                              }
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-800">
                              {BADGE_LABELS[selectedMonthOverview.certificate.badge]}
                            </Badge>
                          </div>
                        </>
                      )}

                      {selectedMonthOverview.downloadable &&
                      selectedMonthOverview.certificate ? (
                        <Button
                          type="button"
                          onClick={() =>
                            void handleDownload(selectedMonthOverview.certificate as Certificate)
                          }
                          disabled={downloadingId === selectedMonthOverview.certificate.id}
                        >
                          {downloadingId === selectedMonthOverview.certificate.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Download PDF
                        </Button>
                      ) : (
                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                          Energy was verified for{' '}
                          {formatCertificateMonth(
                            selectedMonthOverview.month,
                            selectedMonthOverview.year,
                          )}
                          , but the certificate PDF is not available yet. It will appear here once
                          generation completes.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {downloadableMonths.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              {downloadableMonths.length} month
              {downloadableMonths.length === 1 ? '' : 's'} with downloadable certificates.
            </p>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filterMonth">Month</Label>
                  <Input
                    id="filterMonth"
                    type="number"
                    min={1}
                    max={12}
                    placeholder="1-12"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="filterYear">Year</Label>
                  <Input
                    id="filterYear"
                    type="number"
                    min={2000}
                    placeholder="2025"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Sort</Label>
                  <Select
                    value={sortOrder}
                    onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="outline" onClick={() => void loadData()}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificate History ({total})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {certificates.length === 0 ? (
                <p className="text-gray-600">
                  No downloadable certificates yet. Certificates appear here only for months with
                  verified energy generation.
                </p>
              ) : (
                certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{cert.certificateId}</p>
                      <p className="text-sm text-gray-600">
                        {formatCertificateMonth(cert.month, cert.year)}
                      </p>
                      <p className="text-sm">
                        {cert.energyGenerated.toFixed(2)} kWh · {cert.rewardAmount.toFixed(2)} tokens
                      </p>
                      <p className="text-xs text-gray-500">
                        Issued {new Date(cert.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={achievementColors[cert.achievementLevel]}>
                        {ACHIEVEMENT_LABELS[cert.achievementLevel]}
                      </Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void handleDownload(cert)}
                        disabled={downloadingId === cert.id}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-gray-600">Certificates Earned</p>
                  </div>
                  <p className="text-3xl font-bold">{stats.totalCertificates}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <p className="text-sm text-gray-600">Total Energy</p>
                  </div>
                  <p className="text-3xl font-bold">
                    {stats.totalEnergyGenerated.toFixed(2)}{' '}
                    <span className="text-lg">kWh</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-gray-600">Total CO₂ Offset</p>
                  </div>
                  <p className="text-3xl font-bold">{stats.totalCo2OffsetTons.toFixed(2)} tons</p>
                  <p className="text-xs text-gray-500">{stats.totalCo2OffsetKg.toFixed(2)} kg</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <p className="text-sm text-gray-600">Total Rewards</p>
                  </div>
                  <p className="text-3xl font-bold">{stats.totalRewardsEarned.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">
                    Previous month: <strong>{stats.previousMonthEnergy.toFixed(2)} kWh</strong>
                  </p>
                  <p className="text-sm">
                    Current month: <strong>{stats.currentMonthEnergy.toFixed(2)} kWh</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    {stats.monthOverMonthPercentChange >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={
                        stats.monthOverMonthPercentChange >= 0
                          ? 'text-green-700'
                          : 'text-red-700'
                      }
                    >
                      {stats.monthOverMonthPercentChange >= 0 ? '+' : ''}
                      {stats.monthOverMonthPercentChange}% vs previous month
                    </span>
                  </div>
                </CardContent>
              </Card>

              {stats.currentBadge && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Sustainability Badge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="bg-green-50 text-green-800 text-base px-3 py-1">
                      {BADGE_LABELS[stats.currentBadge]}
                    </Badge>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
