import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  marketplaceApi,
  VendorWalletInfo,
  WithdrawalRequest,
} from '@/api/marketplace.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const withdrawSchema = z.object({
  amount: z.coerce.number().min(1),
  bankDetails: z.string().min(1, 'Bank details are required'),
});

type WithdrawFormData = z.infer<typeof withdrawSchema>;

const STATUS_STEPS = [
  { key: 'received', label: 'Request Received' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'successful', label: 'Successful' },
] as const;

function stepIndex(status: WithdrawalRequest['status']): number {
  if (status === 'pending') return 0;
  if (status === 'in_progress') return 1;
  if (status === 'approved') return 2;
  return -1;
}

function WithdrawalStatusTracker({ withdrawal }: { withdrawal: WithdrawalRequest }) {
  if (withdrawal.status === 'rejected') {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        Rejected
      </Badge>
    );
  }

  const activeStep = stepIndex(withdrawal.status);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STATUS_STEPS.map((step, index) => {
        const done = index < activeStep;
        const current = index === activeStep;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full',
                done && 'bg-green-50 text-green-700',
                current && 'bg-orange-50 text-orange-700',
                !done && !current && 'bg-gray-50 text-gray-400',
              )}
            >
              {done ? (
                <Check className="w-3 h-3" />
              ) : (
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    current ? 'bg-orange-500' : 'bg-gray-300',
                  )}
                />
              )}
              {step.label}
            </div>
            {index < STATUS_STEPS.length - 1 && (
              <span className="text-gray-300 text-xs">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const VendorWallet = () => {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<VendorWalletInfo | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
  });

  const loadData = async () => {
    try {
      const [walletData, withdrawalHistory] = await Promise.all([
        marketplaceApi.getVendorWallet(),
        marketplaceApi.getVendorWithdrawals(),
      ]);
      setWallet(walletData);
      setWithdrawals(withdrawalHistory);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to load wallet';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleWithdrawClick = () => {
    const balance = wallet?.balance ?? 0;
    const minimum = wallet?.withdrawalMinimum ?? 5000;

    if (balance < minimum) {
      toast({
        title: 'Insufficient balance',
        description: `Minimum ${minimum.toLocaleString()} tokens required for withdrawal.`,
        variant: 'destructive',
      });
      return;
    }

    if (wallet?.hasActiveWithdrawal) {
      toast({
        title: 'Active request exists',
        description: 'You already have a withdrawal request in progress.',
        variant: 'destructive',
      });
      return;
    }

    setDialogOpen(true);
  };

  const onSubmit = async (data: WithdrawFormData) => {
    const balance = wallet?.balance ?? 0;
    if (data.amount > balance) {
      toast({
        title: 'Insufficient balance',
        description: 'Withdrawal amount exceeds your current balance.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await marketplaceApi.requestWithdrawal(data);
      toast({ title: 'Success', description: 'Withdrawal request submitted' });
      setDialogOpen(false);
      reset();
      await loadData();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to submit withdrawal';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-orange-600" />
            Vendor Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="text-4xl font-bold text-orange-700">
              {Math.round(wallet?.balance ?? 0).toLocaleString()} Tokens
            </p>
          </div>

          <Button
            className="w-full bg-orange-600 hover:bg-orange-700"
            onClick={handleWithdrawClick}
          >
            Withdraw
          </Button>

          <p className="text-sm text-center text-gray-500">
            Minimum balance of {wallet?.withdrawalMinimum?.toLocaleString()} tokens
            required for withdrawal.
          </p>
        </CardContent>
      </Card>

      {withdrawals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Withdrawal Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="border border-gray-100 rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {Math.round(w.amount).toLocaleString()} Tokens
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(w.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <WithdrawalStatusTracker withdrawal={w} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <Input
                id="amount"
                type="number"
                {...register('amount')}
                placeholder={`Max: ${Math.round(wallet?.balance ?? 0)}`}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="bankDetails">Wallet / Bank Details</Label>
              <Textarea
                id="bankDetails"
                {...register('bankDetails')}
                placeholder="Bank name, account number, account holder name..."
              />
              {errors.bankDetails && (
                <p className="text-sm text-red-500">{errors.bankDetails.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
