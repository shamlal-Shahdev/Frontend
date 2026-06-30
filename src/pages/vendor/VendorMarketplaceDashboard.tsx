import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceApi, VendorMarketplaceStats } from '@/api/marketplace.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingBag,
  Ticket,
  Wallet,
  Clock,
  Loader2,
  Plus,
  Settings,
  ArrowRight,
  Tag,
} from 'lucide-react';

export const VendorMarketplaceDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<VendorMarketplaceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await marketplaceApi.getVendorStats();
        setStats(data);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || 'Failed to load marketplace stats';
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [toast]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const totalCoupons = stats?.totalCoupons ?? 0;
  const hasNoCoupons = totalCoupons === 0;

  const cards = [
    {
      title: 'Total Coupons',
      value: totalCoupons,
      icon: Ticket,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Total Coupons Sold',
      value: stats?.totalCouponsSold ?? 0,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Wallet Balance',
      value: `${Math.round(stats?.walletBalance ?? 0).toLocaleString()} Tokens`,
      icon: Wallet,
      color: 'text-green-600',
      bg: 'bg-green-50',
      action: {
        label: 'View Wallet',
        onClick: () => navigate('/vendor/wallet'),
      },
    },
    {
      title: 'Pending Withdrawals',
      value: stats?.pendingWithdrawals ?? 0,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      action:
        (stats?.pendingWithdrawals ?? 0) > 0
          ? {
              label: 'View Wallet',
              onClick: () => navigate('/vendor/wallet'),
            }
          : undefined,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-500 mt-1">Manage your coupons and track earnings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
                {card.action && (
                  <Button
                    variant="link"
                    className="h-auto p-0 mt-2 text-orange-600 hover:text-orange-700"
                    onClick={card.action.onClick}
                  >
                    {card.action.label}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasNoCoupons ? (
        <Card className="border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50/80 to-white">
          <CardContent className="py-16">
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
                  <Tag className="w-12 h-12 text-orange-500" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">No coupons yet</h2>
                <p className="text-gray-500 mt-2">
                  Start selling on the marketplace by creating your first coupon. Users can
                  purchase them using WATT tokens.
                </p>
              </div>
              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 px-8"
                onClick={() => navigate('/vendor/marketplace/coupons/create')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Coupon
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-orange-100 bg-orange-50/40 hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-600" />
                Create Coupon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Publish a new voucher or offer to the WattsUp marketplace.
              </p>
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => navigate('/vendor/marketplace/coupons/create')}
              >
                Create Coupon
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Manage Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                View, edit, disable or delete your published coupons.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/vendor/marketplace/coupons')}
              >
                Manage Coupons
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
