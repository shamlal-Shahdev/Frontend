import { useCallback, useEffect, useState } from 'react';
import { adminCertificateApi } from '@/api/certificate.api';
import type {
  Certificate,
  CertificateAdminStats,
  CertificateUserSummary,
  CertificateUsersResponse,
} from '@/types/certificate.types';
import {
  ACHIEVEMENT_LABELS,
  formatCertificateMonth,
  getApiErrorMessage,
} from '@/types/certificate.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldOff,
  Zap,
} from 'lucide-react';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const Pagination = ({
  page,
  totalPages,
  total,
  loading,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex items-center justify-between mt-6">
    <p className="text-sm text-gray-600">
      Page {page} of {totalPages} ({total} total)
    </p>
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1 || loading}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages || loading}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  </div>
);

export const AdminCertificates = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CertificateAdminStats | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [usersData, setUsersData] = useState<CertificateUsersResponse | null>(null);
  const [selectedUser, setSelectedUser] = useState<CertificateUserSummary | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatesTotal, setCertificatesTotal] = useState(0);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [revokingId, setRevokingId] = useState<number | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsResponse = await adminCertificateApi.getStats();
        setStats(statsResponse);
      } catch (error: unknown) {
        toast({
          title: 'Error',
          description: getApiErrorMessage(error, 'Failed to load certificate stats'),
          variant: 'destructive',
        });
      }
    };
    void loadStats();
  }, [toast]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCertificateApi.getUsers(page, limit);
      setUsersData(res);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getApiErrorMessage(error, 'Failed to load certificate users'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, toast]);

  const loadCertificates = useCallback(async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const query = {
        page,
        limit,
        userId: selectedUser.userId,
        ...(filterMonth ? { month: parseInt(filterMonth, 10) } : {}),
        ...(filterYear ? { year: parseInt(filterYear, 10) } : {}),
        ...(filterStatus !== 'all'
          ? { status: filterStatus as Certificate['status'] }
          : {}),
      };
      const listResponse = await adminCertificateApi.getAll(query);
      setCertificates(listResponse.certificates);
      setCertificatesTotal(listResponse.total);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getApiErrorMessage(error, 'Failed to load certificates'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedUser, filterMonth, filterYear, filterStatus, toast]);

  useEffect(() => {
    if (selectedUser) return;
    void loadUsers();
  }, [selectedUser, loadUsers]);

  useEffect(() => {
    if (!selectedUser) return;
    void loadCertificates();
  }, [selectedUser, loadCertificates]);

  const handleSelectUser = (user: CertificateUserSummary) => {
    setSelectedUser(user);
    setPage(1);
    setCertificates([]);
    setCertificatesTotal(0);
    setFilterMonth('');
    setFilterYear('');
    setFilterStatus('all');
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setPage(1);
    setCertificates([]);
    setCertificatesTotal(0);
  };

  const handleRevoke = async (id: number) => {
    setRevokingId(id);
    try {
      await adminCertificateApi.revoke(id);
      toast({
        title: 'Certificate revoked',
        description: 'The certificate has been marked as revoked.',
      });
      await loadCertificates();
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

  const users = usersData?.items ?? [];
  const usersTotalPages = usersData ? Math.max(1, Math.ceil(usersData.total / usersData.limit)) : 1;
  const certificatesTotalPages = Math.max(1, Math.ceil(certificatesTotal / limit));

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

      {selectedUser && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="adminMonth">Month</Label>
                <Input
                  id="adminMonth"
                  type="number"
                  min={1}
                  max={12}
                  value={filterMonth}
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="adminYear">Year</Label>
                <Input
                  id="adminYear"
                  type="number"
                  value={filterYear}
                  onChange={(e) => {
                    setFilterYear(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={filterStatus}
                  onValueChange={(value) => {
                    setFilterStatus(value);
                    setPage(1);
                  }}
                >
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
                <Button type="button" onClick={() => void loadCertificates()}>
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {selectedUser && (
              <Button variant="ghost" size="sm" onClick={handleBackToUsers} className="mr-1">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <div>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>
                {selectedUser
                  ? `Certificates for ${selectedUser.user.name} (newest first).`
                  : 'Select a user to view their Proof of Green certificates.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[160px]">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
            </div>
          ) : !selectedUser ? (
            users.length === 0 ? (
              <p className="text-gray-600">No certificates have been issued yet.</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Certificates</TableHead>
                        <TableHead className="text-right">Total kWh</TableHead>
                        <TableHead className="text-right">Total rewards</TableHead>
                        <TableHead>Last issued</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((row) => (
                        <TableRow
                          key={row.userId}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSelectUser(row)}
                        >
                          <TableCell>
                            <div className="text-sm font-medium">{row.user.name}</div>
                            <div className="text-xs text-gray-500">{row.user.email}</div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {row.certificateCount}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {Number(row.totalEnergy).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {Number(row.totalRewards).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatDate(row.lastIssuedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {usersData && usersData.total > limit && (
                  <Pagination
                    page={page}
                    totalPages={usersTotalPages}
                    total={usersData.total}
                    loading={loading}
                    onPageChange={setPage}
                  />
                )}
              </>
            )
          ) : certificates.length === 0 ? (
            <p className="text-gray-600">No certificates match your filters.</p>
          ) : (
            <>
              <div className="space-y-3">
                {certificates.map((cert) => (
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
                        {formatCertificateMonth(cert.month, cert.year)}
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
                ))}
              </div>
              {certificatesTotal > limit && (
                <Pagination
                  page={page}
                  totalPages={certificatesTotalPages}
                  total={certificatesTotal}
                  loading={loading}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
