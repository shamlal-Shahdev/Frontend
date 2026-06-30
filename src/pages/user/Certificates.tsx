import { useCallback, useEffect, useMemo, useState } from 'react';
import { certificateApi } from '@/api/certificate.api';
import type { Certificate, CertificateMonthOverview } from '@/types/certificate.types';
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
import { Award, CheckCircle2, Coins, Download, Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const achievementColors: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  silver: 'bg-gray-100 text-gray-800 border-gray-200',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  platinum: 'bg-purple-100 text-purple-800 border-purple-200',
};

const tabTriggerClass =
  'rounded-full px-5 py-2 text-sm font-medium text-white border-0 shadow-none data-[state=active]:bg-green-800 data-[state=active]:text-white data-[state=inactive]:bg-green-600 data-[state=inactive]:text-white hover:bg-green-700';

function monthOverviewKey(month: number, year: number): string {
  return `${year}-${month}`;
}

function formatMonthSelectLabel(item: CertificateMonthOverview): string {
  const month = formatCertificateMonth(item.month, item.year);
  const kwh = `${item.energyGeneratedKwh.toFixed(2)} kWh`;
  const status = item.downloadable ? 'Certificate ready' : 'Pending';
  return `${month} - ${kwh} - ${status}`;
}

function AchievementBadges({ certificate }: { certificate: Certificate }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant="outline"
        className={cn('font-medium', achievementColors[certificate.achievementLevel])}
      >
        {ACHIEVEMENT_LABELS[certificate.achievementLevel]}
      </Badge>
      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 font-medium">
        {BADGE_LABELS[certificate.badge]}
      </Badge>
    </div>
  );
}

export const Certificates = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [monthlyOverview, setMonthlyOverview] = useState<CertificateMonthOverview[]>([]);
  const [total, setTotal] = useState(0);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

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
      const [listResponse, overviewResponse] = await Promise.all([
        certificateApi.getMine(query),
        certificateApi.getMyMonthlyOverview(),
      ]);
      setCertificates(listResponse.certificates);
      setTotal(listResponse.total);
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

  const selectedCert = selectedMonthOverview?.certificate ?? null;

  return (
    <div className="p-6 space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Proof of Green Certificates</h1>
        <p className="text-gray-500 mt-1">
          Download certificates only for months where verified energy was generated and rewarded.
        </p>
      </div>

      <Tabs defaultValue="current">
        <TabsList className="bg-transparent gap-2 h-auto p-0">
          <TabsTrigger value="current" className={tabTriggerClass}>
            By Month
          </TabsTrigger>
          <TabsTrigger value="history" className={tabTriggerClass}>
            Certificate History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-5">
          {monthlyOverview.length === 0 ? (
            <Card className="border-2 border-green-600 rounded-2xl">
              <CardContent className="py-12 text-center text-gray-600">
                No rewarded energy months yet. Complete smart meter verification and earn your
                reward to unlock Proof of Green certificates.
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-green-600 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600 shrink-0" />
                    <h2 className="text-lg font-bold text-gray-900">Monthly Certificate</h2>
                  </div>
                  {selectedCert && <AchievementBadges certificate={selectedCert} />}
                </div>

                <div className="space-y-2 mb-5">
                  <Label htmlFor="monthSelect" className="text-sm text-gray-600">
                    Select energy generation month
                  </Label>
                  <Select value={selectedPeriodKey} onValueChange={setSelectedPeriodKey}>
                    <SelectTrigger id="monthSelect" className="w-full h-11">
                      <SelectValue placeholder="Choose a month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthlyOverview.map((item) => (
                        <SelectItem
                          key={monthOverviewKey(item.month, item.year)}
                          value={monthOverviewKey(item.month, item.year)}
                        >
                          {formatMonthSelectLabel(item)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMonthOverview && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div className="rounded-lg border border-gray-200 bg-white p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Energy Generated</p>
                          <p className="text-sm font-bold text-gray-900">
                            {selectedMonthOverview.energyGeneratedKwh.toFixed(2)} kWh
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                          <Coins className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reward Earned</p>
                          <p className="text-sm font-bold text-gray-900">
                            {selectedMonthOverview.rewardAmount.toFixed(2)} tokens
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Certificate Status</p>
                          <p className="text-sm font-bold text-gray-900 leading-snug">
                            {selectedMonthOverview.downloadable
                              ? 'Ready to download'
                              : 'Being prepared'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedCert && (
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        <AchievementBadges certificate={selectedCert} />

                        <Button
                          type="button"
                          className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                          onClick={() => void handleDownload(selectedCert)}
                          disabled={downloadingId === selectedCert.id}
                        >
                          {downloadingId === selectedCert.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Download PDF
                        </Button>
                      </div>
                    )}

                    {!selectedMonthOverview.downloadable && (
                      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                        Energy was verified for{' '}
                        {formatCertificateMonth(
                          selectedMonthOverview.month,
                          selectedMonthOverview.year,
                        )}
                        , but the certificate PDF is not available yet.
                      </p>
                    )}
                  </>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-5 space-y-4">
          <Card className="border border-green-200 rounded-xl">
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
                  <Button
                    type="button"
                    variant="outline"
                    className="border-green-600 text-green-700"
                    onClick={() => void loadData()}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-200 rounded-xl">
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
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border border-gray-200 rounded-xl"
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
                        className="bg-green-600 hover:bg-green-700"
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
      </Tabs>
    </div>
  );
};
