import { useState, useEffect } from 'react';
import { walletBalanceApi, WalletBalance } from '@/api/wallet-balance.api';
import { userWalletApi } from '@/api/user-wallet.api';
import { kycApi } from '@/api/kyc.api';
import { rewardTransactionApi, RewardTransaction } from '@/api/reward-transaction.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet as WalletIcon, 
  RefreshCw, 
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ShieldCheck,
  ExternalLink,
  Gift,
  Zap,
} from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const Wallet = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string>('none');
  const [rewards, setRewards] = useState<RewardTransaction[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [balanceData, walletData, kycRes, rewardsRes] = await Promise.all([
        walletBalanceApi.syncMyBalance().catch(() => walletBalanceApi.getMyBalance()),
        userWalletApi.getMyWallet().catch(() => ({ address: null })),
        kycApi.getStatus().catch(() => ({ status: 'none' as const })),
        rewardTransactionApi.getMyRewards(1, 50).catch(() => ({ data: [] })),
      ]);

      setBalance(balanceData);
      setWalletAddress(walletData.address);
      setKycStatus(kycRes.status);
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

  const handleConnectMetaMask = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: 'MetaMask Not Detected',
        description: 'Please install the MetaMask browser extension to connect your wallet.',
        variant: 'destructive',
      });
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No Ethereum account selected in MetaMask');
      }

      const connectedAddress = accounts[0];
      await userWalletApi.connectWallet(connectedAddress);

      setWalletAddress(connectedAddress);
      toast({
        title: 'MetaMask Connected Successfully! 🎉',
        description: `Wallet ${connectedAddress.substring(0, 6)}...${connectedAddress.substring(connectedAddress.length - 4)} linked to your account.`,
      });

      // Refresh wallet balance
      const balanceData = await walletBalanceApi.syncMyBalance().catch(() => walletBalanceApi.getMyBalance());
      setBalance(balanceData);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to connect MetaMask wallet';
      toast({
        title: 'Wallet Connection Failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
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

  const isKycApproved = kycStatus.toLowerCase() === 'approved';

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-500 mt-1">View your blockchain rewards, connect MetaMask, and manage WATT tokens</p>
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

        {/* MetaMask Connection Box */}
        {!walletAddress ? (
          <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400 flex items-center justify-center shrink-0">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                      alt="MetaMask Logo" 
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">Connect MetaMask Wallet</h3>
                      {isKycApproved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" /> KYC Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                          KYC Status: {kycStatus.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {isKycApproved 
                        ? 'Connect your MetaMask public wallet address to receive monthly WATT reward tokens directly to your blockchain wallet.'
                        : 'Your KYC approval is required to link your MetaMask wallet and receive monthly energy rewards.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  <Button
                    onClick={handleConnectMetaMask}
                    disabled={connecting || !isKycApproved}
                    className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Connecting MetaMask...
                      </>
                    ) : (
                      <>
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                          alt="MetaMask" 
                          className="w-5 h-5"
                        />
                        Connect MetaMask Wallet
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-emerald-200 bg-emerald-50/50">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Connected MetaMask Address</span>
                      <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                        On-Chain Linked
                      </span>
                    </div>
                    <p className="font-mono text-sm text-gray-900 font-semibold break-all">{walletAddress}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(walletAddress)}
                    className="flex items-center gap-1.5 text-xs border-emerald-300 hover:bg-emerald-100"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Address
                  </Button>
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

        {/* Monthly Reward Distribution History */}
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
