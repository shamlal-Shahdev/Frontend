import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface PurchaseSuccessState {
  vendorName: string;
  purchaseDate: string;
  expiryDate: string;
  tokensUsed: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const PurchaseSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PurchaseSuccessState | null;

  if (!state) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">No purchase information found.</p>
        <Button onClick={() => navigate('/marketplace')}>Go to Marketplace</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardContent className="pt-10 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Congratulations!</h1>
            <p className="text-gray-600 mt-2">Coupon Purchased Successfully.</p>
            <p className="text-sm text-gray-500 mt-1">
              {Math.round(state.tokensUsed)} Tokens have been deducted from your wallet.
            </p>
            <p className="text-sm text-green-700 mt-3 font-medium">
              Go to My Coupons and tap your coupon to reveal the code.
            </p>
          </div>

          <div className="bg-white rounded-lg border p-4 space-y-3 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vendor</span>
              <span className="font-medium">{state.vendorName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Purchase Date</span>
              <span>{formatDate(state.purchaseDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Expiry Date</span>
              <span>{formatDate(state.expiryDate)}</span>
            </div>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => navigate('/marketplace/my-coupons')}
          >
            View My Coupons
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
