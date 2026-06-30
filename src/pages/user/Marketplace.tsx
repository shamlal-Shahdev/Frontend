import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceApi, MarketplaceCoupon } from '@/api/marketplace.api';
import { CouponTicketCard } from '@/components/marketplace/CouponTicketCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Loader2, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 6;

export const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<MarketplaceCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const couponData = await marketplaceApi.getCoupons();
        setCoupons(couponData);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || 'Failed to load coupons';
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [toast]);

  const sortedCoupons = useMemo(
    () =>
      [...coupons].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      ),
    [coupons],
  );

  const totalPages = Math.max(1, Math.ceil(sortedCoupons.length / PAGE_SIZE));

  const paginatedCoupons = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedCoupons.slice(start, start + PAGE_SIZE);
  }, [sortedCoupons, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleBuy = async (coupon: MarketplaceCoupon) => {
    setPurchasingId(coupon.id);
    try {
      const result = await marketplaceApi.purchaseCoupon(coupon.id);
      navigate('/marketplace/purchase-success', {
        state: {
          vendorName: result.vendorName,
          purchaseDate: result.purchase.purchaseDate,
          expiryDate: result.expiryDate,
          tokensUsed: result.purchase.tokensUsed,
          txHash: result.txHash,
          blockNumber: result.blockNumber,
        },
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to purchase coupon';
      toast({ title: 'Purchase failed', description: message, variant: 'destructive' });
    } finally {
      setPurchasingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-green-600" />
            Marketplace
          </h1>
          <p className="text-gray-500 mt-1">
            Browse and purchase coupons using your WATT tokens
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate('/marketplace/my-coupons')}>
          <Ticket className="w-4 h-4 mr-2" />
          My Coupons
        </Button>
      </div>

      {sortedCoupons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No coupons available at the moment. Check back soon!
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCoupons.map((coupon) => (
              <CouponTicketCard
                key={coupon.id}
                coupon={coupon}
                purchasing={purchasingId === coupon.id}
                onBuy={handleBuy}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-gray-600 min-w-[100px] text-center">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
