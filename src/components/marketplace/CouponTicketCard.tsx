import { useState } from 'react';
import { Loader2, Package, Calendar, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarketplaceCoupon } from '@/api/marketplace.api';
import { formatCouponOfferValue } from '@/lib/coupon-utils';
import { cn } from '@/lib/utils';

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

function formatTokens(amount: number): string {
  return Math.round(amount).toLocaleString();
}

interface CouponTicketCardProps {
  coupon: MarketplaceCoupon;
  purchasing: boolean;
  onBuy: (coupon: MarketplaceCoupon) => void;
}

export function CouponTicketCard({ coupon, purchasing, onBuy }: CouponTicketCardProps) {
  const [flipped, setFlipped] = useState(false);
  const gradient = getHeaderGradient(coupon.vendorName);
  const hasTerms = Boolean(coupon.termsAndConditions?.trim());
  const offerValue = formatCouponOfferValue(coupon.couponValue, coupon.valueType);

  const handleCardClick = () => {
    if (hasTerms) {
      setFlipped((prev) => !prev);
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuy(coupon);
  };

  return (
    <div
      className={cn('group h-full', hasTerms && 'cursor-pointer')}
      onClick={handleCardClick}
      role={hasTerms ? 'button' : undefined}
      tabIndex={hasTerms ? 0 : undefined}
      onKeyDown={(e) => {
        if (hasTerms && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setFlipped((prev) => !prev);
        }
      }}
    >
      <div className="relative h-full min-h-[340px] [perspective:1000px]">
        <div
          className={cn(
            'relative h-full min-h-[340px] w-full transition-transform duration-500 [transform-style:preserve-3d]',
            flipped && '[transform:rotateY(180deg)]',
          )}
        >
          {/* Front */}
          <div
            className={cn(
              'h-full [backface-visibility:hidden]',
              hasTerms && 'absolute inset-0',
            )}
          >
            <div className="flex flex-col h-full rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div
                className={cn(
                  'h-28 flex items-center justify-center px-4 bg-gradient-to-br',
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
                    {coupon.title}
                  </h3>
                  <Badge variant="secondary" className="shrink-0 font-semibold">
                    {offerValue}
                  </Badge>
                </div>

                <p className="text-sm text-gray-500 mb-4">{coupon.vendorName}</p>

                <div className="space-y-2 text-sm text-gray-600 flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{formatTokens(coupon.tokenCost)} Tokens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Expires: {formatDate(coupon.expiryDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-red-500 font-medium">
                      {coupon.quantity} remaining
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  onClick={handleBuyClick}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Buying...
                    </>
                  ) : (
                    'Buy Coupon'
                  )}
                </Button>

                {hasTerms && (
                  <p className="text-[10px] text-gray-400 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Tap card for terms &amp; conditions
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Back */}
          {hasTerms && (
            <div className="absolute inset-0 h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="h-full min-h-[340px] rounded-xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col">
                <p className="text-xs font-bold tracking-widest uppercase text-green-600 mb-2">
                  Terms &amp; Conditions
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-3">{coupon.vendorName}</p>
                <div className="flex-1 overflow-y-auto text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {coupon.termsAndConditions}
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-3">
                  Tap to flip back
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
