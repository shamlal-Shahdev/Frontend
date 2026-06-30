import { useState, useEffect } from 'react';
import { marketplaceApi, MyCoupon } from '@/api/marketplace.api';
import { MyCouponCard } from '@/components/marketplace/MyCouponCard';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const MyCoupons = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<MyCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCoupons = async () => {
    try {
      const data = await marketplaceApi.getMyCoupons();
      setCoupons(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to load coupons';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCoupons();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Coupons</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tap a coupon to reveal your code and copy it
        </p>
      </div>
      <div className="mt-6">
          {coupons.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              You haven&apos;t purchased any coupons yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <MyCouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          )}
      </div>
    </div>
  );
};
