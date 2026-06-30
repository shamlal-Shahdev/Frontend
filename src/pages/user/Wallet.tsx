import { useState, useEffect } from 'react';
import { walletBalanceApi, WalletBalance } from '@/api/wallet-balance.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet as WalletIcon, 
  RefreshCw, 
  Award,
  Clock,
  Loader2,
} from 'lucide-react';

export const Wallet = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    loadBalance();
  }, []);
  const loadBalance = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await walletBalanceApi.syncMyBalance().catch(() =>
        walletBalanceApi.getMyBalance(),
      );
      setBalance(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load wallet balance';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSync = async () => {
    setSyncing(true);
    setError('');
    try {
      const data = await walletBalanceApi.syncMyBalance();
      setBalance(data);
      toast({
        title: 'Success',
        description: 'Wallet balance synced successfully from blockchain',
        variant: 'default',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to sync wallet balance';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };
  const formatBalance = (balance: string | number): string => {
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (isNaN(numBalance)) return '0.00';
    return numBalance.toFixed(2);
  };
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <div className="text-lg text-gray-600">Loading wallet balance...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-500 mt-1">View your rewards and token balance</p>
        </div>
        {error && !balance && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="text-red-600">⚠️</div>
                <div>
                  <p className="font-semibold text-red-900">Error loading wallet</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <Card className="lg:col-span-2 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <WalletIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Wallet Balance</CardTitle>
                    <CardDescription>Your current token balance</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Sync
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {}
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600 mb-2">Total Balance</p>
                  <h2 className="text-5xl font-bold text-gray-900 mb-2">
                    {balance ? formatBalance(balance.balance) : '0.00'}
                  </h2>
                  <p className="text-lg text-gray-600"></p>
                </div>
                {}
                {balance && (
                  <div className="pt-6 border-t space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Last Updated
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatDate(balance.updatedAt)}
                      </span>
                    </div>
                    
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {}
          <div className="space-y-6">
            {}
            {balance && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">Wallet Active</p>
                      <p className="text-xs text-green-700 mt-1">
                        Your wallet is synced with the blockchain
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
