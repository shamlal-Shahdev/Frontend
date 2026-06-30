import { useState, useEffect } from 'react';
import { marketplaceApi, AdminMarketplaceStats, MarketplaceCoupon } from '@/api/marketplace.api';
import { formatCouponOfferValue } from '@/lib/coupon-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  ShoppingBag,
  Store,
  Ticket,
  Coins,
  Clock,
  Loader2,
  Ban,
} from 'lucide-react';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const AdminMarketplace = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminMarketplaceStats | null>(null);
  const [coupons, setCoupons] = useState<MarketplaceCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [disablingId, setDisablingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const [statsData, couponsData] = await Promise.all([
        marketplaceApi.getAdminStats(),
        marketplaceApi.getAdminCoupons(),
      ]);
      setStats(statsData);
      setCoupons(couponsData);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to load marketplace data';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDisable = async (id: number) => {
    setDisablingId(id);
    try {
      await marketplaceApi.adminDisableCoupon(id);
      toast({ title: 'Success', description: 'Coupon disabled' });
      await load();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to disable coupon';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setDisablingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const kpiCards = [
    { title: 'Total Coupons', value: stats?.totalCoupons ?? 0, icon: Ticket },
    { title: 'Total Vendors', value: stats?.totalVendors ?? 0, icon: Store },
    { title: 'Coupons Sold', value: stats?.couponsSold ?? 0, icon: ShoppingBag },
    {
      title: 'Tokens Redeemed',
      value: Math.round(stats?.tokensRedeemed ?? 0).toLocaleString(),
      icon: Coins,
    },
    {
      title: 'Pending Withdrawals',
      value: stats?.pendingWithdrawRequests ?? 0,
      icon: Clock,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Marketplace Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor coupons and marketplace activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {card.title}
                </CardTitle>
                <Icon className="w-5 h-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No coupons found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Token Cost</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.title}</TableCell>
                    <TableCell>{coupon.vendorName}</TableCell>
                    <TableCell>{formatCouponOfferValue(coupon.couponValue, coupon.valueType)}</TableCell>
                    <TableCell>{Math.round(coupon.tokenCost)}</TableCell>
                    <TableCell>{coupon.quantity}</TableCell>
                    <TableCell>{formatDate(coupon.expiryDate)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={coupon.status === 'active' ? 'default' : 'secondary'}
                        className={
                          coupon.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {coupon.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {coupon.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          disabled={disablingId === coupon.id}
                          onClick={() => handleDisable(coupon.id)}
                        >
                          {disablingId === coupon.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Ban className="w-4 h-4 mr-1" />
                              Disable
                            </>
                          )}
                        </Button>
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
