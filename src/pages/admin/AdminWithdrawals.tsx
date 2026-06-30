import { useState, useEffect } from 'react';
import { marketplaceApi, WithdrawalRequest } from '@/api/marketplace.api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, ArrowRight } from 'lucide-react';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function statusBadge(status: WithdrawalRequest['status']) {
  const config: Record<
    WithdrawalRequest['status'],
    { label: string; className: string }
  > = {
    pending: { label: 'Request Received', className: 'bg-yellow-100 text-yellow-800' },
    in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
    approved: { label: 'Successful', className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
  };
  const { label, className } = config[status];
  return (
    <Badge className={className} variant="outline">
      {label}
    </Badge>
  );
}

export const AdminWithdrawals = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const data = await marketplaceApi.getAdminWithdrawals();
      setWithdrawals(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to load withdrawals';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleProcess = async (
    id: number,
    status: 'in_progress' | 'approved' | 'rejected',
  ) => {
    setProcessingId(id);
    try {
      await marketplaceApi.processWithdrawal(id, status);
      const labels = {
        in_progress: 'marked as In Progress',
        approved: 'marked as Successful',
        rejected: 'rejected',
      };
      toast({
        title: 'Success',
        description: `Withdrawal ${labels[status]}`,
      });
      await load();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to process withdrawal';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
        <p className="text-gray-500 mt-1">
          Review vendor requests and update status: Received → In Progress → Successful
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {withdrawals.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No withdrawal requests found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{w.vendorName}</p>
                        <p className="text-xs text-gray-500">{w.vendorEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {Math.round(w.amount).toLocaleString()} Tokens
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{w.bankDetails}</TableCell>
                    <TableCell>{formatDate(w.createdAt)}</TableCell>
                    <TableCell>{statusBadge(w.status)}</TableCell>
                    <TableCell>
                      {w.status === 'pending' && (
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={processingId === w.id}
                            onClick={() => handleProcess(w.id, 'in_progress')}
                          >
                            {processingId === w.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <ArrowRight className="w-4 h-4 mr-1" />
                                In Progress
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            disabled={processingId === w.id}
                            onClick={() => handleProcess(w.id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {w.status === 'in_progress' && (
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processingId === w.id}
                            onClick={() => handleProcess(w.id, 'approved')}
                          >
                            {processingId === w.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Successful
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            disabled={processingId === w.id}
                            onClick={() => handleProcess(w.id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
