import { useState, useEffect } from 'react';
import {
  adminApi,
  AdminRewardTransaction,
  AdminRewardTransactionsResponse,
  AdminRewardUserSummary,
  AdminRewardUsersResponse,
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
import { ArrowLeft, ChevronLeft, ChevronRight, Coins } from 'lucide-react';

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

export const AdminRewardTransactions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [usersData, setUsersData] = useState<AdminRewardUsersResponse | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminRewardUserSummary | null>(null);
  const [transactionsData, setTransactionsData] = useState<AdminRewardTransactionsResponse | null>(
    null,
  );

  useEffect(() => {
    if (selectedUser) return;

    const loadUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adminApi.getRewardUsers(page, limit);
        setUsersData(res);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load reward users');
      } finally {
        setLoading(false);
      }
    };
    void loadUsers();
  }, [page, limit, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const loadTransactions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adminApi.getRewardTransactions(page, limit, selectedUser.userId);
        setTransactionsData(res);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load rewards');
      } finally {
        setLoading(false);
      }
    };
    void loadTransactions();
  }, [page, limit, selectedUser]);

  const handleSelectUser = (user: AdminRewardUserSummary) => {
    setSelectedUser(user);
    setPage(1);
    setTransactionsData(null);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setPage(1);
    setTransactionsData(null);
  };

  const users: AdminRewardUserSummary[] = usersData?.items ?? [];
  const transactions: AdminRewardTransaction[] = transactionsData?.items ?? [];
  const activeData = selectedUser ? transactionsData : usersData;
  const totalPages = activeData ? Math.max(1, Math.ceil(activeData.total / activeData.limit)) : 1;
  const showPagination = activeData && activeData.total > limit;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {selectedUser && (
              <Button variant="ghost" size="sm" onClick={handleBackToUsers} className="mr-1">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <div className="p-2 rounded-lg bg-emerald-100">
              <Coins className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <CardTitle>Reward transactions</CardTitle>
              <CardDescription>
                {selectedUser
                  ? `Token rewards for ${selectedUser.user.name} (newest first).`
                  : 'Select a user to view their token rewards issued on-chain or from automated usage.'}
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
          ) : !selectedUser ? (
            users.length === 0 ? (
              <p className="text-gray-600 py-8 text-center">No reward transactions yet.</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Transactions</TableHead>
                        <TableHead className="text-right">Total kWh</TableHead>
                        <TableHead className="text-right">Total tokens</TableHead>
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
                            {row.transactionCount}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {Number(row.totalKwh).toLocaleString(undefined, {
                              maximumFractionDigits: 4,
                            })}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {Number(row.totalTokens).toLocaleString(undefined, {
                              maximumFractionDigits: 6,
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
                {showPagination && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={usersData!.total}
                    loading={loading}
                    onPageChange={setPage}
                  />
                )}
              </>
            )
          ) : transactions.length === 0 ? (
            <p className="text-gray-600 py-8 text-center">No reward transactions for this user.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
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
                    {transactions.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs">{row.id}</TableCell>
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
              {showPagination && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={transactionsData!.total}
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
