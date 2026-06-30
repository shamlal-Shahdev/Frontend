import { useState } from 'react';
import { Copy, Check, Calendar, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MyCoupon } from '@/api/marketplace.api';
import { formatCouponOfferValue } from '@/lib/coupon-utils';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const HEADER_GRADIENTS = [
  'from-emerald-500 via-green-500 to-teal-600',
  'from-orange-400 via-amber-500 to-yellow-500',
  'from-sky-500 via-blue-500 to-indigo-600',
  'from-rose-500 via-red-500 to-orange-500',
  'from-violet-500 via-purple-500 to-fuchsia-600',
  'from-cyan-500 via-teal-500 to-emerald-600',
];

function getHeaderGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return HEADER_GRADIENTS[Math.abs(hash) % HEADER_GRADIENTS.length];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function statusBadgeClass(status: MyCoupon['status']) {
  const variants: Record<MyCoupon['status'], string> = {
    active: 'bg-green-100 text-green-800',
    used: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
  };
  return variants[status];
}

interface MyCouponCardProps {
  coupon: MyCoupon;
}

export function MyCouponCard({ coupon }: MyCouponCardProps) {
  const { toast } = useToast();
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const gradient = getHeaderGradient(coupon.vendorName);
  const offerValue = formatCouponOfferValue(coupon.couponValue, coupon.valueType);

  const handleFlip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFlipped((prev) => !prev);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(coupon.couponCode);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Coupon code copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Error', description: 'Failed to copy code', variant: 'destructive' });
    }
  };

  return (
    <div className="group h-full">
      <div className="relative h-full min-h-[340px] [perspective:1000px]">
        <div
          className={cn(
            'relative h-full min-h-[340px] w-full transition-transform duration-500 [transform-style:preserve-3d]',
            flipped && '[transform:rotateY(180deg)]',
          )}
        >
          {/* Front */}
          <div className="absolute inset-0 h-full [backface-visibility:hidden]">
            <div className="flex flex-col h-full min-h-[340px] rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div
                className={cn(
                  'h-28 flex items-center justify-center px-4 bg-gradient-to-br shrink-0',
                  gradient,
                )}
              >
                <p className="text-white font-bold text-xl text-center leading-tight drop-shadow-sm uppercase tracking-wide">
                  {coupon.vendorName}
                </p>
              </div>

              <div className="flex flex-col flex-1 p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
                    {coupon.couponTitle}
                  </h3>
                  <Badge variant="secondary" className="shrink-0 font-semibold">
                    {offerValue}
                  </Badge>
                </div>

                <p className="text-sm text-gray-500 mb-2">{coupon.vendorName}</p>

                <div className="flex items-center gap-2 mb-4">
                  <Badge className={statusBadgeClass(coupon.status)} variant="outline">
                    {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600 flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Expires: {formatDate(coupon.expiryDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Purchased: {formatDate(coupon.purchaseDate)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  onClick={handleFlip}
                >
                  View Code
                </Button>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="h-full min-h-[340px] rounded-xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold tracking-widest uppercase text-green-600 mb-1">
                Your Coupon Code
              </p>
              <p className="text-sm text-gray-500 mb-4">{coupon.vendorName}</p>
              <p className="font-mono font-bold text-2xl tracking-wider text-gray-900 mb-4 break-all px-2">
                {coupon.couponCode}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-gray-500"
                onClick={handleFlip}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
