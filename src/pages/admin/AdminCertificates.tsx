import { useCallback, useEffect, useState } from 'react';
import { adminCertificateApi } from '@/api/certificate.api';
import type { Certificate, CertificateAdminStats } from '@/types/certificate.types';
import {
  ACHIEVEMENT_LABELS,
  formatCertificateMonth,
  getApiErrorMessage,
} from '@/types/certificate.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Award, Loader2, ShieldOff, Zap } from 'lucide-react';

export const AdminCertificates = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateAdminStats | null>(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const query = {
        limit: 50,
        ...(filterMonth ? { month: parseInt(filterMonth, 10) } : {}),
        ...(filterYear ? { year: parseInt(filterYear, 10) } : {}),
        ...(filterUserId ? { userId: parseInt(filterUserId, 10) } : {}),
        ...(filterStatus !== 'all'
          ? { status: filterStatus as Certificate['status'] }
          : {}),
      };
      const [listResponse, statsResponse] = await Promise.all([
        adminCertificateApi.getAll(query),
        adminCertificateApi.getStats(),
      ]);
      setCertificates(listResponse.certificates);
      setStats(statsResponse);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getApiErrorMessage(error, 'Failed to load certificates'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear, filterUserId, filterStatus, toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRevoke = async (id: number) => {
    setRevokingId(id);
    try {
      await adminCertificateApi.revoke(id);
      toast({
        title: 'Certificate revoked',
        description: 'The certificate has been marked as revoked.',
      });
      await loadData();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getApiErrorMessage(error, 'Failed to revoke certificate'),
        variant: 'destructive',
      });
    } finally {
      setRevokingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[240px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificate Management</h1>
        <p className="text-gray-500">View, search, and manage Proof of Green certificates.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Total Generated</p>
              <p className="text-2xl font-bold">{stats.totalCertificatesGenerated}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold">{stats.certificatesThisMonth}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Energy Certified</p>
              <p className="text-2xl font-bold">{stats.totalEnergyCertified.toFixed(0)} kWh</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">CO₂ Offset</p>
              <p className="text-2xl font-bold">{stats.totalCo2Offset.toFixed(0)} kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Rewards Distributed</p>
              <p className="text-2xl font-bold">{stats.totalRewardsDistributed.toFixed(0)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="adminMonth">Month</Label>
              <Input
                id="adminMonth"
                type="number"
                min={1}
                max={12}
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="adminYear">Year</Label>
              <Input
                id="adminYear"
                type="number"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="adminUserId">User ID</Label>
              <Input
                id="adminUserId"
                type="number"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={() => void loadData()}>
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certificates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {certificates.length === 0 ? (
            <p className="text-gray-600">No certificates match your filters.</p>
          ) : (
            certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-600" />
                    <p className="font-semibold">{cert.certificateId}</p>
                    <Badge variant={cert.status === 'active' ? 'default' : 'destructive'}>
                      {cert.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    User #{cert.userId} · {formatCertificateMonth(cert.month, cert.year)}
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {cert.energyGenerated.toFixed(2)} kWh · {cert.rewardAmount.toFixed(2)} tokens
                  </p>
                  <p className="text-xs text-gray-500">
                    {ACHIEVEMENT_LABELS[cert.achievementLevel]}
                    {cert.vendorName ? ` · ${cert.vendorName}` : ''}
                  </p>
                </div>
                {cert.status === 'active' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleRevoke(cert.id)}
                    disabled={revokingId === cert.id}
                  >
                    {revokingId === cert.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldOff className="w-4 h-4 mr-1" />
                    )}
                    Revoke
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
