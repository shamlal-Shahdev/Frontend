import { CouponValueType } from '@/api/marketplace.api';

export function formatCouponOfferValue(
  couponValue: number,
  valueType?: CouponValueType,
): string {
  if (valueType === 'percentage') {
    return `${couponValue}%`;
  }
  return `Rs. ${couponValue}`;
}
