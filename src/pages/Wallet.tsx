import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, TrendingUp, ArrowUpRight, Coins, History } from "lucide-react";
import { useEffect, useState } from "react";

import { useToast } from "@/hooks/use-toast";

const WalletPage = () => {
  const { toast } = useToast();
  const [walletData, setWalletData] = useState({
    zabCoinBalance: 0,
    totalEarned: 0
  });
  const [redeemAmount, setRedeemAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your wallet",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('wallet_balances')
        .select('zab_coin_balance, total_earned')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setWalletData({
          zabCoinBalance: Number(data.zab_coin_balance) || 0,
          totalEarned: Number(data.total_earned) || 0
        });
      }
    } catch (error: any) {
      console.error('Error fetching wallet:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    const amount = parseFloat(redeemAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to redeem",
        variant: "destructive"
      });
      return;
    }

    if (amount > walletData.zabCoinBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough ZABcoins to redeem this amount",
        variant: "destructive"
      });
      return;
    }

    setRedeeming(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // In a real app, this would call a backend function to process redemption
      // For now, we'll just show a success message
      toast({
        title: "Redemption request submitted",
        description: `Your request to redeem ${amount} ZABcoins has been submitted for processing.`
      });
      
      setRedeemAmount("");
    } catch (error: any) {
      console.error('Error redeeming:', error);
      toast({
        title: "Redemption failed",
        description: error.message || "Failed to process redemption",
        variant: "destructive"
      });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight">My Wallet</h1>
            <p className="text-muted-foreground">
              Manage your ZABcoins and earnings
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-card animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 energy-glow">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  Current Balance
                </CardTitle>
                <CardDescription>Available ZABcoins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {loading ? "..." : walletData.zabCoinBalance.toLocaleString()}
                  <span className="text-xl text-muted-foreground ml-2">ZAB</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card animate-slide-up" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent energy-glow">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Total Earned
                </CardTitle>
                <CardDescription>Lifetime earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {loading ? "..." : walletData.totalEarned.toLocaleString()}
                  <span className="text-xl text-muted-foreground ml-2">ZAB</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Redeem Section */}
          <Card className="glass-card animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Redeem ZABcoins
              </CardTitle>
              <CardDescription>
                Convert your ZABcoins to rewards (1 ZAB = $0.01 USD equivalent)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="redeem-amount">Amount to Redeem</Label>
                <div className="flex gap-2">
                  <Input
                    id="redeem-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    disabled={loading || redeeming}
                    min="0"
                    max={walletData.zabCoinBalance}
                  />
                  <Button
                    onClick={handleRedeem}
                    disabled={loading || redeeming || !redeemAmount}
                    className="whitespace-nowrap"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    {redeeming ? "Processing..." : "Redeem"}
                  </Button>
                </div>
                {redeemAmount && !isNaN(parseFloat(redeemAmount)) && (
                  <p className="text-sm text-muted-foreground">
                    ≈ ${(parseFloat(redeemAmount) * 0.01).toFixed(2)} USD
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <h4 className="font-medium">Available Balance</h4>
                <p className="text-2xl font-bold">
                  {walletData.zabCoinBalance.toLocaleString()} ZAB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History Placeholder */}
          <Card className="glass-card animate-slide-up" style={{ animationDelay: "300ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet. Start earning by verifying your energy generation!
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default WalletPage;
