import { useState, useEffect } from 'react';
import { walletBalanceApi, WalletBalance } from '@/api/wallet-balance.api';
import { rewardTransactionApi, RewardTransaction } from '@/api/reward-transaction.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet as WalletIcon, 
  RefreshCw, 
  Clock,
  Loader2,
  AlertCircle,
  Copy,
  ExternalLink,
  Gift,
  Zap,
} from 'lucide-react';

export const Wallet = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [rewards, setRewards] = useState<RewardTransaction[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [balanceData, rewardsRes] = await Promise.all([
        walletBalanceApi.syncMyBalance().catch(() => walletBalanceApi.getMyBalance()),
        rewardTransactionApi.getMyRewards(1, 50).catch(() => ({ data: [] })),
      ]);

      setBalance(balanceData);
      setRewards(rewardsRes.data || []);
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
      const rewardsRes = await rewardTransactionApi.getMyRewards(1, 50).catch(() => ({ data: [] }));
      setRewards(rewardsRes.data || []);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Address Copied',
      description: 'Copied to clipboard',
    });
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[250px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <div className="text-lg text-gray-600">Loading wallet info...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-500 mt-1">View your blockchain rewards and manage WATT tokens</p>
        </div>

        {error && !balance && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Error loading wallet</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Balance Card */}
        <Card className="w-full border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <WalletIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">WATT Token Balance</CardTitle>
                  <CardDescription>Your current on-chain token balance</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 border-green-300 hover:bg-green-100"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Sync Blockchain
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Available WATT Tokens</p>
                <h2 className="text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
                  {balance ? formatBalance(balance.balance) : '0.00'}{' '}
                  <span className="text-2xl font-bold text-green-600">WATT</span>
                </h2>
              </div>

              {balance && (
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Synced
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

        Monthly Reward Distribution History
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-gray-50/50 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg">Monthly Reward Distribution History</CardTitle>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Total Rewarded Events: {rewards.length}
              </span>
            </div>
            <CardDescription>
              On-chain Sepolia token minting transactions credited to your account from monthly energy usage
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {rewards.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Zap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-medium">No reward distributions yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Once your energy provider uploads monthly usage data, your WATT tokens will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100/70 text-gray-700 uppercase tracking-wider text-xs border-b">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Period / Date</th>
                      <th className="py-3 px-4 font-semibold">Energy (kWh)</th>
                      <th className="py-3 px-4 font-semibold">Tokens Minted</th>
                      <th className="py-3 px-4 font-semibold">Reason</th>
                      <th className="py-3 px-4 font-semibold">Transaction Hash</th>
                      <th className="py-3 px-4 font-semibold text-right">Etherscan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rewards.map((reward) => {
                      const amount = typeof reward.tokensAmount === 'number'
                        ? reward.tokensAmount.toFixed(2)
                        : parseFloat(reward.tokensAmount || '0').toFixed(2);

                      const kwh = typeof reward.kwhRewarded === 'number'
                        ? reward.kwhRewarded.toFixed(2)
                        : parseFloat(reward.kwhRewarded || '0').toFixed(2);

                      return (
                        <tr key={reward.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-gray-900">
                            {reward.usagePeriodYearMonth ? (
                              <span className="font-semibold text-gray-800">{reward.usagePeriodYearMonth}</span>
                            ) : (
                              formatDate(reward.issuedAt)
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-gray-900">
                            {kwh} <span className="text-xs text-gray-500 font-normal">kWh</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600">
                            +{amount} <span className="text-xs font-semibold text-emerald-700">WATT</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-gray-600 capitalize">
                            {reward.reason ? reward.reason.replace(/_/g, ' ') : 'Monthly Usage'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs">
                            {reward.txHash ? (
                              <div className="flex items-center gap-2">
                                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded border font-semibold">
                                  {reward.txHash.substring(0, 8)}...{reward.txHash.substring(reward.txHash.length - 6)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(reward.txHash!)}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-700"
                                  title="Copy Tx Hash"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Off-chain / Pending</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {reward.txHash ? (
                              <a
                                href={`https://sepolia.etherscan.io/tx/${reward.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 transition-colors"
                              >
                                View on Sepolia <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
