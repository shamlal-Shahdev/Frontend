import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { marketplaceApi, CouponValueType } from '@/api/marketplace.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Loader2,
  Tag,
  Coins,
  Calendar,
  Package,
  Send,
  KeyRound,
} from 'lucide-react';

const couponSchema = z
  .object({
    valueType: z.enum(['amount', 'percentage']),
    couponValue: z.coerce.number().min(1),
    tokenCost: z.coerce.number().min(1),
    quantity: z.coerce.number().min(1),
    expiryDate: z.string().min(1, 'Expiry date is required'),
    termsAndConditions: z.string().min(1, 'Terms are required'),
    redemptionCode: z.string().min(1, 'Coupon code is required').max(64),
  })
  .refine((data) => data.valueType !== 'percentage' || data.couponValue <= 100, {
    message: 'Percentage must be between 1 and 100',
    path: ['couponValue'],
  });

type CouponFormData = z.infer<typeof couponSchema>;

function todayDateInputValue(): string {
  return new Date().toISOString().split('T')[0];
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-600">
      {children}
    </h3>
  );
}

export const VendorCreateCoupon = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [vendorName, setVendorName] = useState('Your Store');
  const [tokenCostTouched, setTokenCostTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      valueType: 'amount' as CouponValueType,
      couponValue: 500,
      tokenCost: 500,
      quantity: 10,
      expiryDate: '',
      termsAndConditions: '',
      redemptionCode: '',
    },
  });

  const watched = watch();
  const termsLength = watched.termsAndConditions?.length ?? 0;

  useEffect(() => {
    const loadVendor = async () => {
      try {
        const { authApi } = await import('@/api/auth.api');
        const user = await authApi.getCurrentUser();
        const name =
          (user as { companyName?: string | null }).companyName ||
          user.name ||
          'Your Store';
        setVendorName(name);
      } catch {
        setVendorName('Your Store');
      }
    };
    void loadVendor();
  }, []);

  useEffect(() => {
    if (!tokenCostTouched && watched.couponValue) {
      setValue('tokenCost', watched.couponValue);
    }
  }, [watched.couponValue, tokenCostTouched, setValue]);

  const onSubmit = async (data: CouponFormData) => {
    setSubmitting(true);
    try {
      await marketplaceApi.createCoupon({
        ...data,
        title: vendorName,
        description: vendorName,
      });
      toast({ title: 'Success', description: 'Coupon published successfully' });
      navigate('/vendor/marketplace/coupons');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to create coupon';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'h-11 focus-visible:ring-orange-500';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Create Coupon</h1>
          <p className="text-sm text-gray-500">
            Publish a new offer to the WattsUp marketplace
          </p>
        </div>
        <div className="hidden sm:flex w-10 h-10 rounded-full bg-orange-100 items-center justify-center shrink-0">
          <Tag className="w-5 h-5 text-orange-600" />
        </div>
      </div>

      <Card className="border-orange-100 shadow-sm overflow-hidden border-t-4 border-t-orange-500">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b pb-4">
            <CardTitle className="text-lg">Coupon Details</CardTitle>
            <p className="text-sm text-gray-500">Fill in the information for your new coupon</p>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="pt-6 space-y-8">
              <div className="rounded-lg border border-orange-100 bg-orange-50/60 px-4 py-3">
                <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">
                  Coupon Title
                </p>
                <p className="text-base font-semibold text-gray-900">{vendorName}</p>
              </div>

              <section className="space-y-4">
                <SectionHeading>Pricing &amp; Stock</SectionHeading>
                <div>
                  <Label className="mb-2 block">Offer Type</Label>
                  <RadioGroup
                    value={watched.valueType}
                    onValueChange={(v) => setValue('valueType', v as CouponValueType)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="amount" id="valueType-amount" />
                      <Label htmlFor="valueType-amount" className="font-normal cursor-pointer">
                        Fixed Amount (Rs.)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="valueType-percentage" />
                      <Label htmlFor="valueType-percentage" className="font-normal cursor-pointer">
                        Percentage (%)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="couponValue">
                      {watched.valueType === 'percentage' ? 'Discount (%)' : 'Coupon Value (Rs.)'}
                    </Label>
                    <div className="relative mt-1.5">
                      {watched.valueType === 'amount' && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                          Rs.
                        </span>
                      )}
                      {watched.valueType === 'percentage' && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                          %
                        </span>
                      )}
                      <Input
                        id="couponValue"
                        type="number"
                        max={watched.valueType === 'percentage' ? 100 : undefined}
                        className={cn(inputClass, watched.valueType === 'amount' && 'pl-10')}
                        {...register('couponValue')}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      {watched.valueType === 'percentage'
                        ? 'Discount percentage shown on the coupon'
                        : 'Face value of the voucher'}
                    </p>
                    {errors.couponValue && (
                      <p className="text-sm text-red-500 mt-1">{errors.couponValue.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="tokenCost">Token Cost</Label>
                    <div className="relative mt-1.5">
                      <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                      <Input
                        id="tokenCost"
                        type="number"
                        className={cn(inputClass, 'pl-10')}
                        {...register('tokenCost', {
                          onChange: () => setTokenCostTouched(true),
                        })}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      Users will pay this many WATT tokens
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="relative mt-1.5 max-w-xs">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="quantity"
                      type="number"
                      className={cn(inputClass, 'pl-10')}
                      {...register('quantity')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    How many times this coupon can be purchased
                  </p>
                </div>
                <div>
                  <Label htmlFor="redemptionCode">Coupon Code</Label>
                  <div className="relative mt-1.5 max-w-md">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                    <Input
                      id="redemptionCode"
                      placeholder="e.g. SOLAR20"
                      className={cn(inputClass, 'pl-10 uppercase')}
                      {...register('redemptionCode')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Buyers will see this code only after purchase in My Coupons
                  </p>
                  {errors.redemptionCode && (
                    <p className="text-sm text-red-500 mt-1">{errors.redemptionCode.message}</p>
                  )}
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <SectionHeading>Validity</SectionHeading>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <div className="relative mt-1.5 max-w-xs">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="expiryDate"
                      type="date"
                      min={todayDateInputValue()}
                      className={cn(inputClass, 'pl-10')}
                      {...register('expiryDate')}
                    />
                  </div>
                  {errors.expiryDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.expiryDate.message}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="termsAndConditions">Terms &amp; Conditions</Label>
                    <span className="text-xs text-gray-400">{termsLength} characters</span>
                  </div>
                  <Textarea
                    id="termsAndConditions"
                    placeholder="Valid for one-time use only..."
                    className="mt-1.5 min-h-[100px] focus-visible:ring-orange-500"
                    {...register('termsAndConditions')}
                  />
                  {errors.termsAndConditions && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.termsAndConditions.message}
                    </p>
                  )}
                </div>
              </section>
            </CardContent>

            <div className="border-t bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sticky bottom-0">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/vendor/marketplace')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publish Coupon
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
    </div>
  );
};
