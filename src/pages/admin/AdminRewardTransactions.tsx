import { useState, useEffect } from 'react';
import {
  adminApi,
  AdminRewardTransaction,
  AdminRewardTransactionsResponse,
} from '@/api/admin.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Coins } from 'lucide-react';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const AdminRewardTransactions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [data, setData] = useState<AdminRewardTransactionsResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adminApi.getRewardTransactions(page, limit);
        setData(res);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load rewards');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [page, limit]);

  const items: AdminRewardTransaction[] = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Coins className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <CardTitle>Reward transactions</CardTitle>
                <CardDescription>
                  All token rewards issued on-chain or from automated usage (newest first).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-sm text-red-600 mb-4" role="alert">
                {error}
              </p>
            )}
            {loading ? (
              <p className="text-gray-600 py-8 text-center">Loading…</p>
            ) : items.length === 0 ? (
              <p className="text-gray-600 py-8 text-center">No reward transactions yet.</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Installation</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">kWh</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>TX hash</TableHead>
                        <TableHead>Issued</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-mono text-xs">{row.id}</TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {row.user?.name ?? `User #${row.userId}`}
                            </div>
                            <div className="text-xs text-gray-500">{row.user?.email ?? '—'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {row.installation?.name ?? `#${row.installationId}`}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[180px]">
                              {row.installation?.location ?? '—'}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs capitalize">
                            {String(row.reason).replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {Number(row.kwhRewarded).toLocaleString(undefined, {
                              maximumFractionDigits: 4,
                            })}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {Number(row.tokensAmount).toLocaleString(undefined, {
                              maximumFractionDigits: 6,
                            })}
                          </TableCell>
                          <TableCell className="text-xs">
                            {row.usagePeriodYearMonth ?? '—'}
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-[140px] truncate">
                            {row.txHash ?? '—'}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatDate(row.issuedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {data && data.total > limit && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Page {page} of {totalPages} ({data.total} total)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
    </div>
  );
};
