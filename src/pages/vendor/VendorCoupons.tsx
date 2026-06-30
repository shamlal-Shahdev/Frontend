import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { marketplaceApi, VendorCoupon, CouponValueType } from '@/api/marketplace.api';
import { formatCouponOfferValue } from '@/lib/coupon-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Ban } from 'lucide-react';
const couponSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const VendorCoupons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<VendorCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<VendorCoupon | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
  });

  const watchedValueType = watch('valueType');

  const loadCoupons = async () => {
    try {
      const data = await marketplaceApi.getVendorCoupons();
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

  const openEdit = (coupon: VendorCoupon) => {
    setEditingCoupon(coupon);
    reset({
      title: coupon.title,
      valueType: coupon.valueType ?? 'amount',
      couponValue: coupon.couponValue,
      tokenCost: coupon.tokenCost,
      quantity: coupon.quantity,
      expiryDate: coupon.expiryDate.split('T')[0],
      termsAndConditions: coupon.termsAndConditions ?? '',
      redemptionCode: coupon.redemptionCode ?? '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: CouponFormData) => {
    setSubmitting(true);
    try {
      if (editingCoupon) {
        await marketplaceApi.updateCoupon(editingCoupon.id, {
          ...data,
          description: data.title,
        });
        toast({ title: 'Success', description: 'Coupon updated successfully' });
        setDialogOpen(false);
        await loadCoupons();
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to save coupon';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable = async (id: number) => {
    try {
      await marketplaceApi.disableCoupon(id);
      toast({ title: 'Success', description: 'Coupon disabled' });
      await loadCoupons();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to disable coupon';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await marketplaceApi.deleteCoupon(id);
      toast({ title: 'Success', description: 'Coupon deleted' });
      await loadCoupons();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to delete coupon';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Coupon Management</h1>
        </div>
        <Button
          className="bg-orange-600 hover:bg-orange-700"
          onClick={() => navigate('/vendor/marketplace/coupons/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {coupons.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No coupons yet. Create your first coupon!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Token Cost</TableHead>
                  <TableHead>Qty / Sold</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.title}</TableCell>
                    <TableCell className="font-mono text-sm">{coupon.redemptionCode || '—'}</TableCell>
                    <TableCell>{formatCouponOfferValue(coupon.couponValue, coupon.valueType)}</TableCell>
                    <TableCell>{Math.round(coupon.tokenCost)}</TableCell>
                    <TableCell>
                      {coupon.quantity} / {coupon.sold}
                    </TableCell>
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
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(coupon)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {coupon.status === 'active' && (
                          <Button size="icon" variant="ghost" onClick={() => handleDisable(coupon.id)}>
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">Coupon Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <Label className="mb-2 block">Offer Type</Label>
              <RadioGroup
                value={watchedValueType ?? 'amount'}
                onValueChange={(v) => setValue('valueType', v as CouponValueType)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="amount" id="edit-valueType-amount" />
                  <Label htmlFor="edit-valueType-amount" className="font-normal cursor-pointer">
                    Fixed Amount (Rs.)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="edit-valueType-percentage" />
                  <Label htmlFor="edit-valueType-percentage" className="font-normal cursor-pointer">
                    Percentage (%)
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="couponValue">
                  {watchedValueType === 'percentage' ? 'Discount (%)' : 'Coupon Value (Rs.)'}
                </Label>
                <Input
                  id="couponValue"
                  type="number"
                  max={watchedValueType === 'percentage' ? 100 : undefined}
                  {...register('couponValue')}
                />
                {errors.couponValue && (
                  <p className="text-sm text-red-500">{errors.couponValue.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="tokenCost">Token Cost</Label>
                <Input id="tokenCost" type="number" {...register('tokenCost')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" {...register('quantity')} />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" type="date" {...register('expiryDate')} />
              </div>
            </div>
            <div>
              <Label htmlFor="redemptionCode">Coupon Code</Label>
              <Input
                id="redemptionCode"
                placeholder="e.g. SOLAR20"
                className="uppercase"
                {...register('redemptionCode')}
              />
              {errors.redemptionCode && (
                <p className="text-sm text-red-500">{errors.redemptionCode.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
              <Textarea id="termsAndConditions" {...register('termsAndConditions')} />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Update Coupon'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
